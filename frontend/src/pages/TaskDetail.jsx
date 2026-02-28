import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Eye,
  Camera,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import useTimer from '../hooks/useTimer';
import toast from 'react-hot-toast';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [preview, setPreview] = useState(null);

  const fileRef = useRef(null);

  // Timer ticks only when the riddle is open and not yet completed
  const isRunning = submission?.status === 'in-progress';
  const { formatted: timerDisplay } = useTimer(submission?.riddleOpenedAt, isRunning);

  // ── Load task & start timer on mount ──────────────────
  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then(({ data }) => {
        setTask(data.task);
        setSubmission(data.submission);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load task');
        setLoading(false);
      });
  }, [id]);

  // ── Handle photo selection & upload ───────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview instantly
    setPreview(URL.createObjectURL(file));

    // Upload
    setUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);

      const { data } = await api.post(`/submissions/${id}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmission(data.submission);
      toast.success(`Submitted in ${formatMs(data.submission.elapsedMs)}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-neon-cyan" size={32} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400">Task not found</p>
        <button onClick={() => navigate('/')} className="text-neon-cyan text-sm font-semibold">
          ← Back to tasks
        </button>
      </div>
    );
  }

  const completed = submission?.status === 'completed';

  return (
    <div className="max-w-lg mx-auto">
      {/* ── Top bar ──────────────────────────────────────── */}
      <div className="sticky top-0 z-30 glass-strong px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>

        {/* Live timer */}
        <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${
          completed ? 'text-neon-green' : 'text-neon-cyan neon-glow'
        }`}>
          <Clock size={14} />
          <span>{completed ? formatMs(submission.elapsedMs) : timerDisplay}</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* ── Task header ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-widest">
            <MapPin size={12} />
            {task.locationHint}
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">{task.title}</h1>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neon-gold/10 text-neon-gold text-xs font-bold">
            <Sparkles size={12} />
            {task.points} pts
          </div>
        </motion.div>

        {/* ── Riddle card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 neon-border"
        >
          <h2 className="text-xs font-semibold text-neon-cyan uppercase tracking-widest mb-3">
            Your Mission
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
        </motion.div>

        {/* ── Hint section ───────────────────────────────── */}
        {task.detailedHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {!hintRevealed ? (
                <motion.button
                  key="hint-btn"
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setHintRevealed(true)}
                  className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-semibold text-neon-pink neon-border-pink active:scale-[0.98] transition-transform"
                >
                  <Eye size={16} />
                  Reveal Hint
                </motion.button>
              ) : (
                <motion.div
                  key="hint-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="glass rounded-2xl p-5 neon-border-pink"
                >
                  <h3 className="text-xs font-semibold text-neon-pink uppercase tracking-widest mb-2">
                    Hint
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{task.detailedHint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Photo upload / preview ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Show uploaded photo or preview */}
          {(preview || submission?.photoUrl) && (
            <div className="relative rounded-2xl overflow-hidden neon-border">
              <img
                src={submission?.photoUrl || preview}
                alt="Submission"
                className="w-full aspect-[4/3] object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
                  <Loader2 className="animate-spin text-neon-cyan" size={36} />
                </div>
              )}
              {completed && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-neon-green/20 text-neon-green rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  <CheckCircle2 size={14} />
                  Submitted
                </div>
              )}
            </div>
          )}

          {/* Camera capture button */}
          {!completed && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-neon-cyan to-neon-pink text-white shadow-neon flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <Camera size={20} />
                {uploading ? 'Uploading...' : preview ? 'Retake Photo' : 'Take Photo'}
              </motion.button>
            </>
          )}

          {completed && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide glass neon-border text-neon-cyan flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Back to Tasks
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────
function formatMs(ms) {
  if (!ms) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}
