import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// App pages
import DashboardPage from './pages/dashboard/DashboardPage';
import WorksPage from './pages/works/WorksPage';
import WorkDetailPage from './pages/works/WorkDetailPage';
import WorkersPage from './pages/workers/WorkersPage';
import WorkerDetailPage from './pages/workers/WorkerDetailPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import ReportsPage from './pages/reports/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/works" element={
            <ProtectedRoute>
              <AppLayout><WorksPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/works/:id" element={
            <ProtectedRoute>
              <AppLayout><WorkDetailPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/workers" element={
            <ProtectedRoute>
              <AppLayout><WorkersPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/workers/:id" element={
            <ProtectedRoute>
              <AppLayout><WorkerDetailPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/payments" element={
            <ProtectedRoute>
              <AppLayout><PaymentsPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/expenses" element={
            <ProtectedRoute>
              <AppLayout><ExpensesPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <AppLayout><ReportsPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-700 mb-4">404</h1>
                <p className="text-slate-500 mb-4">Page not found</p>
                <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
