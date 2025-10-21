import { Outlet } from 'react-router-dom';
import NavbarComponent from './ChatInterface';

function ChatLayout() {
    return (
        <div>
            <NavbarComponent />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default ChatLayout
