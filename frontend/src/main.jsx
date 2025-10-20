import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import Layout from './components/Layout.jsx'
import ChatLayout from './components/ChatLayout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> }
    ]
  }, 
  {
    path: '/dashboard',
    element: <ChatLayout/>,
    children: [
      {index: true, element: <ProfilePage/>}
    ]
  }]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
