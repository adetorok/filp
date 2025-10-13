import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Properties from './components/properties/Properties';
import Deals from './components/deals/Deals';
import Expenses from './components/expenses/Expenses';
import Tasks from './components/tasks/Tasks';
import Contacts from './components/contacts/Contacts';
import Reports from './components/reports/Reports';
import Subscription from './components/subscription/Subscription';
import Help from './components/help/Help';
import ContractorMarketplace from './components/contractors/ContractorMarketplace';
import ContractorPortal from './components/contractors/ContractorPortal';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { modernTheme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <AuthProvider>
        <PropertyProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/properties" element={
                <ProtectedRoute>
                  <Layout>
                    <Properties />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/deals" element={
                <ProtectedRoute>
                  <Layout>
                    <Deals />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Layout>
                    <Expenses />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout>
                    <Tasks />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/contacts" element={
                <ProtectedRoute>
                  <Layout>
                    <Contacts />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Layout>
                    <Subscription />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Layout>
                    <Help />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/contractors" element={
                <ProtectedRoute>
                  <Layout>
                    <ContractorMarketplace />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/contractor-portal" element={
                <ProtectedRoute>
                  <Layout>
                    <ContractorPortal />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </PropertyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;