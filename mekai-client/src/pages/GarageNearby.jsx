import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const garageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 14); }, [position]);
  return null;
}

const fetchGarages = async (lat, lng, radius = 3000) => {
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="car_repair"](around:${radius},${lat},${lng});
      node["amenity"="car_repair"](around:${radius},${lat},${lng});
      node["shop"="tyres"](around:${radius},${lat},${lng});
      way["shop"="car_repair"](around:${radius},${lat},${lng});
    );
    out center;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  const data = await res.json();
  return data.elements.map(el => ({
    id: el.id,
    name: el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:ar'] || 'Garage',
    lat: el.lat || el.center?.lat,
    lng: el.lon || el.center?.lon,
    phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
    opening: el.tags?.opening_hours || null,
    address: el.tags?.['addr:street'] ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() : null,
  })).filter(g => g.lat && g.lng);
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1000).toFixed(0);
};

export default function GarageNearby({ onBack }) {
  const { i18n } = useTranslation();
  const [position, setPosition] = useState(null);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(10000);
  const isRTL = i18n.language === 'ar';

  const LABELS = {
    fr: { title: 'Garages à proximité', back: 'Retour', locate: 'Me localiser', loading_loc: 'Localisation...', loading_gar: 'Recherche des garages...', no_garage: 'Aucun garage trouvé. Essayez un rayon plus large.', km: 'km', m: 'm', radius_label: 'Rayon de recherche', call: 'Appeler', directions: 'Itinéraire', found: 'garages trouvés' },
    ar: { title: 'ورشات قريبة', back: 'رجوع', locate: 'تحديد موقعي', loading_loc: 'جاري التحديد...', loading_gar: 'البحث عن الورشات...', no_garage: 'لا توجد ورشات. جرب نطاقاً أوسع.', km: 'كم', m: 'م', radius_label: 'نطاق البحث', call: 'اتصال', directions: 'الاتجاهات', found: 'ورشة وجدت' },
    en: { title: 'Nearby Garages', back: 'Back', locate: 'Locate me', loading_loc: 'Locating...', loading_gar: 'Finding garages...', no_garage: 'No garages found. Try a larger radius.', km: 'km', m: 'm', radius_label: 'Search radius', call: 'Call', directions: 'Directions', found: 'garages found' },
  };
  const L2 = LABELS[i18n.language] || LABELS.fr;

  const formatDist = (m) => m >= 1000 ? `${(m/1000).toFixed(1)} ${L2.km}` : `${m} ${L2.m}`;

  const locate = () => {
    setLoading(true);
    setError('');
    setGarages([]);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition([lat, lng]);
        try {
          const results = await fetchGarages(lat, lng, radius);
          const sorted = results.sort((a, b) =>
            getDistance(lat, lng, a.lat, a.lng) - getDistance(lat, lng, b.lat, b.lng)
          );
          setGarages(sorted);
        } catch { setError('Erreur lors de la recherche.'); }
        setLoading(false);
      },
      () => { setError('Impossible d\'accéder à votre position.'); setLoading(false); }
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-[#0f0f0f] to-gray-950 -z-10"></div>
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920')] bg-cover bg-center opacity-5 -z-10"></div>
      
      {/* Animated gradient orbs */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse -z-10" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 px-4 py-6 pb-16">
        <div className="max-w-4xl mx-auto">

          {/* Professional Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} 
              className="w-11 h-11 backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all shadow-lg">
              {isRTL ? '→' : '←'}
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">🗺️ {L2.title}</h1>
          </div>

          {/* Radius selector card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{L2.radius_label}</p>
              <p className="text-base text-orange-400 font-bold">{radius >= 1000 ? `${radius/1000} km` : `${radius} m`}</p>
            </div>
            <input type="range" min="5000" max="150000" step="5000" value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-orange-500 [&::-webkit-slider-thumb]:to-orange-700 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-orange-600/50" />
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>5 km</span><span>50 km</span><span>100 km</span><span>150 km</span>
            </div>
          </div>

          {/* Locate button */}
          <button onClick={locate} disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all mb-5 shadow-2xl shadow-orange-600/40 hover:shadow-orange-600/60 hover:scale-[1.02] active:scale-[0.98]">
            {loading ? `⏳ ${position ? L2.loading_gar : L2.loading_loc}` : `📍 ${L2.locate}`}
          </button>

          {error && (
            <div className="backdrop-blur-xl bg-red-950/30 border border-red-800/30 rounded-xl p-4 text-red-300 text-sm text-center mb-5 flex items-center justify-center gap-2">
              ⚠️ {error}
            </div>
          )}

          {/* Map */}
          {position && (
            <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 shadow-2xl" style={{ height: 350 }}>
              <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <RecenterMap position={position} />
                <Circle center={position} radius={radius} pathOptions={{ color: '#e85d26', fillColor: '#e85d26', fillOpacity: 0.1, weight: 2 }} />
                <Marker position={position} icon={userIcon}>
                  <Popup>📍 {isRTL ? 'موقعك' : i18n.language === 'en' ? 'Your location' : 'Votre position'}</Popup>
                </Marker>
                {garages.map(g => (
                  <Marker key={g.id} position={[g.lat, g.lng]} icon={garageIcon}>
                    <Popup>
                      <div style={{ minWidth: 150 }}>
                        <strong>🔧 {g.name}</strong><br />
                        {g.address && <span style={{ fontSize: 12, color: '#666' }}>{g.address}<br /></span>}
                        {g.phone && <a href={`tel:${g.phone}`} style={{ color: '#e85d26', fontSize: 12 }}>📞 {g.phone}</a>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Garages list */}
          {garages.length > 0 && (
            <>
              <div className="backdrop-blur-xl bg-green-950/20 border border-green-800/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-green-300 font-semibold">✅ {garages.length} {L2.found}</p>
              </div>
              <div className="space-y-4">
                {garages.slice(0, 10).map(g => {
                  const dist = getDistance(position[0], position[1], g.lat, g.lng);
                  return (
                    <div key={g.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl hover:bg-white/10 hover:border-white/20 transition-all group">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-base mb-1 group-hover:text-orange-400 transition-colors">🔧 {g.name}</p>
                          {g.address && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">📍 {g.address}</p>}
                          {g.opening && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">🕐 {g.opening}</p>}
                        </div>
                        <span className="text-sm text-orange-400 font-bold bg-orange-950/30 border border-orange-800/30 px-3 py-1 rounded-full flex-shrink-0">{formatDist(dist)}</span>
                      </div>
                      <div className="flex gap-2">
                        {g.phone && (
                          <a href={`tel:${g.phone}`}
                            className="flex-1 text-center py-2.5 text-sm font-medium backdrop-blur-md bg-green-900/30 border border-green-700/50 text-green-300 rounded-xl hover:bg-green-900/50 hover:border-green-600 transition-all shadow-lg hover:shadow-green-600/20">
                            📞 {L2.call}
                          </a>
                        )}
                        <a href={`https://www.openstreetmap.org/directions?from=${position[0]},${position[1]}&to=${g.lat},${g.lng}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 text-center py-2.5 text-sm font-medium backdrop-blur-md bg-blue-900/30 border border-blue-700/50 text-blue-300 rounded-xl hover:bg-blue-900/50 hover:border-blue-600 transition-all shadow-lg hover:shadow-blue-600/20">
                          🗺️ {L2.directions}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && position && garages.length === 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 text-center shadow-2xl">
              <div className="text-5xl mb-4 opacity-50">🔧</div>
              <p className="text-gray-400 text-base">{L2.no_garage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}