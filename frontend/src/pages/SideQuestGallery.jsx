import { useState, useEffect } from 'react';
import { Images, Clock, User } from 'lucide-react';
import api from '../api/axios';

export default function SideQuestGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchGallery();
    fetchTasks();
  }, [selectedTask]);

  async function fetchGallery() {
    setLoading(true);
    setError(null);
    try {
      const url = selectedTask
        ? `/submissions/gallery?taskId=${selectedTask}`
        : '/submissions/gallery';
      const { data } = await api.get(url);
      setPhotos(data);
    } catch (err) {
      setError('Nie udało się załadować galerii');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {
      // ignoruj błąd filtrów
    }
  }

  function formatTime(ms) {
    if (!ms) return '—';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}m ${sec}s`;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Images size={22} className="text-neon-cyan" />
          <h1 className="text-xl font-bold text-white">Gallery</h1>
          <span className="ml-auto text-sm text-gray-400">{photos.length} zdjęć</span>
        </div>

        {/* Filtr po zadaniu */}
        <select
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
          className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
        >
          <option value="">Wszystkie zadania</option>
          {tasks.map((t) => (
            <option key={t._id} value={t._id}>
              {t.order}. {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-12">{error}</div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
            <Images size={40} strokeWidth={1} />
            <p className="text-sm">Brak zdjęć do wyświetlenia</p>
          </div>
        )}

        {!loading && !error && photos.length > 0 && (
          <div className="columns-2 gap-3 space-y-3">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="break-inside-avoid glass rounded-2xl overflow-hidden neon-border"
              >
                {/* Zdjęcie */}
                <img
                  src={photo.photoUrl}
                  alt={photo.task?.title ?? 'photo'}
                  className="w-full object-cover"
                  loading="lazy"
                />

                {/* Metadane */}
                <div className="p-2 space-y-1">
                  {/* Nazwa zadania */}
                  <p className="text-xs font-semibold text-neon-cyan truncate">
                    {photo.task?.title ?? '—'}
                  </p>

                  {/* Team */}
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: photo.team?.avatarColor ?? '#888' }}
                    />
                    <span className="text-xs text-gray-300 truncate">
                      {photo.team?.name ?? '—'}
                    </span>
                  </div>

                  {/* Czas */}
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={10} />
                    <span className="text-xs">{formatTime(photo.elapsedMs)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
