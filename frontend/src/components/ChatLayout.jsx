import { Outlet } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

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
