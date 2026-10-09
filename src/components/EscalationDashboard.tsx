import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Phone, 
  UserCheck, 
  ExternalLink, 
  Search, 
  Filter, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { EscalationCase } from '../types/edupath';

interface EscalationDashboardProps {
  onRefresh?: () => void;
}

export const EscalationDashboard: React.FC<EscalationDashboardProps> = () => {
  const [escalations, setEscalations] = useState<EscalationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Review' | 'Resolved'>('All');
  const [selectedCase, setSelectedCase] = useState<EscalationCase | null>(null);
  const [advisorName, setAdvisorName] = useState('Dr. Clara Higgins (Duty Lead)');
  const [actionNote, setActionNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/escalations');
      const data = await res.json();
      if (data.success && data.escalations) {
        setEscalations(data.escalations);
        if (!selectedCase && data.escalations.length > 0) {
          setSelectedCase(data.escalations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleCaseAction = async (action: 'assign' | 'outreach' | 'resolve') => {
    if (!selectedCase) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/escalations/${selectedCase.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          advisorName,
          note: actionNote,
        }),
      });
      const data = await res.json();
      if (data.success && data.escalation) {
        setEscalations((prev) =>
          prev.map((e) => (e.id === selectedCase.id ? data.escalation : e))
        );
        setSelectedCase(data.escalation);
        setActionNote('');
      }
    } catch (err) {
      console.error('Error actioning case:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const filtered = escalations.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const criticalCount = escalations.filter((c) => c.escalationLevel === 'critical_crisis' && c.status !== 'Resolved').length;
  const openCount = escalations.filter((c) => c.status === 'Open').length;
  const inReviewCount = escalations.filter((c) => c.status === 'In Review').length;
  const resolvedCount = escalations.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Human Staff Escalation Queue
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  Live Dispatch
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Institutional Welfare & Case Management: Non-clinical AI hand-off to certified university advisors.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchEscalations}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Critical Crisis</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires &lt;15 min human contact</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400 block">Open Pending</span>
          <div className="text-2xl font-black text-amber-400 mt-2">{openCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting advisor assignment</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400 block">In Review / Outreach</span>
          <div className="text-2xl font-black text-sky-400 mt-2">{inReviewCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active case worker engaged</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400 block">Resolved Cases</span>
          <div className="text-2xl font-black text-emerald-400 mt-2">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Safely routed & closed</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of Escalation Cases */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
            {(['All', 'Open', 'In Review', 'Resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 text-center text-slate-500 text-xs">
                No escalated cases in this filter category.
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedCase?.id === item.id;
                const isCritical = item.escalationLevel === 'critical_crisis';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCase(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.escalationLevel === 'critical_crisis' ? 'Critical Crisis' : 'High Priority'}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{item.studentName}</span>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'In Review'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                      "{item.triggerPhrase}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="font-mono text-slate-500">{item.referenceCode}</span>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Case Management & Action Console */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              
              {/* Header details */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedCase.studentName}</h2>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {selectedCase.studentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedCase.program} • Year {selectedCase.yearOfStudy}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-500 block">Case Ref: {selectedCase.referenceCode}</span>
                  <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedCase.escalationLevel === 'critical_crisis'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedCase.escalationLevel === 'critical_crisis' ? 'URGENT CRISIS PROTOCOL' : 'HIGH PRIORITY ESCALATION'}
                  </span>
                </div>
              </div>

              {/* Trigger Phrase Box */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Triggering Disclosure / Concern
                </span>
                <p className="text-sm font-medium text-rose-100">
                  "{selectedCase.triggerPhrase}"
                </p>
              </div>

              {/* Synthetic Snapshot */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Synthetic Record Snapshot at Triage Time
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block text-[10px]">Attendance</span>
                    <span className={`font-bold ${selectedCase.syntheticSnapshot?.attendance < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selectedCase.syntheticSnapshot?.attendance}%
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block text-[10px]">Fee Ledger</span>
                    <span className="font-bold text-slate-200">
                      {selectedCase.syntheticSnapshot?.feeStatus}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block text-[10px]">Academic Standing</span>
                    <span className="font-bold text-slate-200">
                      {selectedCase.syntheticSnapshot?.academicStanding}
                    </span>
                  </div>
                </div>
              </div>

              {/* Case Action Log */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Case Activity & Audit Trail
                </h4>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
                  {selectedCase.actionNotes.map((note, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                  {selectedCase.assignedAdvisor && (
                    <div className="text-xs text-indigo-300 flex items-center gap-2 pt-1 border-t border-slate-800/80">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assigned Case Officer: <strong>{selectedCase.assignedAdvisor}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Console Form */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Human Officer Intervention
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Acting Officer Name</label>
                    <input
                      type="text"
                      value={advisorName}
                      onChange={(e) => setAdvisorName(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Intervention Note (Logged to Audit)</label>
                    <input
                      type="text"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="e.g. Conducted phone check-in; student safely with peer support."
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    disabled={submittingAction || selectedCase.status === 'Resolved'}
                    onClick={() => handleCaseAction('assign')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Assign to Me</span>
                  </button>

                  <button
                    disabled={submittingAction || selectedCase.status === 'Resolved'}
                    onClick={() => handleCaseAction('outreach')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Dispatch Welfare Outreach</span>
                  </button>

                  <button
                    disabled={submittingAction || selectedCase.status === 'Resolved'}
                    onClick={() => handleCaseAction('resolve')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all ml-auto disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Case Resolved</span>
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              Select an escalated case from the queue to view full synthetic context and execute intervention protocols.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
