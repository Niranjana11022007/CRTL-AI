import React, { useState } from 'react';
import { 
  X, 
  Check, 
  AlertCircle, 
  GraduationCap, 
  DollarSign, 
  Activity, 
  UserCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { SyntheticStudent } from '../types/edupath';

interface StudentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  students: SyntheticStudent[];
  currentStudent: SyntheticStudent;
  onSelectStudent: (student: SyntheticStudent) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  isOpen,
  onClose,
  students,
  currentStudent,
  onSelectStudent,
}) => {
  const [filter, setFilter] = useState<'all' | 'attendance' | 'finances' | 'wellbeing'>('all');

  if (!isOpen) return null;

  const filteredStudents = students.filter(s => {
    if (filter === 'attendance') return s.attendanceStatus !== 'Good';
    if (filter === 'finances') return s.outstandingBalance > 0;
    if (filter === 'wellbeing') return s.program.includes('Nursing') || s.notes.toLowerCase().includes('stress') || s.notes.toLowerCase().includes('burnout');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Select Synthetic Student Profile</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test how EduPath corroborates approved institutional records for diverse student concerns.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1">Filter by concern:</span>
          {(['all', 'attendance', 'finances', 'wellbeing'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Personas' : tab}
            </button>
          ))}
        </div>

        {/* List of Personas */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-800/40">
          {filteredStudents.map((student) => {
            const isSelected = student.id === currentStudent.id;
            return (
              <div
                key={student.id}
                onClick={() => {
                  onSelectStudent(student);
                  onClose();
                }}
                className={`pt-3.5 first:pt-0 p-4 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/80 ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">{student.name}</h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {student.id}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        <span>{student.program} • Year {student.yearOfStudy}</span>
                      </p>

                      {/* Context pill badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {/* Attendance Pill */}
                        <div
                          className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-medium border ${
                            student.attendanceRate < 65
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : student.attendanceRate < 75
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <Activity className="w-3 h-3" />
                          <span>Attendance: {student.attendanceRate}% ({student.attendanceStatus})</span>
                        </div>

                        {/* Tuition Pill */}
                        <div
                          className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-medium border ${
                            student.outstandingBalance > 0
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>
                            {student.tuitionFeeStatus}
                            {student.outstandingBalance > 0 ? ` ($${student.outstandingBalance})` : ''}
                          </span>
                        </div>

                        {/* Academic Standing */}
                        <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{student.academicStanding} (GPA {student.gpa})</span>
                        </div>
                      </div>

                      {/* Synthetic backstory / current challenge */}
                      <p className="text-xs text-slate-300 mt-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 italic">
                        "{student.notes}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>All profiles are approved synthetic records adhering to FERPA & GDPR standards.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
