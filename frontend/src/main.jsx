import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ChatLayout from './components/ChatLayout.jsx';
import Layout from './components/Layout.jsx';
import './index.css';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyPage from './pages/VerifyPage.jsx';
import store from './redux/store.js';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify', element: <VerifyPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <ChatLayout />,
    children: [
      { index: true, element: <ProfilePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);