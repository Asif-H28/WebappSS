import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import App from './App.tsx';
import SignIn from './pages/SuperAdmin/SignIn.tsx';
import SignUp from './pages/SuperAdmin/SignUp.tsx';
import SuperAdminLayout from './pages/SuperAdmin/SuperAdminLayout.tsx';
import Dashboard from './pages/SuperAdmin/Dashboard.tsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/whitehouse',
    element: <SignIn />,
  },
  {
    path: '/whitehouse/signup',
    element: <SignUp />,
  },
  {
    path: '/whitehouse',
    element: <SuperAdminLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
