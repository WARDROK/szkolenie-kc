import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Feed from './pages/Feed';
import Leaderboard from './pages/Leaderboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a26',
            color: '#fff',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Tasks />} />
          <Route path="task/:id" element={<TaskDetail />} />
          <Route path="feed" element={<Feed />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
