// ──────────────────────────────────────────────────────────────
// Admin Teams – view teams, reshuffle task queues, delete teams
// ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Shuffle,
  Trash2,
  Loader2,
  Shield,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeams = () => {
    api.get('/admin/teams')
      .then(({ data }) => { setTeams(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTeams(); }, []);

  const handleReshuffle = async (id, name) => {
    if (!confirm(`Reshuffle task queue for "${name}"? Their task order will be randomized.`)) return;
    try {
      await api.put(`/admin/teams/${id}/reshuffle`);
      toast.success(`Task queue reshuffled for ${name}`);
      loadTeams();
    } catch (err) {
      toast.error('Failed to reshuffle');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete team "${name}"? All their submissions will also be deleted. This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/teams/${id}`);
      toast.success(`Team "${name}" deleted`);
      loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <Users className="text-neon-green" size={20} />
        <h1 className="text-xl font-black text-white">Teams</h1>
        <span className="text-xs text-gray-500 ml-auto">{teams.length} teams</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-neon-cyan" size={32} />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No teams registered yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map((team, i) => (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-3 flex items-center gap-3 neon-border"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-dark-900 flex-shrink-0"
                style={{ backgroundColor: team.avatarColor }}
              >
                {team.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{team.name}</p>
                  {team.role === 'admin' && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-neon-gold/20 text-neon-gold font-semibold">
                      <Shield size={8} /> Admin
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500">
                  {team.taskQueue?.length || 0} tasks in queue · Created {new Date(team.createdAt).toLocaleDateString()}
                </div>
              </div>

              {team.role !== 'admin' && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleReshuffle(team._id, team.name)}
                    className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-neon-cyan transition-colors"
                    title="Reshuffle task queue"
                  >
                    <Shuffle size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(team._id, team.name)}
                    className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-neon-pink transition-colors"
                    title="Delete team"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
