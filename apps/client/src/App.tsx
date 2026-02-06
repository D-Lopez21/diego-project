import './App.css';
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import {
  Home,
  NotFound,
  SignIn,
  SignUp,
  UsersPage,
  ChangePassword,
  ResetPassword,
  CreateBillPage,
  BillDetailsPage,
  BillsPage,
} from './pages';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { ProvidersPage } from './components';

const PublicRoute = ({
  children,
  ignoreAuth = false,
}: {
  children: React.ReactNode;
  ignoreAuth?: boolean;
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ignoreAuth && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: '/bills',
      element: (
        <ProtectedRoute>
          <BillsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: 'bills/:id',
      element: (
        <ProtectedRoute>
          <BillDetailsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/create-bill',
      element: (
        <ProtectedRoute>
          <CreateBillPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/reset-password',
      element: <ResetPassword />,
    },
    {
      path: '/sign-in',
      element: (
        <PublicRoute>
          <SignIn />
        </PublicRoute>
      ),
    },
    {
      path: '/sign-up',
      element: (
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      ),
    },
    {
      path: '/users',
      element: (
        <ProtectedRoute>
          <UsersPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/change-password',
      element: (
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      ),
    },
    {
      path: '/providers',
      element: (
        <ProtectedRoute>
          <ProvidersPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/not-found',
      element: <NotFound />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return (
    <AuthProvider>
      <div className="h-full w-full">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;
