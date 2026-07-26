import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { PlansPage } from './pages/PlansPage';
import { SubscribersPage } from './pages/SubscribersPage';
import { SubscriptionDetailPage } from './pages/SubscriptionDetailPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthProvider } from './stores/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/plans" replace />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="subscribers" element={<SubscribersPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="subscriptions/:id" element={<SubscriptionDetailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
