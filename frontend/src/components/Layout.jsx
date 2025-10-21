import { Outlet, useLocation } from 'react-router-dom';
import ChatInterface from './ChatInterface';

function Layout() {
  const location = useLocation();
  const showChatUI = location.pathname.startsWith('/dashboard');

  return (
    <div>
      {showChatUI && <ChatInterface />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;