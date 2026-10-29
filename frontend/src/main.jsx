import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';
import { Spinner } from './components/ui/primitives';

import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import PackageDetailPage from './pages/PackageDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import ContentPage from './pages/ContentPage';
import PaymentSimulatePage from './pages/PaymentSimulatePage';
import NotFoundPage from './pages/NotFoundPage';

import AuthLayout from './pages/auth/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

import AccountLayout from './pages/account/AccountLayout';
import AccountProfilePage from './pages/account/AccountProfilePage';
import AccountSecurityPage from './pages/account/AccountSecurityPage';
import AccountBookingsPage from './pages/account/AccountBookingsPage';
import AccountBookingDetailPage from './pages/account/AccountBookingDetailPage';

import { Suspense, lazy } from 'react';
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminBookingDetailPage = lazy(() => import('./pages/admin/AdminBookingDetailPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminPackagesPage = lazy(() => import('./pages/admin/AdminPackagesPage'));
const AdminPackageFormPage = lazy(() => import('./pages/admin/AdminPackageFormPage'));
const AdminDeparturesPage = lazy(() => import('./pages/admin/AdminDeparturesPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminStaffPage = lazy(() => import('./pages/admin/AdminStaffPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute admin>
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Spinner className="animate-spin" /></div>}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { path: 'bookings/:code', element: <AdminBookingDetailPage /> },
      { path: 'payments', element: <AdminPaymentsPage /> },
      { path: 'packages', element: <AdminPackagesPage /> },
      { path: 'packages/new', element: <AdminPackageFormPage /> },
      { path: 'packages/:id/edit', element: <AdminPackageFormPage /> },
      { path: 'departures', element: <AdminDeparturesPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'content', element: <AdminContentPage /> },
      { path: 'messages', element: <AdminMessagesPage /> },
      {
        path: 'staff',
        element: (
          <ProtectedRoute superAdmin>
            <AdminStaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute superAdmin>
            <AdminSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <ProtectedRoute superAdmin>
            <AdminAuditLogsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'packages/:slug', element: <PackageDetailPage /> },
      {
        path: 'checkout/:slug',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'terms', element: <ContentPage slug="terms" /> },
      { path: 'privacy', element: <ContentPage slug="privacy" /> },
      { path: 'cancellation', element: <ContentPage slug="cancellation" /> },
      { path: 'safety', element: <ContentPage slug="safety" /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'payment/simulate', element: <PaymentSimulatePage /> },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AccountProfilePage /> },
          { path: 'bookings', element: <AccountBookingsPage /> },
          { path: 'bookings/:code', element: <AccountBookingDetailPage /> },
          { path: 'security', element: <AccountSecurityPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
