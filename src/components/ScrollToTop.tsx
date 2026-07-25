import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Routes that manage their own scroll behavior. /admin uses handleMenuClick
// to scroll to top only when the user deliberately picks a section, so we
// don't want this global effect competing on any admin re-render.
// Adding a route here opts it out of the site-wide "scroll to top on
// pathname change" default.
const SELF_MANAGED_SCROLL_ROUTES = ['/admin'];

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (SELF_MANAGED_SCROLL_ROUTES.some((r) => pathname.startsWith(r))) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
