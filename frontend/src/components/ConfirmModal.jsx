// ──────────────────────────────────────────────────────────────
// Shared Confirm / Input Modal – replaces browser confirm/prompt
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

// ── Confirmation Modal ────────────────────────────────────────
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmColor = 'cyan', // 'cyan' | 'red' | 'gold'
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;

  const colorClasses = {
    red: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    cyan: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30',
    gold: 'bg-neon-gold/20 text-neon-gold border border-neon-gold/30 hover:bg-neon-gold/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative glass rounded-2xl p-6 max-w-sm w-full border border-white/10 z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-yellow-400" />
          </div>
          <h3 className="text-white font-bold text-base">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-gray-400 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              colorClasses[confirmColor] || colorClasses.cyan
            }`}
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Input Modal (for prompts like block reason) ───────────────
export function InputModal({
  open,
  title,
  message,
  placeholder = '',
  confirmLabel = 'Confirm',
  confirmColor = 'cyan',
  onConfirm,
  onCancel,
  loading,
  required = false,
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue('');
  }, [open]);

  if (!open) return null;

  const colorClasses = {
    red: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    cyan: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30',
    gold: 'bg-neon-gold/20 text-neon-gold border border-neon-gold/30 hover:bg-neon-gold/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative glass rounded-2xl p-6 max-w-sm w-full border border-white/10 z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-yellow-400" />
          </div>
          <h3 className="text-white font-bold text-base">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-3">{message}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-neon-cyan/50 mb-5"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (!required || value.trim())) {
              onConfirm(value);
            }
          }}
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-gray-400 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(value)}
            disabled={loading || (required && !value.trim())}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              colorClasses[confirmColor] || colorClasses.cyan
            }`}
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
