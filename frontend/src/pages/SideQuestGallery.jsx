import { useState, useEffect } from 'react';
import { Images, Clock, MapPin, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function SideQuestGallery() {
  const [taskPhotos, setTaskPhotos] = useState([]);
  const [sqPhotos, setSqPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtry
  const [tasks, setTasks] = useState([]);
  const [sidequests, setSidequests] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedQuest, setSelectedQuest] = useState('');
  const [tab, setTab] = useState('tasks'); // 'tasks' | 'sidequests'

  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchSideQuests();
  }, []);

  useEffect(() => {
    if (tab === 'tasks') fetchTaskGallery();
    else fetchSqGallery();
  }, [tab, selectedTask, selectedQuest]);

  async function fetchTaskGallery() {
    setLoading(true);
    setError(null);
    try {
      const url = selectedTask
        ? `/submissions/gallery?taskId=${selectedTask}`
        : '/submissions/gallery';
      const { data } = await api.get(url);
      setTaskPhotos(data);
    } catch {
      setError('Nie udało się załadować galerii');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSqGallery() {
    setLoading(true);
    setError(null);
    try {
      const url = selectedQuest
        ? `/sidequests/gallery?questId=${selectedQuest}`
        : '/sidequests/gallery';
      const { data } = await api.get(url);
      setSqPhotos(data);
    } catch {
      setError('Nie udało się załadować galerii side questów');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {}
  }

  async function fetchSideQuests() {
    try {
      const { data } = await api.get('/sidequests');
      setSidequests(data.quests || []);
    } catch {}
  }

  function formatTime(ms) {
    if (!ms) return '—';
    const totalSec = Math.floor(ms / 1000);
    return `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`;
  }

  function groupByTask(photos) {
    const map = new Map();
    for (const photo of photos) {
      const id = photo.task?._id ?? 'unknown';
      if (!map.has(id)) map.set(id, { meta: photo.task, photos: [] });
      map.get(id).photos.push(photo);
    }
    return Array.from(map.values()).sort(
      (a, b) => (a.meta?.order ?? 999) - (b.meta?.order ?? 999)
    );
  }

  function groupByQuest(photos) {
    const map = new Map();
    for (const photo of photos) {
      const id = photo.sideQuest?._id ?? 'unknown';
      if (!map.has(id)) map.set(id, { meta: photo.sideQuest, photos: [] });
      map.get(id).photos.push(photo);
    }
    return Array.from(map.values());
  }

  function toggleCollapse(id) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const grouped = tab === 'tasks' ? groupByTask(taskPhotos) : groupByQuest(sqPhotos);
  const totalPhotos = tab === 'tasks' ? taskPhotos.length : sqPhotos.length;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Images size={22} className="text-neon-cyan" />
          <h1 className="text-xl font-bold text-white">Gallery</h1>
          <span className="ml-auto text-sm text-gray-400">{totalPhotos} zdjęć</span>
        </div>

        {/* Zakładki Tasks / Side Quests */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => { setTab('tasks'); setSelectedTask(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'tasks'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'glass text-gray-400'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => { setTab('sidequests'); setSelectedQuest(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              tab === 'sidequests'
                ? 'bg-neon-gold/20 text-neon-gold border border-neon-gold/30'
                : 'glass text-gray-400'
            }`}
          >
            <Sparkles size={12} />
            Side Quests
          </button>
        </div>

        {/* Filtr */}
        {tab === 'tasks' ? (
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
          >
            <option value="">Wszystkie zadania</option>
            {tasks.map((t) => (
              <option key={t._id} value={t._id}>{t.order}. {t.title}</option>
            ))}
          </select>
        ) : (
          <select
            value={selectedQuest}
            onChange={(e) => setSelectedQuest(e.target.value)}
            className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-gold/50"
          >
            <option value="">Wszystkie side questy</option>
            {sidequests.map((q) => (
              <option key={q._id} value={q._id}>{q.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-6">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <div className="text-center text-red-400 py-12">{error}</div>}

        {!loading && !error && grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
            <Images size={40} strokeWidth={1} />
            <p className="text-sm">Brak zdjęć do wyświetlenia</p>
          </div>
        )}

        {!loading && !error && grouped.map((group) => {
          const id = group.meta?._id ?? 'unknown';
          const isCollapsed = collapsed[id];
          const isSq = tab === 'sidequests';

          return (
            <div key={id} className="space-y-3">
              <button
                onClick={() => toggleCollapse(id)}
                className={`w-full flex items-center gap-2 glass rounded-2xl px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                  isSq ? 'border border-neon-gold/20' : 'neon-border'
                }`}
              >
                {/* Ikona */}
                <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                  isSq ? 'bg-neon-gold/20 text-neon-gold' : 'bg-neon-cyan/20 text-neon-cyan'
                }`}>
                  {isSq ? <Sparkles size={14} /> : (group.meta?.order ?? '?')}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {group.meta?.title ?? 'Nieznane'}
                  </p>
                  {!isSq && group.meta?.locationHint && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin size={10} />
                      <span className="truncate">{group.meta.locationHint}</span>
                    </div>
                  )}
                  {isSq && group.meta?.description && (
                    <p className="text-xs text-gray-500 truncate">{group.meta.description}</p>
                  )}
                </div>

                <span className="text-xs text-gray-400 flex-shrink-0 mr-1">
                  {group.photos.length} {group.photos.length === 1 ? 'zdjęcie' : 'zdjęć'}
                </span>
                {isCollapsed
                  ? <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                  : <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
                }
              </button>

              {!isCollapsed && (
                <div className="columns-2 gap-3 space-y-3 pl-1">
                  {group.photos.map((photo) => (
                    <div
                      key={photo._id}
                      className={`break-inside-avoid glass rounded-2xl overflow-hidden ${
                        isSq ? 'border border-neon-gold/20' : 'neon-border'
                      }`}
                    >
                      <img
                        src={photo.photoUrl}
                        alt=""
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      <div className="p-2 space-y-1">
                        {/* Status badge dla side questów */}
                        {isSq && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            photo.status === 'approved' ? 'bg-neon-green/20 text-neon-green' :
                            photo.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {photo.status === 'approved' ? 'Approved' :
                             photo.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: photo.team?.avatarColor ?? '#888' }}
                          />
                          <span className="text-xs font-semibold text-gray-200 truncate">
                            {photo.team?.name ?? '—'}
                          </span>
                        </div>
                        {!isSq && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock size={10} />
                            <span className="text-xs">{formatTime(photo.elapsedMs)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
