import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, Clock, MapPin } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatMs(ms) {
  if (!ms) return '';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const { team } = useAuth();

  useEffect(() => {
    api.get('/submissions/feed').then(({ data }) => {
      setFeed(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Camera className="text-neon-pink" size={22} />
        <h1 className="text-xl font-black text-white">Photo Feed</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neon-cyan" size={32} />
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Camera size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No photos yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-5 pb-6">
          {feed.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden neon-border"
            >
              {/* Team header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-dark-900"
                  style={{ backgroundColor: item.team?.avatarColor || '#00f0ff' }}
                >
                  {item.team?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {item.team?.name || 'Unknown'}
                    {item.team?._id === team?.id && (
                      <span className="text-neon-cyan ml-1 text-xs">(You)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span>{timeAgo(item.photoSubmittedAt)}</span>
                    {item.elapsedMs && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-neon-green">
                          <Clock size={10} />
                          {formatMs(item.elapsedMs)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo */}
              <img
                src={item.photoUrl}
                alt={item.task?.title || 'Submission'}
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />

              {/* Task info bar */}
              <div className="px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={12} className="text-neon-cyan" />
                <span className="font-semibold text-white">{item.task?.title}</span>
                <span className="text-gray-600">·</span>
                <span className="truncate">{item.task?.locationHint}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
