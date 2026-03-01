import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Feed from './pages/Feed';
import Leaderboard from './pages/Leaderboard';
import SideQuestGallery from './pages/SideQuestGallery'; // ← ADD
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminConfig from './pages/admin/AdminConfig';
import AdminTeams from './pages/admin/AdminTeams';
import Profile from './pages/Profile';
import AdminSideQuests from './pages/admin/AdminSideQuests';
import SideQuests from './pages/SideQuests';

function ProtectedRoute({ children }) {
  const { isAuthenticated, team } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Admin should not access team routes – redirect to admin panel
  if (team?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, team } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (team?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function CatchAll() {
  const { isAuthenticated, team } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (team?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
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

        {/* Team routes */}
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
          <Route path="sidequests" element={<SideQuests />} />
          <Route path="feed" element={<Feed />} />
          <Route path="gallery" element={<SideQuestGallery />} /> {/* ← ADD */}
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="photos" element={<AdminPhotos />} />
          <Route path="config" element={<AdminConfig />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="sidequests" element={<AdminSideQuests />} />
        </Route>

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </>
  );
}
