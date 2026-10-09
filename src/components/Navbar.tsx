import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  Database, 
  CheckCircle2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { SyntheticStudent } from '../types/edupath';

interface NavbarProps {
  activeTab: 'assistant' | 'escalations' | 'records' | 'benchmark';
  setActiveTab: (tab: 'assistant' | 'escalations' | 'records' | 'benchmark') => void;
  currentStudent: SyntheticStudent;
  onOpenStudentModal: () => void;
  openEscalationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentStudent,
  onOpenStudentModal,
  openEscalationsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  EduPath
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Guarded AI Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Ethical Student Support & Institutional Triage Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>Student Agent</span>
            </button>

            <button
              onClick={() => setActiveTab('escalations')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'escalations'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Escalation Queue</span>
              {openEscalationsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-400 text-rose-950 animate-pulse">
                  {openEscalationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'records'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Synthetic Records</span>
              <span className="md:hidden">Records</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'benchmark'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Guardrail Tester</span>
              <span className="sm:hidden">Safety</span>
            </button>
          </nav>

          {/* Active Student Switcher */}
          <div className="flex items-center">
            <button
              onClick={onOpenStudentModal}
              className="group flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all text-left"
              title="Switch synthetic student profile"
            >
              <div className="relative">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                    currentStudent.attendanceStatus === 'Good'
                      ? 'bg-emerald-400'
                      : currentStudent.attendanceStatus === 'At Risk'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
              </div>
              <div className="hidden lg:block text-xs">
                <div className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1">
                  {currentStudent.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span>{currentStudent.id}</span>
                  <span className="text-slate-600">•</span>
                  <span className={currentStudent.attendanceRate < 70 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                    {currentStudent.attendanceRate}% Attd
                  </span>
                </div>
              </div>
              <div className="lg:hidden text-slate-400">
                <UserCheck className="w-4 h-4 text-indigo-400" />
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
