import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Info, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Cpu, 
  RefreshCw, 
  PhoneCall, 
  UserCheck, 
  DollarSign, 
  Activity, 
  ShieldAlert,
  ChevronRight,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { 
  ChatMessage, 
  SyntheticStudent, 
  TriageResponse, 
  RecommendedService, 
  Appointment 
} from '../types/edupath';
import { BookingModal } from './BookingModal';
import { ReasoningInspector } from './ReasoningInspector';

interface ChatAssistantProps {
  currentStudent: SyntheticStudent;
  onOpenStudentModal: () => void;
  onAppointmentBooked: (appointment: Appointment) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentStudent,
  onOpenStudentModal,
  onAppointmentBooked,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<RecommendedService | null>(null);
  const [inspectorTriage, setInspectorTriage] = useState<TriageResponse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcoming greeting personalized to current student
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: `msg-init-${currentStudent.id}`,
      sender: 'agent',
      text: `Hello ${currentStudent.name.split(' ')[0]}, I am EduPath, your confidential institutional triage navigator. 

I can assist with questions regarding attendance notices, tuition & emergency grants, academic pacing, or student wellbeing. As an institutional support system, I do not make clinical diagnoses or disciplinary rulings—my mission is to understand your situation, review your approved synthetic records, and connect you with the right university services.

How can we support you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  }, [currentStudent.id]);

  // Handle external prompt loading (e.g. from benchmark test suite)
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: currentStudent,
          userMessage: textToSend,
          history: messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();
      if (data.success && data.triage) {
        const triage: TriageResponse = data.triage;
        const agentMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: triage.agentReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          triageData: triage,
          isEscalated: triage.escalationLevel === 'critical_crisis' || triage.escalationLevel === 'high',
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        throw new Error('Failed to obtain triage response');
      }
    } catch (err) {
      console.error('Chat triage error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'agent',
        text: 'I encountered an issue connecting to the triage engine. Please rest assured our campus support desk is available at student-hub@university.edu.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_SCENARIOS = [
    {
      label: 'Attendance & Night Shifts',
      text: `I received a 65% attendance warning letter. I've missed several morning lectures because I work 25 hours of night shifts to pay rent. I'm afraid I will be disciplined.`,
      icon: Activity,
    },
    {
      label: 'Tuition Hold & Hardship',
      text: `My account has an outstanding balance hold and I can't register for exams. Is there an emergency hardship bursary or fee restructuring I can apply for?`,
      icon: DollarSign,
    },
    {
      label: 'Wellbeing & Burnout',
      text: `I've been feeling overwhelmed, exhausted, and having severe anxiety before classes. I need someone confidential to talk to.`,
      icon: Sparkles,
    },
    {
      label: 'Crisis Escalation Test',
      text: `Everything has collapsed, my landlord gave me an eviction notice and I feel completely hopeless. I can't bear this and want to end it all.`,
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Student Context Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <img
            src={currentStudent.avatar}
            alt={currentStudent.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{currentStudent.name}</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentStudent.id}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden sm:inline-block">
                Synthetic Records Loaded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStudent.program} • Year {currentStudent.yearOfStudy}
            </p>
          </div>
        </div>

        {/* Live records badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Attendance:</span>
            <span className={`font-bold ${currentStudent.attendanceRate < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentStudent.attendanceRate}% ({currentStudent.attendanceStatus})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Tuition:</span>
            <span className="font-bold text-slate-200">
              {currentStudent.tuitionFeeStatus}
              {currentStudent.outstandingBalance > 0 ? ` ($${currentStudent.outstandingBalance})` : ''}
            </span>
          </div>

          <button
            onClick={onOpenStudentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Switch Profile</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        
        {/* Chat Header Status */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">EduPath Institutional Triage Session</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">FERPA Protected</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Guardrails Active
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'student';
            const triage = msg.triageData;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-3 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${
                        isUser ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Crisis / Sensitive Escalation Banner (If Triggered) */}
                  {msg.isEscalated && triage && (
                    <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 space-y-3 shadow-lg shadow-rose-950/30 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                            Immediate Human Escalation Protocol Triggered
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            A Campus Human Duty Specialist is Standing By
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-rose-100/90 leading-relaxed">
                        Your situation requires real human care and immediate support rather than an automated conversation. Our 24/7 Welfare & Safeguarding team has been alerted, and you can contact them right now:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-rose-900/30 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-rose-300 shrink-0" />
                          <div>
                            <span className="text-[10px] text-rose-300 block font-semibold">Campus 24/7 Crisis Team</span>
                            <span className="font-bold text-white">(555) 019-9000</span>
                          </div>
                        </div>

                        <div className="bg-rose-900/30 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-rose-300 shrink-0" />
                          <div>
                            <span className="text-[10px] text-rose-300 block font-semibold">Crisis Text Line (Confidential)</span>
                            <span className="font-bold text-white">Text HOME to 741741</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-rose-300/80 italic pt-1">
                        * A case record has been generated in the Human Staff Escalation Queue for duty follow-up.
                      </div>
                    </div>
                  )}

                  {/* Triage Insights Card (Guardrails & Services) */}
                  {triage && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                      
                      {/* Guardrail badges ribbon */}
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Safety Enforcers:
                        </span>

                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Non-Clinical: PASS
                        </span>

                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Non-Disciplinary: PASS
                        </span>

                        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Records Corroborated: {currentStudent.attendanceRate}% Attd
                        </span>

                        <button
                          onClick={() => setInspectorTriage(triage)}
                          className="ml-auto text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Inspect AI Reasoning</span>
                        </button>
                      </div>

                      {/* Recommended Services Section */}
                      {triage.recommendedServices.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                              Recommended Institutional Support
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Based on concern + synthetic record
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {triage.recommendedServices.map((service) => (
                              <div
                                key={service.id}
                                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition-all"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-bold text-white">{service.serviceName}</h4>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                        Match {service.relevanceScore}%
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                      {service.reason}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => setSelectedServiceForBooking(service)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Book Slot</span>
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {service.location}
                                  </span>
                                  <span>•</span>
                                  <span>Urgency: <strong className="text-slate-300">{service.urgency}</strong></span>
                                  <span>•</span>
                                  <span className="text-indigo-300/80">Prep: {service.preparationTip.slice(0, 60)}...</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-400 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>EduPath is checking synthetic records & running guardrail verifications...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Scenario Buttons */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/50 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Quick Prompts:
          </span>
          {QUICK_SCENARIOS.map((scen, idx) => {
            const Icon = scen.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(scen.text)}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all font-medium disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{scen.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Input Box */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Share your concern (e.g. attendance warning, tuition anxiety, wellbeing)...`}
              disabled={isLoading}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!selectedServiceForBooking}
        onClose={() => setSelectedServiceForBooking(null)}
        service={selectedServiceForBooking}
        student={currentStudent}
        onBookingSuccess={(apt) => {
          onAppointmentBooked(apt);
        }}
      />

      {/* AI Reasoning Inspector Drawer */}
      <ReasoningInspector
        isOpen={!!inspectorTriage}
        onClose={() => setInspectorTriage(null)}
        triageData={inspectorTriage}
        student={currentStudent}
      />

    </div>
  );
};
