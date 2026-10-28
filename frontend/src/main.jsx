import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';

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

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminBookingDetailPage from './pages/admin/AdminBookingDetailPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminPackageFormPage from './pages/admin/AdminPackageFormPage';
import AdminDeparturesPage from './pages/admin/AdminDeparturesPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

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
        <AdminLayout />
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
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
