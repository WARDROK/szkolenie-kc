// ──────────────────────────────────────────────────────────────
// TaskMap – Interactive map showing task markers using Leaflet
// Uses OpenStreetMap tiles (free, no API key needed)
// ──────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';

const STATUS_COLORS = {
  'not-started': '#6b7280',  // gray
  'in-progress': '#00f0ff',  // neon cyan
  completed: '#39ff14',      // neon green
};

function createMarkerSvg(number, color) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M18 46s-18-20-18-28a18 18 0 0136 0c0 8-18 28-18 28z" fill="${color}" filter="url(#shadow)" opacity="0.9"/>
      <circle cx="18" cy="18" r="12" fill="#0a0a0f"/>
      <text x="18" y="23" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold" font-family="Inter, sans-serif">${number}</text>
    </svg>
  `;
}

export default function TaskMap({ tasks, config, onTaskClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Dynamically load Leaflet CSS + JS if not already loaded
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when tasks change
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateMarkers();
    }
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const centerLat = config?.mapCenterLat || 52.2297;
    const centerLng = config?.mapCenterLng || 21.0122;
    const zoom = config?.mapZoom || 17;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark mode map tiles (CartoDB dark matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution (small, bottom left)
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
      .addTo(map);

    mapInstanceRef.current = map;
    updateMarkers();
  }

  function updateMarkers() {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const tasksWithCoords = tasks.filter((t) => t.lat && t.lng);

    tasksWithCoords.forEach((task) => {
      const color = STATUS_COLORS[task.status] || STATUS_COLORS['not-started'];
      const number = task.queuePosition || task.order || '?';

      const icon = L.divIcon({
        html: createMarkerSvg(number, color),
        className: 'task-marker',
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -46],
      });

      const marker = L.marker([task.lat, task.lng], { icon })
        .addTo(map);

      // Popup with task info
      const popupContent = `
        <div style="font-family: Inter, sans-serif; color: #fff; background: #12121a; border: 1px solid ${color}33; border-radius: 12px; padding: 12px 16px; min-width: 160px;">
          <div style="font-size: 11px; color: ${color}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
            Task #${number}
          </div>
          <div style="font-size: 14px; font-weight: 800; margin-bottom: 6px;">${task.title}</div>
          <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">${task.locationHint}</div>
          <button 
            onclick="window.__taskMapClick__('${task._id}')" 
            style="width: 100%; padding: 8px; border-radius: 8px; border: none; background: ${color}; color: #0a0a0f; font-weight: 700; font-size: 12px; cursor: pointer;">
            ${task.status === 'completed' ? 'View Details' : task.status === 'in-progress' ? 'Continue' : 'Go to Task'}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'task-popup',
        maxWidth: 220,
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (tasksWithCoords.length > 1) {
      const bounds = L.latLngBounds(tasksWithCoords.map((t) => [t.lat, t.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  }

  // Global click handler for popup buttons
  useEffect(() => {
    window.__taskMapClick__ = (taskId) => {
      if (onTaskClick) onTaskClick(taskId);
    };
    return () => {
      delete window.__taskMapClick__;
    };
  }, [onTaskClick]);

  return (
    <>
      <style>{`
        .task-marker { background: none !important; border: none !important; }
        .task-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .task-popup .leaflet-popup-content { margin: 0 !important; }
        .task-popup .leaflet-popup-tip { display: none !important; }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px] rounded-none"
        style={{ background: '#0a0a0f' }}
      />
    </>
  );
}
