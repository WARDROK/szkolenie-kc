import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function formatMs(ms) {
  if (!ms) return '—';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

const rankStyles = {
  1: 'from-yellow-500/30 to-yellow-600/10 border-yellow-500/40',
  2: 'from-gray-400/20 to-gray-500/10 border-gray-400/30',
  3: 'from-amber-700/20 to-amber-800/10 border-amber-700/30',
};

const rankIcons = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { team } = useAuth();

  useEffect(() => {
    api.get('/leaderboard').then(({ data }) => {
      setBoard(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="text-neon-gold" size={22} />
        <h1 className="text-xl font-black text-white">Leaderboard</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neon-cyan" size={32} />
        </div>
      ) : board.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No submissions yet. Start hunting!</p>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {board.map((entry, i) => {
            const isTopThree = entry.rank <= 3;
            const isMe = entry.teamId === team?.id;

            return (
              <motion.div
                key={entry.teamId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass rounded-2xl p-4 flex items-center gap-3 transition-all ${
                  isTopThree
                    ? `bg-gradient-to-r ${rankStyles[entry.rank]} border`
                    : 'border border-white/5'
                } ${isMe ? 'ring-1 ring-neon-cyan/40' : ''}`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  isTopThree ? 'text-2xl' : 'bg-dark-700 text-gray-400 text-sm'
                }`}>
                  {isTopThree ? rankIcons[entry.rank] : entry.rank}
                </div>

                {/* Team info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-dark-900 flex-shrink-0"
                      style={{ backgroundColor: entry.avatarColor }}
                    >
                      {entry.teamName[0].toUpperCase()}
                    </div>
                    <p className="font-bold text-sm text-white truncate">
                      {entry.teamName}
                      {isMe && <span className="text-neon-cyan ml-1 text-xs">(You)</span>}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right space-y-0.5">
                  <div className="flex items-center gap-1 text-xs text-neon-green font-semibold justify-end">
                    <CheckCircle2 size={12} />
                    {entry.completedTasks} done
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                    <Clock size={11} />
                    {formatMs(entry.totalElapsedMs)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
