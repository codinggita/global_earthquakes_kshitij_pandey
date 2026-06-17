import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  FiArrowLeft,
  FiMapPin,
  FiActivity,
  FiCompass,
  FiInfo,
  FiAlertTriangle,
  FiCalendar,
  FiCpu
} from 'react-icons/fi';

const EarthquakeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eq, setEq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/earthquakes/${id}`);
        if (res.data?.status === 'success') {
          setEq(res.data.data.earthquake || res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Could not locate the requested earthquake incident details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650" />
      </div>
    );
  }

  if (error || !eq) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto mt-10">
        <FiAlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Incident Details Unavailable</h3>
        <p className="text-sm text-slate-500 mt-2">{error || 'Record could not be retrieved.'}</p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/earthquakes')}
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const coordinates = eq.location?.coordinates || [];
  const [lng, lat] = coordinates;
  const isStrong = eq.mag >= 6.0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          to="/earthquakes"
          className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Detail Header Grid */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background Visual Circle */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20
          ${isStrong ? 'bg-rose-550' : 'bg-indigo-550'}
        `} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${isStrong ? 'bg-rose-500/25 text-rose-305 border border-rose-500/30' : 'bg-indigo-500/25 text-indigo-305 border border-indigo-500/30'}
              `}>
                Magnitude {eq.mag.toFixed(1)}
              </span>
              <span className="text-slate-400 text-xs uppercase font-semibold">
                Type: {eq.type || 'earthquake'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{eq.place}</h2>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <FiMapPin className="shrink-0 w-4 h-4 text-indigo-400" />
              <span>{eq.country || 'International Waters / Region Unknown'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 shrink-0 bg-slate-800/40 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50">
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-450 uppercase">Depth</span>
              <span className="text-xl font-bold text-slate-100">{eq.depth} km</span>
            </div>
            <div className="w-px h-8 bg-slate-705" />
            <div className="text-center">
              <span className="block text-[10px] font-bold text-slate-450 uppercase">Status</span>
              <span className="text-xl font-bold text-indigo-350 capitalize">{eq.status || 'reviewed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core seismic indicators */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-850 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <FiActivity className="text-indigo-600 w-5 h-5" />
            <span>Seismic Indicators</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Magnitude Type</span>
              <span className="text-base font-bold text-slate-800 uppercase">{eq.magType || 'N/A'}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Azimuthal Gap</span>
              <span className="text-base font-bold text-slate-800">
                {eq.gap !== null && eq.gap !== undefined ? `${eq.gap}°` : 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-400 uppercase">RMS Residual</span>
              <span className="text-base font-bold text-slate-800">
                {eq.rms !== null && eq.rms !== undefined ? `${eq.rms} s` : 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Stations Reporting (NST)</span>
              <span className="text-base font-bold text-slate-800">{eq.nst || 'N/A'}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Min Distance (DMIN)</span>
              <span className="text-base font-bold text-slate-800">
                {eq.dmin !== null && eq.dmin !== undefined ? `${eq.dmin}°` : 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Reporting Network</span>
              <span className="text-base font-bold text-slate-800 uppercase">{eq.net || 'USGS'}</span>
            </div>
          </div>
        </div>

        {/* Location / Geo Coordinates mockup */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-850 flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <FiCompass className="text-indigo-600 w-5 h-5" />
              <span>Geo Coordinates</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-505 font-medium">Latitude</span>
                <span className="font-bold text-slate-805">{lat !== undefined ? `${lat.toFixed(5)}°` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-505 font-medium">Longitude</span>
                <span className="font-bold text-slate-805">{lng !== undefined ? `${lng.toFixed(5)}°` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-505 font-medium">Depth</span>
                <span className="font-bold text-indigo-600">{eq.depth} km</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 aspect-video rounded-xl mt-6 flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden">
            {/* Mock coordinate grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30" />
            <div className="relative z-10 text-center space-y-1 p-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping mx-auto" />
              <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                COORDINATES RECORDED
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                LAT: {lat?.toFixed(3)}, LNG: {lng?.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Log info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase mb-0.5">Recorded Timestamp</span>
            <span className="text-sm font-semibold text-slate-700">{new Date(eq.time).toUTCString()}</span>
            <span className="block text-xs text-slate-450 mt-0.5">Local: {new Date(eq.time).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FiCpu className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase mb-0.5">Systems Metadata</span>
            <span className="text-sm font-semibold text-slate-700">Event ID: {eq.eventId || eq.id}</span>
            <span className="block text-xs text-slate-455 mt-0.5">Last Synced: {new Date(eq.updated).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeDetails;
