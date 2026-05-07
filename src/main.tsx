import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import App from './App.tsx';
import SignIn from './pages/SuperAdmin/SignIn.tsx';
import SignUp from './pages/SuperAdmin/SignUp.tsx';
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
    path: '/whitehouse/dashboard',
    element: (
      <div style={{ padding: '2rem', color: '#fff', background: '#0d1117', minHeight: '100vh' }}>
        <h1>Super Admin Dashboard</h1>
        <p>Welcome to the control center. (Development in progress)</p>
      </div>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
