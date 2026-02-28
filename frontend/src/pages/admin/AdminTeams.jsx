// ──────────────────────────────────────────────────────────────
// Admin Teams – create, view, reshuffle task queues, delete teams
// Only admin can create teams (self-registration is disabled)
// ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Shuffle,
  Trash2,
  Loader2,
  Plus,
  UserPlus,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function AdminTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadTeams = () => {
    api.get('/admin/teams')
      .then(({ data }) => { setTeams(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTeams(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPassword.trim()) {
      toast.error('Name and password required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/admin/teams', { name: newName.trim(), password: newPassword });
      toast.success(`Team "${newName.trim()}" created!`);
      setNewName('');
      setNewPassword('');
      setShowCreate(false);
      loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleReshuffle = (id, name) => {
    setConfirmModal({ open: true, type: 'reshuffle', id, name });
  };

  const handleDelete = (id, name) => {
    setConfirmModal({ open: true, type: 'delete', id, name });
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (confirmModal.type === 'reshuffle') {
        await api.put(`/admin/teams/${confirmModal.id}/reshuffle`);
        toast.success(`Task queue reshuffled for ${confirmModal.name}`);
      } else if (confirmModal.type === 'delete') {
        await api.delete(`/admin/teams/${confirmModal.id}`);
        toast.success(`Team "${confirmModal.name}" deleted`);
      }
      loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${confirmModal.type}`);
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, type: null, id: null, name: '' });
    }
  };

  const closeConfirm = () => setConfirmModal({ open: false, type: null, id: null, name: '' });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <Users className="text-neon-green" size={20} />
          <h1 className="text-xl font-black text-white">Teams</h1>
          <span className="text-xs text-gray-500 ml-1">{teams.length} teams</span>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/20 text-neon-green text-xs font-bold hover:bg-neon-green/30 transition-colors"
        >
          {showCreate ? <X size={14} /> : <UserPlus size={14} />}
          {showCreate ? 'Cancel' : 'New Team'}
        </button>
      </div>

      {/* Create team form */}
      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            onSubmit={handleCreate}
            className="glass rounded-2xl p-5 neon-border mb-6 space-y-3 overflow-hidden"
          >
            <h2 className="text-sm font-bold text-neon-green flex items-center gap-2">
              <UserPlus size={16} /> Create New Team
            </h2>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Team Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Team Alpha"
                maxLength={40}
                className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-neon-green/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="min 4 characters"
                className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-neon-green/50"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-green to-green-400 text-dark-900 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {creating ? 'Creating...' : 'Create Team'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-neon-cyan" size={32} />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No teams yet. Create the first one!</p>
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
                  {team.profileEdited && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-400 font-semibold">
                      Edited
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500">
                  {team.taskQueue?.length || 0} tasks in queue · Created {new Date(team.createdAt).toLocaleDateString()}
                </div>
              </div>

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
            </motion.div>
          ))}
        </div>
      )}

      {/* Reshuffle confirmation */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === 'reshuffle'}
        title="Reshuffle Queue"
        message={`Reshuffle task queue for "${confirmModal.name}"? Their task order will be randomized.`}
        confirmLabel="Reshuffle"
        confirmColor="cyan"
        onConfirm={handleConfirmAction}
        onCancel={closeConfirm}
        loading={actionLoading}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === 'delete'}
        title="Delete Team"
        message={`Delete team "${confirmModal.name}"? All their submissions will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleConfirmAction}
        onCancel={closeConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
