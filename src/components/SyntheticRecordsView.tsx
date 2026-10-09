import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  UserCheck, 
  Activity, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  Edit3, 
  Save, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { SyntheticStudent } from '../types/edupath';

interface SyntheticRecordsViewProps {
  students: SyntheticStudent[];
  currentStudent: SyntheticStudent;
  onUpdateStudent: (student: SyntheticStudent) => void;
  onSelectStudent: (student: SyntheticStudent) => void;
}

export const SyntheticRecordsView: React.FC<SyntheticRecordsViewProps> = ({
  students,
  currentStudent,
  onUpdateStudent,
  onSelectStudent,
}) => {
  const [activeTabStudentId, setActiveTabStudentId] = useState<string>(currentStudent.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttendance, setEditedAttendance] = useState(currentStudent.attendanceRate);
  const [editedBalance, setEditedBalance] = useState(currentStudent.outstandingBalance);
  const [editedStatus, setEditedStatus] = useState(currentStudent.attendanceStatus);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeStudent = students.find((s) => s.id === activeTabStudentId) || currentStudent;

  const handleStartEdit = () => {
    setEditedAttendance(activeStudent.attendanceRate);
    setEditedBalance(activeStudent.outstandingBalance);
    setEditedStatus(activeStudent.attendanceStatus);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updated: SyntheticStudent = {
      ...activeStudent,
      attendanceRate: Number(editedAttendance),
      outstandingBalance: Number(editedBalance),
      attendanceStatus: editedStatus,
      tuitionFeeStatus: Number(editedBalance) > 0 ? (activeStudent.tuitionFeeStatus === 'Paid' ? 'Outstanding Balance' : activeStudent.tuitionFeeStatus) : 'Paid',
    };

    try {
      await fetch(`/api/students/${activeStudent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      onUpdateStudent(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Compliance Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Approved Synthetic Records Vault
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                  FERPA / GDPR Synthetic Sandbox
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Privacy-preserving institutional mock records queried by the AI triage agent for student context.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Consent for AI Data Triage: </span>
          <span className="font-bold text-emerald-400">ACTIVE & VERIFIED</span>
        </div>
      </div>

      {/* Student Profile Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {students.map((student) => {
          const isActive = student.id === activeTabStudentId;
          return (
            <button
              key={student.id}
              onClick={() => {
                setActiveTabStudentId(student.id);
                setIsEditing(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <img
                src={student.avatar}
                alt={student.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{student.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({student.attendanceRate}%)</span>
            </button>
          );
        })}
      </div>

      {/* Active Profile Full View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Banner with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start gap-4">
            <img
              src={activeStudent.avatar}
              alt={activeStudent.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeStudent.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {activeStudent.id}
                </span>
                {activeStudent.id === currentStudent.id ? (
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    Active in Chat
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectStudent(activeStudent)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-1"
                  >
                    Set Active in Chat
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activeStudent.program} • {activeStudent.school} • Year {activeStudent.yearOfStudy}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{activeStudent.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Record Updated
              </span>
            )}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Modify numbers to test how the AI Agent triage behaves"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Record Change</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric: Attendance */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Attendance Rate
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeStudent.attendanceRate < 65
                  ? 'bg-rose-500/20 text-rose-300'
                  : activeStudent.attendanceRate < 75
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {activeStudent.attendanceStatus}
              </span>
            </div>
            {isEditing ? (
              <div className="pt-2 space-y-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={editedAttendance}
                  onChange={(e) => setEditedAttendance(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-white font-bold"
                />
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="Good">Good</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Critical Review">Critical Review</option>
                </select>
              </div>
            ) : (
              <div>
                <div className={`text-2xl font-black mt-1 ${
                  activeStudent.attendanceRate < 65 ? 'text-rose-400' : activeStudent.attendanceRate < 75 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {activeStudent.attendanceRate}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {activeStudent.missedSessionsCount} missed / {activeStudent.totalSessionsCount} recorded
                </div>
              </div>
            )}
          </div>

          {/* Metric: Tuition & Finances */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Outstanding Balance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {activeStudent.tuitionFeeStatus}
              </span>
            </div>
            {isEditing ? (
              <div className="pt-2">
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={editedBalance}
                  onChange={(e) => setEditedBalance(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-white font-bold"
                />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-black text-slate-100 mt-1">
                  ${activeStudent.outstandingBalance}
                </div>
                <div className="text-[11px] text-slate-500">
                  Emergency Hardship: {activeStudent.emergencyFundEligible ? 'Eligible' : 'Not Requested'}
                </div>
              </div>
            )}
          </div>

          {/* Metric: Academic Standing */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-slate-400 text-xs flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> Academic Standing
            </div>
            <div className="text-2xl font-black text-slate-100 mt-1">
              GPA {activeStudent.gpa}
            </div>
            <div className="text-[11px] text-slate-500">
              {activeStudent.academicStanding}
            </div>
          </div>

          {/* Metric: Triage Consent & FERPA */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-slate-400 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Synthetic Privacy
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Zero PII Stored
            </div>
            <div className="text-[11px] text-slate-500">
              Generated for EduPath institutional testbed
            </div>
          </div>

        </div>

        {/* Modules Attendance Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Current Semester Enrolled Modules & Attendance Heatmap
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeStudent.recentModules.map((m) => (
              <div
                key={m.code}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {m.code}
                    </span>
                    <span className="text-xs font-semibold text-white">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">{m.credits} Academic Credits</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    m.attendance < 65 ? 'text-rose-400' : m.attendance < 75 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {m.attendance}%
                  </span>
                  <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${
                        m.attendance < 65 ? 'bg-rose-500' : m.attendance < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${m.attendance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Support History */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Previous Campus Support Encounters
          </h3>
          {activeStudent.pastSupportVisits.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 text-center text-slate-500 text-xs">
              No previous campus support visits recorded for this synthetic student.
            </div>
          ) : (
            <div className="space-y-2">
              {activeStudent.pastSupportVisits.map((visit, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{visit.serviceName}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{visit.advisorName}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{visit.notesSummary}</p>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap ml-4">{visit.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Story Context */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-indigo-200">Synthetic Persona Background & Stressors:</span>
            <p className="text-slate-300 mt-1 leading-relaxed">
              "{activeStudent.notes}"
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
