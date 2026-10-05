import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll to top for chat pages - they handle their own scrolling
    const isChatPage = pathname === '/chat' ||
                      pathname === '/student/chat' ||
                      pathname.startsWith('/counselor/chat');

    if (!isChatPage) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;