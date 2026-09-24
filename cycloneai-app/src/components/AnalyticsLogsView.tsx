import React, { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  Radio, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  FileCode, 
  RefreshCw, 
  X,
  Activity,
  Layers,
  ShieldCheck,
  Server
} from 'lucide-react';
import { SystemLog, SensorStatus } from '../types';
import { SENSOR_NETWORK } from '../data/mockData';

interface AnalyticsLogsViewProps {
  logs: SystemLog[];
  onAddLog: (newLog: SystemLog) => void;
}

export const AnalyticsLogsView: React.FC<AnalyticsLogsViewProps> = ({
  logs,
  onAddLog
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [componentFilter, setComponentFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [showInjectModal, setShowInjectModal] = useState<boolean>(false);

  // New log form state
  const [newLevel, setNewLevel] = useState<'CRITICAL' | 'HIGH' | 'WARN' | 'INFO'>('INFO');
  const [newComponent, setNewComponent] = useState<'RADAR_DWR' | 'INSAT_3DR' | 'NEURAL_CLASSIFIER' | 'NDMA_CAP'>('RADAR_DWR');
  const [newMessage, setNewMessage] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.component.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.level === severityFilter;
    const matchesComponent = componentFilter === 'ALL' || log.component === componentFilter;
    return matchesSearch && matchesSeverity && matchesComponent;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Level', 'Component', 'Message'];
    const rows = filteredLogs.map(l => [l.id, l.timestamp, l.level, l.component, `"${l.message.replace(/"/g, '""')}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CycloneAI_Historical_Logs_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CycloneAI_Logs_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleInjectLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newLogItem: SystemLog = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ') + '.' + Math.floor(100 + Math.random() * 900) + ' UTC',
      level: newLevel,
      component: newComponent,
      message: newMessage,
      details: { manualInjection: true, operatorId: 'OPERATOR-ROOT-01' }
    };

    onAddLog(newLogItem);
    setNewMessage('');
    setShowInjectModal(false);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 p-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              MODULE 05
            </span>
            <span className="text-[11px] font-mono text-sky-700 font-medium">Telemetry Audit & Sensor Fleet</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900">
            Historical Log Analysis & Data Visualization Dashboards
          </h1>
          <p className="text-[13px] text-slate-600 mt-0.5">
            Full-spectrum telemetry query engine, audit log inspector, and sensor fleet operational metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowInjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-sky-700 hover:bg-slate-200 border border-slate-200 font-mono text-[12px] font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inject Telemetry Event</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 font-bold text-[12px] font-mono transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-mono text-[12px] transition-all"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Sensor Network Fleet Operational Health Matrix */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-600" />
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
              SENSOR NETWORK FLEET OPERATIONAL STATUS
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            7 OF 7 SENSORS ONLINE (100% HEALTH)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SENSOR_NETWORK.map((sensor: SensorStatus) => (
            <div key={sensor.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-500">{sensor.type}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {sensor.status}
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-slate-900 line-clamp-1">{sensor.name}</div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{sensor.details}</p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-200">
                <span>Ping: {sensor.lastPing}</span>
                <span className="text-sky-700 font-semibold">{sensor.latencyMs} ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Historical Log Query & Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Search & Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs by keyword, model, sensor, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-mono border border-slate-200">
            {['ALL', 'CRITICAL', 'HIGH', 'WARN', 'INFO', 'DEBUG'].map((level) => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  severityFilter === level ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Component Filter */}
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-mono text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Components</option>
            <option value="NEURAL_CLASSIFIER">Neural Classifier</option>
            <option value="ENSEMBLE_ENGINE">Ensemble Engine</option>
            <option value="XAI_ENGINE">XAI Engine</option>
            <option value="INSAT_3DR">INSAT-3DR</option>
            <option value="RADAR_DWR">Doppler DWR</option>
            <option value="NDMA_CAP">NDMA CAP</option>
            <option value="BUOY_NETWORK">Buoy Network</option>
          </select>

          {/* Streaming toggle */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-mono transition-all ${
              isStreaming 
                ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-sky-600 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isStreaming ? 'Live Bus' : 'Paused'}</span>
          </button>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left font-mono text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3">LOG ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">LEVEL</th>
                <th className="py-2.5 px-3">SUBSYSTEM</th>
                <th className="py-2.5 px-3">EVENT TELEMETRY MESSAGE</th>
                <th className="py-2.5 px-3 text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                    No log records match the current query filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 text-sky-700 font-bold">{log.id}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.level === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
                        log.level === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        log.level === 'WARN' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        log.level === 'INFO' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-semibold">{log.component}</td>
                    <td className="py-2.5 px-3 text-slate-600 line-clamp-1 max-w-lg">{log.message}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold hover:underline">
                        Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-2">
          <span>Showing {filteredLogs.length} of {logs.length} system telemetry events</span>
          <span>Buffer: 10,000 Event Ring Memory</span>
        </div>
      </div>

      {/* Log Drill-down Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-600" />
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">
                  Telemetry Event Inspector
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-[12px]">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 text-[10px]">EVENT ID</span>
                  <div className="text-sky-700 font-bold">{selectedLog.id}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">LEVEL</span>
                  <div className="text-red-600 font-bold">{selectedLog.level}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">SUBSYSTEM</span>
                  <div className="text-slate-900 font-semibold">{selectedLog.component}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">TIMESTAMP</span>
                  <div className="text-slate-900">{selectedLog.timestamp}</div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">Log Message Payload</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 mt-1 leading-relaxed">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Metadata JSON</label>
                  <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400 mt-1 text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-[12px] font-mono font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inject Telemetry Event Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <form 
            onSubmit={handleInjectLog}
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-600" />
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">
                  Inject Simulated Telemetry Event
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowInjectModal(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">SEVERITY LEVEL</label>
                  <select
                    value={newLevel}
                    onChange={(e: any) => setNewLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-mono text-slate-800"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="WARN">WARN</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">SUBSYSTEM</label>
                  <select
                    value={newComponent}
                    onChange={(e: any) => setNewComponent(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-mono text-slate-800"
                  >
                    <option value="RADAR_DWR">RADAR_DWR</option>
                    <option value="INSAT_3DR">INSAT_3DR</option>
                    <option value="NEURAL_CLASSIFIER">NEURAL_CLASSIFIER</option>
                    <option value="NDMA_CAP">NDMA_CAP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">TELEMETRY MESSAGE</label>
                <textarea
                  required
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="e.g. Doppler velocity scan azimuth synchronized at 1.5° elevation..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInjectModal(false)}
                className="px-4 py-2 rounded-xl text-[12px] font-mono text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-[12px] font-mono hover:bg-sky-700 shadow-xs"
              >
                Inject Into Telemetry Bus
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
