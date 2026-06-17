import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiTrendingUp, FiActivity, FiMapPin, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/earthquakes/stats');
        if (res.data?.status === 'success') {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch structural statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto mt-10">
        <FiAlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Statistics Retrieval Failed</h3>
        <p className="text-sm text-slate-500 mt-2">{error || 'Statistical metrics are not available.'}</p>
      </div>
    );
  }

  const { summary = {}, byCountry = [], byCategory = [] } = stats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Seismological Summaries</h2>
        <p className="text-sm text-slate-550">Aggregated mathematical metrics and distribution patterns.</p>
      </div>

      {/* Row 1: KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Records</span>
          <h4 className="text-2xl font-bold text-slate-800">{summary.totalEarthquakes || 0}</h4>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">100% Data Pool</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Magnitude</span>
          <h4 className="text-2xl font-bold text-indigo-600">{summary.avgMagnitude || '0.0'}</h4>
          <span className="text-[10px] text-slate-450">Standard M (USGS)</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Maximum Magnitude</span>
          <h4 className="text-2xl font-bold text-rose-600">{summary.maxMagnitude || '0.0'}</h4>
          <span className="text-[10px] text-slate-450">Peak Intensity Record</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Depth</span>
          <h4 className="text-2xl font-bold text-emerald-600">{summary.avgDepth || '0'} km</h4>
          <span className="text-[10px] text-slate-450">Focal depth average</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Maximum Depth</span>
          <h4 className="text-2xl font-bold text-amber-600">{summary.maxDepth || 0} km</h4>
          <span className="text-[10px] text-slate-450">Deepest Mantle slip</span>
        </div>
      </div>

      {/* Row 2: Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-150 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-805 flex items-center space-x-2">
              <FiMapPin className="text-indigo-600 w-5 h-5" />
              <span>Incidents by Country/Territory</span>
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-505 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <th className="py-3 px-6">Country / Region</th>
                  <th className="py-3 px-6 text-center">Incidents</th>
                  <th className="py-3 px-6 text-right">Avg Magnitude</th>
                  <th className="py-3 px-6 text-right">Avg Depth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {byCountry.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-6 font-semibold text-slate-800">{item.country}</td>
                    <td className="py-3 px-6 text-center font-medium text-slate-800">{item.count}</td>
                    <td className="py-3 px-6 text-right font-medium text-slate-800">{item.avgMagnitude.toFixed(2)}</td>
                    <td className="py-3 px-6 text-right text-slate-505">{item.avgDepth} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Severity Category Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-150 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-805 flex items-center space-x-2">
              <FiTrendingUp className="text-rose-600 w-5 h-5" />
              <span>Magnitude Categorical Statistics</span>
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-505 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <th className="py-3 px-6">Severity Group</th>
                  <th className="py-3 px-6 text-center">Record Count</th>
                  <th className="py-3 px-6 text-right">Avg Magnitude</th>
                  <th className="py-3 px-6 text-right">Avg Depth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {byCategory.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-805 capitalize">{item.category}</td>
                    <td className="py-3 px-6 text-center font-medium text-slate-800">{item.count}</td>
                    <td className="py-3 px-6 text-right font-medium text-slate-800">{item.avgMagnitude.toFixed(2)}</td>
                    <td className="py-3 px-6 text-right text-slate-505">{item.avgDepth} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
