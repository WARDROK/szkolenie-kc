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
import { PlusCircle } from 'lucide-react';

export default function AdminTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [count, setCount] = useState(10);
  const [creating, setCreating] = useState(false);
  const [createdResults, setCreatedResults] = useState(null);

  const loadTeams = () => {
    api.get('/admin/teams')
      .then(({ data }) => { setTeams(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTeams(); }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const { data } = await api.post('/admin/teams/generate', { count });
      setCreatedResults(data);
      toast.success(`Created ${data.created.length} teams`);
      loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create teams');
    } finally {
      setCreating(false);
    }
  };

  // PDF download now uses /admin/teams/print with created entries after generation

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
        <button
          onClick={() => setShowAdd(true)}
          className="ml-3 px-3 py-2 rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 flex items-center gap-2"
          title="Add teams"
        >
          <PlusCircle size={14} /> Add Teams
        </button>
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

      {/* Add Teams Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-dark-900 rounded-2xl p-6 neon-border">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="text-neon-green" size={18} />
              <h2 className="text-lg font-bold">Add Teams</h2>
              <div className="ml-auto text-sm text-gray-400">Passwords are generated automatically</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Number of teams to generate</label>
                <input
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value || '0', 10))}
                  className="w-32 mt-2 p-2 rounded-lg bg-dark-800 text-white text-sm"
                />
              </div>

              {/* CSV upload removed — use manual textarea only */}

              {createdResults && (
                <div className="bg-dark-800 p-3 rounded-lg text-sm">
                  <div className="font-semibold mb-2">Created</div>
                  {createdResults.created.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1 border-b border-white/5">
                      <div>{c.name}</div>
                      <div className="text-xs text-gray-400">{c.password}</div>
                    </div>
                  ))}
                  {createdResults.errors?.length > 0 && (
                    <div className="mt-2 text-xs text-neon-pink">
                      Errors:
                      {createdResults.errors.map((e, i) => (
                        <div key={i}>{e.name || '<empty>'}: {e.error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button onClick={handleCreate} disabled={creating} className="px-4 py-2 bg-neon-cyan rounded-lg font-semibold">
                  {creating ? 'Creating...' : 'Create Teams'}
                </button>
                {createdResults && createdResults.created?.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        const resp = await api.post('/admin/teams/print', { entries: createdResults.created }, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'team-passwords.pdf');
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                      } catch (err) {
                        toast.error(err.response?.data?.error || 'Failed to generate PDF');
                      }
                    }}
                    className="px-4 py-2 bg-neon-gold text-dark-900 rounded-lg font-semibold"
                  >
                    Download PDF
                  </button>
                )}
                <button onClick={() => { setShowAdd(false); setCreatedResults(null); }} className="px-4 py-2 bg-dark-800 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
