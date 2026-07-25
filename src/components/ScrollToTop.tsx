import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Routes that manage their own scroll behavior (e.g. /admin uses a sidebar
// with internal navigation and wants to preserve scroll when the browser
// tab refocuses or the URL's `?section=` query updates in place). Adding
// a route here opts it out of the site-wide "always scroll to top on
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
