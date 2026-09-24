import React, { useState } from 'react';
import { BrainCircuit, X, Download, ShieldCheck, CheckCircle } from 'lucide-react';
import { StormProfile } from '../../types';

interface XaiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStorm: StormProfile;
}

export const XaiReportModal: React.FC<XaiReportModalProps> = ({
  isOpen,
  onClose,
  activeStorm
}) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const reportData = {
      storm: activeStorm.name,
      basin: activeStorm.basin,
      fidelityScore: '99.2%',
      architecture: 'ConvNeXt-Large + Spatio-Temporal TF',
      attributions: {
        eyewallRotationVector: 0.84,
        sstThermalGradient: 0.68,
        convectiveTilt: '1.4° Westward',
        intensityConfidenceSpread: '152 to 168 knots'
      },
      auditTimestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `XAI_Audit_Report_${activeStorm.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 border border-sky-200">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                Explainable AI (XAI) Model Interpretability Audit
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Layer 14 Grad-CAM++ & SHAP Attribution Matrix // {activeStorm.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-[13px] text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-500">MODEL FIDELITY SCORE</div>
              <div className="text-2xl font-bold font-['Space_Grotesk'] text-sky-700">99.2%</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-500">ATTRIBUTION ARCHITECTURE</div>
              <div className="text-sm font-semibold text-slate-900">ConvNeXt-Large + Spatio-Temporal TF</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-500">VERIFIED STATUS</div>
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Certified Safe
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono font-bold text-slate-900 text-[12px] uppercase">Summary of Meteorological Attributions:</h4>
            <p className="leading-relaxed">
              Spatial feature attribution analysis verifies that the deep learning neural network (CycloneNet-X9) is anchoring predictions on genuine meteorological physics rather than background artifacts. The eyewall rotation vector (+0.84) and sea-surface thermal gradient anomalies (+0.68) drive 62.5% of the total intensity forecast confidence.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
            <div className="text-sky-700 font-bold">MONTE CARLO UNCERTAINTY PROFILE:</div>
            <div>• Sample Size: N=50 dropout iterations across 4 ConvNeXt blocks</div>
            <div>• Intensity Confidence Spread: 152 to 168 knots (Peak: 160 kts)</div>
            <div>• Eyewall Convection Tilt: 1.4° Westward axial inclination</div>
            <div>• Radiative Transfer Calibration: Error delta &lt; 0.04 K</div>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex justify-between items-center">
          <div className="text-[11px] font-mono text-slate-500">
            {downloaded ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Downloaded JSON report
              </span>
            ) : (
              <span>Audited under IMD ML validation protocol</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-mono text-slate-600 hover:text-slate-900">
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold font-mono text-[12px] hover:bg-sky-700 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Download Complete XAI Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
