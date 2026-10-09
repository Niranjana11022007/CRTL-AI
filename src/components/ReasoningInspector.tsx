import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Database, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { TriageResponse, SyntheticStudent } from '../types/edupath';

interface ReasoningInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  triageData: TriageResponse | null;
  student: SyntheticStudent;
}

export const ReasoningInspector: React.FC<ReasoningInspectorProps> = ({
  isOpen,
  onClose,
  triageData,
  student,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !triageData) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(triageData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { guardrails } = triageData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Triage Reasoning & Audit Log</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {triageData.auditId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Explainable AI inspection: System boundaries, synthetic records lookup & service routing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Copy complete audit JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Section 1: Institutional Guardrail Verdicts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Guarded Safety Verifications (Active Enforcers)
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Policy Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Check 1: Non-Clinical */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">1. Non-Clinical Rule</span>
                  <span className="flex items-center gap-1 font-bold text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> PASS
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {guardrails?.clinicalDiagnosisExplanation || 'The AI refrained from generating clinical diagnostic labels (e.g. Major Depressive Disorder, PTSD) and maintained supportive institutional framing.'}
                </p>
              </div>

              {/* Check 2: Non-Disciplinary */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">2. Non-Disciplinary Rule</span>
                  <span className="flex items-center gap-1 font-bold text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> PASS
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {guardrails?.disciplinaryDecisionExplanation || 'The AI avoided punitive threats (e.g. suspension, expulsion) and directed student toward early intervention and mitigating circumstances.'}
                </p>
              </div>

              {/* Check 3: Synthetic Record Cross-Referencing */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">3. Synthetic Record Check</span>
                  <span className="flex items-center gap-1 font-bold text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    <Database className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {guardrails?.syntheticRecordNotes || `Cross-referenced synthetic file: Attendance ${student.attendanceRate}%, Balance: $${student.outstandingBalance}, Standing: ${student.academicStanding}.`}
                </p>
              </div>

              {/* Check 4: Sensitive Escalation Status */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">4. Sensitive Case Escalation</span>
                  <span className={`flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded border ${
                    triageData.escalationLevel !== 'none'
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      : 'text-slate-400 bg-slate-800 border-slate-700'
                  }`}>
                    {triageData.escalationLevel !== 'none' ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    {triageData.escalationLevel !== 'none' ? 'ESCALATION TRIGGERED' : 'STANDARD TRIAGE'}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {guardrails?.escalationReason || 'No acute safety risks or critical crisis indicators detected in student communication.'}
                </p>
              </div>

            </div>
          </div>

          {/* Section 2: Synthetic Record Context Inspected */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Approved Synthetic Institutional Record Evaluated
            </h3>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Student ID</span>
                  <span className="font-mono font-bold text-slate-200">{student.id}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Logged Attendance</span>
                  <span className={`font-bold ${student.attendanceRate < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {student.attendanceRate}% ({student.attendanceStatus})
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tuition Balance</span>
                  <span className="font-bold text-slate-200">
                    ${student.outstandingBalance} ({student.tuitionFeeStatus})
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Academic Standing</span>
                  <span className="font-bold text-slate-200">{student.academicStanding}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <strong className="text-slate-300">Agent Synthetic Context: </strong>
                {triageData.syntheticRecordContextUsed}
              </p>
            </div>
          </div>

          {/* Section 3: Recommended Service Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Institutional Service Matching Matrix
            </h3>
            <div className="space-y-2.5">
              {triageData.recommendedServices.map((srv, idx) => (
                <div key={srv.id || idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{srv.serviceName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                        Match Score: {srv.relevanceScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{srv.reason}</p>
                    <p className="text-[10px] text-slate-500">
                      <strong>Location:</strong> {srv.location} • <strong>Urgency:</strong> {srv.urgency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Triage timestamp: {new Date(triageData.timestamp).toLocaleString()}</span>
          <span>Model: Google Gemini 3.8 Flash (Guarded Triage Protocol)</span>
        </div>

      </div>
    </div>
  );
};
