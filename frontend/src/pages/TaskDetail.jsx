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
  Play,
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
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [preview, setPreview] = useState(null);

  const fileRef = useRef(null);

  // Task has been started (submission exists with riddleOpenedAt)
  const hasStarted = !!submission;
  const isRunning = submission?.status === 'in-progress';
  const completed = submission?.status === 'completed';
  const { formatted: timerDisplay } = useTimer(submission?.riddleOpenedAt, isRunning);

  // ── Load task (does NOT start timer) ──────────────────
  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then(({ data }) => {
        setTask(data.task);
        setSubmission(data.submission); // null if not started yet
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load task');
        setLoading(false);
      });
  }, [id]);

  // ── Start Task → creates submission & starts timer ─────
  const handleStart = async () => {
    setStarting(true);
    try {
      const { data } = await api.post(`/tasks/${id}/start`);
      setTask(data.task);
      setSubmission(data.submission);
      toast.success('Timer started! Go find it!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start task');
    } finally {
      setStarting(false);
    }
  };

  // ── Handle photo selection & upload ───────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
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

        {/* Live timer – only show if task has been started */}
        {hasStarted && (
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${
            completed ? 'text-neon-green' : 'text-neon-cyan neon-glow'
          }`}>
            <Clock size={14} />
            <span>{completed ? formatMs(submission.elapsedMs) : timerDisplay}</span>
          </div>
        )}
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

        {/* ── PRE-START: Show "Start Task" button ────────── */}
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="glass rounded-2xl p-5 neon-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 flex items-center justify-center">
                <Play className="text-neon-cyan" size={28} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Ready?</h2>
              <p className="text-sm text-gray-400 mb-1">
                The timer starts when you press the button below.
              </p>
              <p className="text-xs text-gray-500">
                You'll see the full task description after starting.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={starting}
              className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-neon-cyan to-cyan-400 text-dark-900 shadow-neon hover:shadow-neon flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {starting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Play size={20} />
              )}
              {starting ? 'Starting...' : 'Start Task'}
            </motion.button>
          </motion.div>
        )}

        {/* ── POST-START: Riddle + Hint + Camera ─────────── */}
        {hasStarted && (
          <>
            {/* Riddle card */}
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

            {/* Hint section */}
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

            {/* Photo upload / preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
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
          </>
        )}
      </div>
    </div>
  );
}

function formatMs(ms) {
  if (!ms) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}
