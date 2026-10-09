import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatAssistant } from './components/ChatAssistant';
import { EscalationDashboard } from './components/EscalationDashboard';
import { SyntheticRecordsView } from './components/SyntheticRecordsView';
import { GuardrailTester } from './components/GuardrailTester';
import { StudentSelector } from './components/StudentSelector';
import { SyntheticStudent, Appointment } from './types/edupath';
import { SYNTHETIC_STUDENTS } from './data/syntheticData';
import { CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'escalations' | 'records' | 'benchmark'>('assistant');
  const [students, setStudents] = useState<SyntheticStudent[]>(SYNTHETIC_STUDENTS);
  const [currentStudent, setCurrentStudent] = useState<SyntheticStudent>(SYNTHETIC_STUDENTS[0]);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [openEscalationsCount, setOpenEscalationsCount] = useState(1);
  const [initialPromptForChat, setInitialPromptForChat] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch live student profiles & escalation counters from backend
  const refreshBackendData = async () => {
    try {
      const [studentsRes, escalationsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/escalations'),
      ]);

      const studentsData = await studentsRes.json();
      if (studentsData.success && studentsData.students) {
        setStudents(studentsData.students);
        // keep currentStudent up to date
        const matched = studentsData.students.find((s: SyntheticStudent) => s.id === currentStudent.id);
        if (matched) setCurrentStudent(matched);
      }

      const escalationsData = await escalationsRes.json();
      if (escalationsData.success && escalationsData.escalations) {
        const count = escalationsData.escalations.filter((e: any) => e.status !== 'Resolved').length;
        setOpenEscalationsCount(count);
      }
    } catch (err) {
      console.log('Running in client state mode:', err);
    }
  };

  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 15000);
    return () => clearInterval(interval);
  }, [currentStudent.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAppointmentBooked = (apt: Appointment) => {
    showToast(`Appointment confirmed: ${apt.serviceName} (${apt.referenceCode})`);
    refreshBackendData();
  };

  const handleLoadPromptInChat = (student: SyntheticStudent, prompt: string) => {
    setCurrentStudent(student);
    setInitialPromptForChat(prompt);
    setActiveTab('assistant');
    showToast(`Loaded test scenario for ${student.name}`);
  };

  const handleUpdateStudent = (updatedStudent: SyntheticStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    if (currentStudent.id === updatedStudent.id) {
      setCurrentStudent(updatedStudent);
    }
    showToast(`Synthetic record updated for ${updatedStudent.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900/90 text-white border border-indigo-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStudent={currentStudent}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        openEscalationsCount={openEscalationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'assistant' && (
          <ChatAssistant
            currentStudent={currentStudent}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
            onAppointmentBooked={handleAppointmentBooked}
            initialPrompt={initialPromptForChat}
            onClearInitialPrompt={() => setInitialPromptForChat('')}
          />
        )}

        {activeTab === 'escalations' && (
          <EscalationDashboard onRefresh={refreshBackendData} />
        )}

        {activeTab === 'records' && (
          <SyntheticRecordsView
            students={students}
            currentStudent={currentStudent}
            onUpdateStudent={handleUpdateStudent}
            onSelectStudent={(s) => {
              setCurrentStudent(s);
              showToast(`Switched active chat profile to ${s.name}`);
            }}
          />
        )}

        {activeTab === 'benchmark' && (
          <GuardrailTester onLoadPromptInChat={handleLoadPromptInChat} />
        )}
      </main>

      {/* Synthetic Student Profile Selector Modal */}
      <StudentSelector
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={(selected) => {
          setCurrentStudent(selected);
          showToast(`Active profile switched to ${selected.name}`);
        }}
      />

      {/* Footer with institutional ethics statement */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>EduPath AI Triage Framework • Built for University Student Success</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Guarded AI Policy</span>
            <span>•</span>
            <span>Zero Clinical Diagnosis</span>
            <span>•</span>
            <span>Zero Disciplinary Actions</span>
            <span>•</span>
            <span className="text-slate-400">FERPA Synthetic Sandbox</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
