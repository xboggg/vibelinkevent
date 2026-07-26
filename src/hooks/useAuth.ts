import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Module-scoped session cache for the admin role.
// Keyed by user id — one lookup per user id per browser session survives
// across every useAuth() consumer and across Supabase's auth events
// (TOKEN_REFRESHED, INITIAL_SESSION, SIGNED_IN, USER_UPDATED).
// Without this cache, EACH useAuth() call site (Admin.tsx + useSessionTimeout
// + AdminAuth.tsx = 3+) refires has_role on every tab-refocus because
// Supabase's onAuthStateChange emits TOKEN_REFRESHED on window focus.
// Cleared on sign-out below so a new sign-in re-checks.
const adminRoleCache = new Map<string, boolean>();
// Also track in-flight lookups per userId so multiple simultaneous calls
// (mount time, when 3+ useAuth() run at once) share ONE RPC round-trip
// instead of each firing their own.
const adminRoleInFlight = new Map<string, Promise<boolean>>();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle password recovery event - redirect to reset password page
        if (event === 'PASSWORD_RECOVERY') {
          // Keep the hash params and redirect to reset-password page
          window.location.href = `/reset-password${window.location.hash}`;
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Determine admin role. Cache hits skip the RPC entirely; that's
        // the whole point — TOKEN_REFRESHED on tab-refocus doesn't need
        // to re-query a role we already know.
        if (session?.user) {
          const cached = adminRoleCache.get(session.user.id);
          if (cached !== undefined) {
            setIsAdmin(cached);
            setCheckingAdmin(false);
          } else {
            setCheckingAdmin(true);
            // setTimeout(0) avoids the deadlock the old code documented.
            setTimeout(() => {
              checkAdminRole(session.user.id);
            }, 0);
          }
        } else {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        const cached = adminRoleCache.get(session.user.id);
        if (cached !== undefined) {
          setIsAdmin(cached);
          setCheckingAdmin(false);
        } else {
          setCheckingAdmin(true);
          checkAdminRole(session.user.id);
        }
      } else {
        setCheckingAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      // Deduplicate concurrent requests — if another useAuth() consumer
      // is already asking, wait on their promise instead of firing another.
      let pending = adminRoleInFlight.get(userId);
      if (!pending) {
        pending = supabase
          .rpc('has_role', { _role: 'admin', _user_id: userId })
          .then(({ data, error }) => {
            if (error) throw error;
            const role = data === true;
            adminRoleCache.set(userId, role);
            return role;
          })
          .finally(() => {
            adminRoleInFlight.delete(userId);
          });
        adminRoleInFlight.set(userId, pending);
      }
      const role = await pending;
      setIsAdmin(role);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    // Wipe the role cache so a subsequent sign-in (possibly as a different
    // account) re-queries has_role rather than reusing stale data.
    adminRoleCache.clear();
    adminRoleInFlight.clear();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    checkingAdmin,
    signIn,
    signUp,
    signOut,
  };
};
