// ──────────────────────────────────────────────────────────────
// Admin Photo Moderation – block/delete submitted photos
// ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Image,
  Shield,
  ShieldOff,
  Trash2,
  Clock,
  Loader2,
  Filter,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

function formatMs(ms) {
  if (!ms) return '';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export default function AdminPhotos() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | completed | blocked

  const loadSubmissions = () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/admin/submissions${params}`)
      .then(({ data }) => { setSubmissions(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); loadSubmissions(); }, [filter]);

  const handleBlock = async (id) => {
    const reason = prompt('Block reason (optional):') || 'Blocked by admin';
    try {
      await api.put(`/admin/submissions/${id}/block`, { reason });
      toast.success('Photo blocked');
      loadSubmissions();
    } catch (err) {
      toast.error('Failed to block');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await api.put(`/admin/submissions/${id}/unblock`);
      toast.success('Photo unblocked');
      loadSubmissions();
    } catch (err) {
      toast.error('Failed to unblock');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this submission and its photo?')) return;
    try {
      await api.delete(`/admin/submissions/${id}`);
      toast.success('Submission deleted permanently');
      loadSubmissions();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <Image className="text-neon-pink" size={20} />
        <h1 className="text-xl font-black text-white">Photo Moderation</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'completed', 'blocked'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-neon-cyan/20 text-neon-cyan neon-border'
                : 'glass text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-neon-cyan" size={32} />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub, i) => (
            <motion.div
              key={sub._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass rounded-2xl overflow-hidden ${
                sub.status === 'blocked' ? 'border border-red-500/30' : 'neon-border'
              }`}
            >
              {/* Team & task info */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-dark-900"
                  style={{ backgroundColor: sub.team?.avatarColor || '#00f0ff' }}
                >
                  {sub.team?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{sub.team?.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>{sub.task?.title}</span>
                    <span>·</span>
                    <span>{timeAgo(sub.photoSubmittedAt)}</span>
                    {sub.elapsedMs && (
                      <>
                        <span>·</span>
                        <span className="text-neon-green flex items-center gap-0.5">
                          <Clock size={8} /> {formatMs(sub.elapsedMs)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  sub.status === 'blocked'
                    ? 'bg-red-500/20 text-red-400'
                    : sub.status === 'completed'
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {sub.status}
                </span>
              </div>

              {/* Photo */}
              {sub.photoUrl && (
                <div className="relative">
                  <img
                    src={sub.photoUrl}
                    alt="Submission"
                    className={`w-full aspect-[4/3] object-cover ${
                      sub.status === 'blocked' ? 'opacity-40 grayscale' : ''
                    }`}
                    loading="lazy"
                  />
                  {sub.status === 'blocked' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-red-500/80 text-white px-4 py-2 rounded-lg font-bold text-sm">
                        BLOCKED
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Block reason */}
              {sub.blockReason && (
                <div className="px-4 py-2 text-xs text-red-400 bg-red-500/5">
                  Reason: {sub.blockReason}
                </div>
              )}

              {/* Actions */}
              <div className="px-4 py-3 flex items-center gap-2">
                {sub.status === 'blocked' ? (
                  <button
                    onClick={() => handleUnblock(sub._id)}
                    className="flex-1 py-2 rounded-lg glass text-xs font-semibold text-neon-green flex items-center justify-center gap-1.5 hover:bg-neon-green/10 transition-colors"
                  >
                    <ShieldOff size={14} />
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlock(sub._id)}
                    className="flex-1 py-2 rounded-lg glass text-xs font-semibold text-yellow-400 flex items-center justify-center gap-1.5 hover:bg-yellow-500/10 transition-colors"
                  >
                    <Shield size={14} />
                    Block
                  </button>
                )}
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="flex-1 py-2 rounded-lg glass text-xs font-semibold text-neon-pink flex items-center justify-center gap-1.5 hover:bg-neon-pink/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
