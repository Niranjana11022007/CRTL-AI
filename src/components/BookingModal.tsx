import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  CheckCircle2, 
  Download, 
  UserCheck, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { RecommendedService, SupportAdvisor, SyntheticStudent, Appointment } from '../types/edupath';
import { SUPPORT_ADVISORS } from '../data/syntheticData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: RecommendedService | null;
  student: SyntheticStudent;
  onBookingSuccess: (appointment: Appointment) => void;
  auditId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  service,
  student,
  onBookingSuccess,
  auditId,
}) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<SupportAdvisor>(SUPPORT_ADVISORS[0]);
  const [selectedDay, setSelectedDay] = useState<string>('Tomorrow, Oct 10');
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM');
  const [selectedMode, setSelectedMode] = useState<'In-Person' | 'Virtual Video' | 'Phone Call'>('In-Person');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  if (!isOpen || !service) return null;

  // Filter advisors matching this service or default
  const relevantAdvisors = SUPPORT_ADVISORS.filter(
    (adv) => adv.serviceId === service.id || adv.serviceName.includes(service.serviceName.split(' ')[0])
  );
  const advisorOptions = relevantAdvisors.length > 0 ? relevantAdvisors : SUPPORT_ADVISORS;

  const handleBook = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          serviceId: service.id,
          serviceName: service.serviceName,
          advisorId: selectedAdvisor.id,
          advisorName: selectedAdvisor.name,
          date: selectedDay,
          timeSlot: selectedSlot,
          mode: selectedMode,
          concernNotes: notes || `Consultation regarding ${service.serviceName}`,
          triageAuditId: auditId,
        }),
      });

      const data = await response.json();
      if (data.success && data.appointment) {
        setConfirmedBooking(data.appointment);
        onBookingSuccess(data.appointment);
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EduPath Student Support//EN
BEGIN:VEVENT
SUMMARY:EduPath Support Appointment: ${confirmedBooking.serviceName}
DESCRIPTION:Advisor: ${confirmedBooking.advisorName}\\nMode: ${confirmedBooking.mode}\\nRef: ${confirmedBooking.referenceCode}\\nNotes: ${confirmedBooking.concernNotes}
LOCATION:${confirmedBooking.locationOrLink}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${confirmedBooking.referenceCode}-invite.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAndClose = () => {
    setConfirmedBooking(null);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Book Support Appointment</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Confidential, non-disciplinary booking with campus specialist
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {confirmedBooking ? (
            /* Confirmation Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Appointment Confirmed
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  You are all set, {student.name.split(' ')[0]}!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  A confidential calendar invite and prep guide have been registered. Your synthetic student record has been updated.
                </p>
              </div>

              {/* Ticket Details Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs text-slate-400">Reference ID</span>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {confirmedBooking.referenceCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Service</span>
                    <span className="text-slate-200 font-medium">{confirmedBooking.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Specialist</span>
                    <span className="text-slate-200 font-medium">{confirmedBooking.advisorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date & Time</span>
                    <span className="text-slate-200 font-medium">
                      {confirmedBooking.date} • {confirmedBooking.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Format & Location</span>
                    <span className="text-slate-200 font-medium flex items-center gap-1">
                      {confirmedBooking.mode === 'Virtual Video' ? <Video className="w-3.5 h-3.5 text-sky-400" /> : <MapPin className="w-3.5 h-3.5 text-amber-400" />}
                      {confirmedBooking.mode}
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-2.5 text-[11px] text-indigo-300">
                  <p className="font-semibold text-indigo-200">Preparation Tip:</p>
                  <p className="mt-0.5">{service.preparationTip}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadCalendar}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  Download .ICS Invite
                </button>
                <button
                  onClick={resetAndClose}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <>
              {/* Selected Service Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
                    Target Service
                  </span>
                  <h4 className="text-sm font-bold text-white">{service.serviceName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{service.department}</p>
                </div>
              </div>

              {/* Advisor Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Campus Specialist
                </label>
                <div className="space-y-2">
                  {advisorOptions.map((adv) => (
                    <div
                      key={adv.id}
                      onClick={() => setSelectedAdvisor(adv)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedAdvisor.id === adv.id
                          ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/40'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={adv.avatar}
                          alt={adv.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{adv.name}</p>
                          <p className="text-[11px] text-slate-400">{adv.role}</p>
                          <p className="text-[10px] text-indigo-300/80 mt-0.5">{adv.specialization}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedAdvisor.id === adv.id
                          ? 'border-indigo-400 bg-indigo-500'
                          : 'border-slate-600'
                      }`}>
                        {selectedAdvisor.id === adv.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Consultation Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'In-Person' as const, icon: MapPin, desc: 'Central Hub 204' },
                    { mode: 'Virtual Video' as const, icon: Video, desc: 'Secure Web Link' },
                    { mode: 'Phone Call' as const, icon: Phone, desc: 'Direct Callback' },
                  ].map(({ mode, icon: Icon, desc }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedMode === mode
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-indigo-400 mb-1" />
                      <div className="text-xs font-semibold">{mode}</div>
                      <div className="text-[10px] text-slate-500">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Date
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Today (Urgent Drop-in)">Today (Urgent Drop-in)</option>
                    <option value="Tomorrow, Oct 10">Tomorrow, Oct 10</option>
                    <option value="Friday, Oct 11">Friday, Oct 11</option>
                    <option value="Monday, Oct 14">Monday, Oct 14</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Time Slot
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="1:30 PM">1:30 PM</option>
                    <option value="2:45 PM">2:45 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Note / Context */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Private Note for Specialist (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need to explain attendance letter because of night shifts, or ask about emergency grant eligibility..."
                  rows={2}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBook}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  {isSubmitting ? (
                    'Confirming Slot...'
                  ) : (
                    <>
                      <span>Confirm & Book Appointment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
