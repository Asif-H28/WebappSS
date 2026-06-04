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
import Licenses from './pages/SuperAdmin/Licenses.tsx';
import GlobalConfig from './pages/SuperAdmin/GlobalConfig.tsx';
import Tickets from './pages/SuperAdmin/Tickets.tsx';
import FeatureFlags from './pages/SuperAdmin/FeatureFlags';
import Organizations from './pages/SuperAdmin/Organizations.tsx';
import OrgAdminLogin from './pages/OrgAdmin/Login.tsx';
import SupportStaffSignup from './pages/SupportStaff/Signup.tsx';
import UnifiedDashboard from './pages/Dashboard/index.tsx';
import LibraryIndex from './pages/Library/index.tsx';
import LearningResourceIndex from './pages/LearningResource/index.tsx';
import OrganizationIndex from './pages/Organization/index.tsx';
import NotificationsIndex from './pages/Notifications/index.tsx';
import VehiclesIndex from './pages/Vehicles/index.tsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },

  {
    path: '/org/login',
    element: <OrgAdminLogin />,
  },
  {
    path: '/support-staff/signup',
    element: <SupportStaffSignup />,
  },
  {
    path: '/dashboard',
    element: <UnifiedDashboard />,
  },
  {
    path: '/organization',
    element: <OrganizationIndex />,
  },
  {
    path: '/dashboard/notifications',
    element: <NotificationsIndex />,
  },
  {
    path: '/dashboard/vehicles',
    element: <VehiclesIndex />,
  },
  {
    path: '/dashboard/library',
    element: <LibraryIndex />,
  },
  {
    path: '/dashboard/learning-resource',
    element: <LearningResourceIndex />,
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
      {
        path: 'licenses',
        element: <Licenses />,
      },
      {
        path: 'organizations',
        element: <Organizations />,
      },
      {
        path: 'config',
        element: <GlobalConfig />,
      },
      {
        path: 'tickets',
        element: <Tickets />,
      },
      {
        path: 'feature-flags',
        element: <FeatureFlags />,
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
