import { Outlet } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

function Layout() {
    return (
        <div>
            <NavbarComponent />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
