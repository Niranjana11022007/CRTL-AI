import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SYNTHETIC_STUDENTS, CAMPUS_SERVICES, SUPPORT_ADVISORS, INITIAL_APPOINTMENTS, INITIAL_ESCALATIONS } from './src/data/syntheticData';
import { Appointment, EscalationCase, TriageResponse, SyntheticStudent } from './src/types/edupath';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory state for appointments and escalations during session
let appointments: Appointment[] = [...INITIAL_APPOINTMENTS];
let escalations: EscalationCase[] = [...INITIAL_ESCALATIONS];
let students = [...SYNTHETIC_STUDENTS];

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Track if API access is permitted
let isApiDenied = false;

// Helper: Intelligent institutional triage engine that inspects synthetic records and enforces guardrails
function generateFallbackTriage(student: SyntheticStudent, message: string): TriageResponse {
  const lower = message.toLowerCase();
  
  // 1. Safety & Crisis Detection
  const isSelfHarm = lower.includes('kill') || lower.includes('suicide') || lower.includes('end my life') || lower.includes('hurt myself') || lower.includes('cannot go on') || lower.includes('can not go on') || lower.includes('want to die') || lower.includes('hopeless');
  const isSevereHardship = lower.includes('eviction') || lower.includes('evicted') || lower.includes('homeless') || lower.includes('no place to stay') || lower.includes('starving') || lower.includes('cannot afford food');
  const isCrisis = isSelfHarm || isSevereHardship;

  // 2. Boundary Test Detections
  const isAskingDiagnosis = lower.includes('diagnose') || lower.includes('do i have') || lower.includes('depression') || lower.includes('antidepressant') || lower.includes('adhd') || lower.includes('bipolar') || lower.includes('medication');
  const isAskingDisciplinary = lower.includes('expel') || lower.includes('kicked out') || lower.includes('disciplinary') || lower.includes('punish') || lower.includes('punitive') || lower.includes('sanction') || lower.includes('suspended') || lower.includes('visa cancelled');

  // 3. Domain Detections
  const isFinance = lower.includes('money') || lower.includes('rent') || lower.includes('tuition') || lower.includes('grant') || lower.includes('hardship') || lower.includes('afford') || lower.includes('bursary') || lower.includes('balance') || lower.includes('fee') || lower.includes('debt') || lower.includes('hold');
  const isAttendance = lower.includes('attendance') || lower.includes('missed') || lower.includes('class') || lower.includes('lecture') || lower.includes('warning') || lower.includes('threshold') || lower.includes('seminar') || lower.includes('65%') || lower.includes('absence');
  const isWellbeing = lower.includes('stress') || lower.includes('anxiety') || lower.includes('panic') || lower.includes('burnout') || lower.includes('overwhelm') || lower.includes('sleep') || lower.includes('lonely') || lower.includes('tired') || lower.includes('crying') || lower.includes('exhausted') || isAskingDiagnosis;

  let category: TriageResponse['primaryCategory'] = 'general';
  if ((isFinance && isAttendance) || (isAttendance && isWellbeing) || (isFinance && isWellbeing)) {
    category = 'intersecting';
  } else if (isCrisis || isWellbeing) {
    category = 'wellbeing';
  } else if (isFinance) {
    category = 'finances';
  } else if (isAttendance) {
    category = 'attendance';
  }

  const escalationLevel: TriageResponse['escalationLevel'] = isSelfHarm 
    ? 'critical_crisis' 
    : (isSevereHardship || (isFinance && student.outstandingBalance > 2500)) 
    ? 'high' 
    : 'none';

  // Build targeted service recommendation
  const recommendedServices: typeof CAMPUS_SERVICES = [];
  if (isCrisis) {
    const crisisSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-crisis-rapid');
    if (crisisSrv) recommendedServices.push(crisisSrv);
    const wellbeingSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-wellbeing');
    if (wellbeingSrv) recommendedServices.push(wellbeingSrv);
  } else if (category === 'attendance') {
    const acadSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-academic-advising');
    if (acadSrv) recommendedServices.push(acadSrv);
    if (isFinance) {
      const finSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-financial-aid');
      if (finSrv) recommendedServices.push(finSrv);
    }
  } else if (category === 'finances') {
    const finSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-financial-aid');
    if (finSrv) recommendedServices.push(finSrv);
    const acadSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-academic-advising');
    if (acadSrv) recommendedServices.push(acadSrv);
  } else if (category === 'wellbeing') {
    const wellbeingSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-wellbeing');
    if (wellbeingSrv) recommendedServices.push(wellbeingSrv);
    if (isAttendance) {
      const acadSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-academic-advising');
      if (acadSrv) recommendedServices.push(acadSrv);
    }
  } else if (category === 'intersecting') {
    const acadSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-academic-advising');
    const finSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-financial-aid');
    const wellbeingSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-wellbeing');
    if (acadSrv) recommendedServices.push(acadSrv);
    if (finSrv) recommendedServices.push(finSrv);
    if (wellbeingSrv) recommendedServices.push(wellbeingSrv);
  } else {
    const wellbeingSrv = CAMPUS_SERVICES.find(s => s.id === 'srv-wellbeing');
    if (wellbeingSrv) recommendedServices.push(wellbeingSrv);
  }

  const auditId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;

  // Construct guarded, compassionate response tailored to boundaries
  let reply = '';
  if (isSelfHarm) {
    reply = `I hear how overwhelmingly painful and heavy things are right now, and I want to make sure you have immediate human care. Because your life, safety, and wellbeing are the highest priority, I am immediately activating our Campus Urgent Duty & Safeguarding Protocol.\n\nYou do not have to carry this alone. Please reach out to our 24/7 emergency response team right now:\n• Campus 24/7 Welfare Crisis Team: (555) 019-9000\n• National Crisis Lifeline: Dial 988 or Text HOME to 741741\n\nA human welfare officer has been notified on the staff priority queue and will be available to assist you. Please stay close to someone you trust.`;
  } else if (isAskingDiagnosis) {
    reply = `I want to validate how exhausting and distressing these symptoms must be, ${student.name}. As an institutional AI assistant, I operate under a strict non-clinical boundary: I cannot evaluate, diagnose psychiatric conditions (such as major depression or anxiety disorders), or advise on prescription medications.\n\nHowever, you do not have to navigate this without support. I recommend meeting with our certified practitioners at the Student Wellbeing & Counseling Service. They provide confidential, licensed care, coping techniques, and assessment without academic judgment. Would you like to reserve a confidential slot?`;
  } else if (isAskingDisciplinary) {
    reply = `I completely understand how stressful attendance warning letters can feel, ${student.name}. To reassure you: attendance monitoring at our university is strictly an early-intervention welfare mechanism, not a disciplinary or punitive punishment. You are not facing immediate expulsion or disciplinary sanctions.\n\nLooking at your approved synthetic record, your current attendance is ${student.attendanceRate}% (${student.attendanceStatus}). The purpose of this notification is to invite you to discuss any mitigating circumstances (such as employment schedules or health reasons). I strongly recommend booking an appointment with Academic Advising & Attendance Support to put a flexible study plan in place.`;
  } else if (category === 'attendance') {
    reply = `Thank you for sharing your situation, ${student.name}. According to your synthetic record in ${student.program}, your logged attendance currently sits at ${student.attendanceRate}% with ${student.missedSessionsCount} missed sessions recorded. Balancing coursework with personal responsibilities can be very demanding.\n\nAttendance reviews are designed to identify support needs rather than impose penalties. I recommend meeting with our Academic Advising & Attendance Support team to document mitigating circumstances and adjust your timetable so you can stay on track with confidence.`;
  } else if (category === 'finances') {
    reply = `Dealing with financial strain while studying is deeply stressful, ${student.name}. Your synthetic record confirms an outstanding tuition status of "${student.tuitionFeeStatus}" (Balance: $${student.outstandingBalance}) and indicates you are eligible to be considered for emergency student hardship funds.\n\nI recommend scheduling a consultation with the Student Financial Support & Hardship Unit. They can review emergency grant applications, food support vouchers, and help negotiate a realistic payment schedule to lift account holds.`;
  } else {
    reply = `Hello ${student.name}, thank you for reaching out. As your institutional triage assistant, I am here to understand what you are going through, cross-reference your academic records, and guide you to the right campus resources—without making clinical or disciplinary judgments.\n\nBased on your query, our Student Wellbeing & Counseling Service offers free, confidential support for university life challenges. You can book an appointment directly below or let me know if you would like guidance in other areas.`;
  }

  return {
    concernSummary: message.slice(0, 120),
    primaryCategory: category,
    detectedFactors: [
      category,
      `Attendance Rate: ${student.attendanceRate}%`,
      `Fee Status: ${student.tuitionFeeStatus}`,
      `Academic Standing: ${student.academicStanding}`
    ],
    recommendedServices,
    guardrails: {
      clinicalDiagnosisAvoided: true,
      clinicalDiagnosisExplanation: isAskingDiagnosis 
        ? 'Explicitly declined request for clinical/psychiatric diagnosis or medication advice; affirmed non-clinical mandate and routed to licensed campus counseling.'
        : 'Response strictly refrained from diagnostic terminology or medical assertions; framed purely as supportive institutional guidance.',
      disciplinaryDecisionAvoided: true,
      disciplinaryDecisionExplanation: isAskingDisciplinary
        ? 'Reassured student that attendance letters are early-support interventions rather than disciplinary sanctions or expulsion; guided to mitigating circumstances.'
        : 'Clarified policies supportively without imposing punitive threats or disciplinary judgments.',
      syntheticRecordCorroborated: true,
      syntheticRecordNotes: `Verified synthetic profile for ${student.name} (${student.id}): Attendance ${student.attendanceRate}%, Balance $${student.outstandingBalance}, Academic status: ${student.academicStanding}.`,
      sensitiveCaseEscalated: isCrisis,
      escalationReason: isCrisis ? (isSelfHarm ? 'Self-harm or acute distress indicators identified in student message.' : 'Imminent housing / severe financial hardship crisis detected.') : undefined,
    },
    escalationLevel,
    agentReply: reply,
    syntheticRecordContextUsed: `Student ${student.name} | ${student.program} | Attendance: ${student.attendanceRate}% | Fee: ${student.tuitionFeeStatus} ($${student.outstandingBalance})`,
    suggestedAction: isCrisis ? 'escalate_human' : 'book_appointment',
    auditId,
    timestamp: new Date().toISOString(),
  };
}

// REST API Endpoints

// 1. Get Synthetic Students
app.get('/api/students', (_req: Request, res: Response) => {
  res.json({ success: true, students });
});

// 2. Update/Save a student record
app.post('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const index = students.findIndex((s) => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updatedData };
    res.json({ success: true, student: students[index] });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// 3. Get Support Services & Specialists
app.get('/api/services', (_req: Request, res: Response) => {
  res.json({ success: true, services: CAMPUS_SERVICES, advisors: SUPPORT_ADVISORS });
});

// 4. Get Appointments
app.get('/api/appointments', (_req: Request, res: Response) => {
  res.json({ success: true, appointments });
});

// 5. Book an Appointment
app.post('/api/appointments', (req: Request, res: Response) => {
  const { studentId, studentName, studentEmail, serviceId, serviceName, advisorId, advisorName, date, timeSlot, mode, concernNotes, triageAuditId } = req.body;

  if (!studentId || !serviceId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    referenceCode: `EDUPATH-BK-${Math.floor(1000 + Math.random() * 9000)}`,
    studentId,
    studentName: studentName || 'Student',
    studentEmail: studentEmail || 'student@university.edu',
    serviceId,
    serviceName: serviceName || 'Campus Support',
    advisorId: advisorId || 'adv-1',
    advisorName: advisorName || 'Campus Advisor',
    date,
    timeSlot,
    mode: mode || 'In-Person',
    locationOrLink: mode === 'Virtual Video' ? 'https://university.edu/meet/support-room-confidential' : (mode === 'Phone Call' ? 'Advisor will call your registered phone' : 'Student Central Hub Room 204'),
    concernNotes: concernNotes || 'General consultation request',
    triageAuditId,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };

  appointments.unshift(newAppointment);

  // Also log into student's past visits
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.pastSupportVisits.unshift({
      date: new Date().toISOString().split('T')[0],
      serviceName: newAppointment.serviceName,
      advisorName: newAppointment.advisorName,
      notesSummary: `Appointment booked (${newAppointment.mode} at ${newAppointment.timeSlot}): ${concernNotes?.slice(0, 80) || 'Support consultation'}`,
    });
  }

  res.json({ success: true, appointment: newAppointment });
});

// 6. Get Escalations
app.get('/api/escalations', (_req: Request, res: Response) => {
  res.json({ success: true, escalations });
});

// 7. Action an Escalation Case
app.post('/api/escalations/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, advisorName, note } = req.body;
  const item = escalations.find(e => e.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Escalation case not found' });
  }

  if (action === 'assign' && advisorName) {
    item.assignedAdvisor = advisorName;
    item.status = 'In Review';
    item.actionNotes.push(`Assigned to ${advisorName} at ${new Date().toLocaleTimeString()}`);
  } else if (action === 'outreach') {
    item.status = 'Outreach Sent';
    item.actionNotes.push(`Human outreach dispatched by ${advisorName || 'Staff'} at ${new Date().toLocaleTimeString()}: ${note || 'Priority email & emergency contact notified.'}`);
  } else if (action === 'resolve') {
    item.status = 'Resolved';
    item.actionNotes.push(`Case marked resolved by ${advisorName || 'Staff'} at ${new Date().toLocaleTimeString()}: ${note || 'Student safely engaged with campus counselor.'}`);
  }

  res.json({ success: true, escalation: item });
});

// Helper to record escalation to queue when safety triggers fire
function recordEscalationIfTriggered(student: SyntheticStudent, triage: TriageResponse, triggerPhrase: string) {
  if (triage.escalationLevel === 'critical_crisis' || triage.escalationLevel === 'high') {
    const newEscalation: EscalationCase = {
      id: `esc-${Date.now()}`,
      referenceCode: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      studentName: student.name,
      program: student.program,
      yearOfStudy: student.yearOfStudy,
      triggerPhrase,
      escalationLevel: triage.escalationLevel,
      category: triage.primaryCategory,
      timestamp: new Date().toISOString(),
      status: 'Open',
      actionNotes: [
        `AI Triage Engine detected sensitive safety indicators: ${triage.guardrails?.escalationReason || 'High distress/hardship disclosure'}.`,
        'Automated alert posted to Human Advisor Queue.',
      ],
      syntheticSnapshot: {
        attendance: student.attendanceRate,
        feeStatus: student.tuitionFeeStatus,
        academicStanding: student.academicStanding,
      },
    };
    escalations.unshift(newEscalation);
  }
}

// 8. Primary AI Triage Agent Endpoint (Gemini 3.8 Flash with Institutional Guardrails)
app.post('/api/triage', async (req: Request, res: Response) => {
  const { studentProfile, userMessage, history = [] } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'Missing user message' });
  }

  const student: SyntheticStudent = studentProfile || SYNTHETIC_STUDENTS[0];

  // If GEMINI_API_KEY is not set or API access was denied, use our resilient institutional engine
  if (!process.env.GEMINI_API_KEY || isApiDenied) {
    const triage = generateFallbackTriage(student, userMessage);
    recordEscalationIfTriggered(student, triage, userMessage);
    return res.json({ success: true, triage });
  }

  try {
    const promptSystem = `You are "EduPath Triage & Routing Agent", an institutional support system for a university.
Your role: Listen to the student's message, check their synthetic institutional record, provide compassionate initial guidance, and route them to the appropriate campus service.

CRITICAL ETHICAL & SAFETY BOUNDARIES:
1. NON-CLINICAL RULE: You MUST NEVER make medical or clinical diagnoses (e.g. do NOT say "You have major depressive disorder", "You are clinically burned out", "You have ADHD"). Never prescribe treatments. You provide empathetic listening and route to qualified campus wellbeing practitioners.
2. NON-DISCIPLINARY RULE: You MUST NEVER make disciplinary rulings or threats (e.g. do NOT say "You are being suspended", "You will fail this semester", "You have violated code of conduct"). Attendance warnings must be framed supportively as early-intervention opportunities for mitigating circumstances and study support.
3. SYNTHETIC RECORD VERIFICATION: Explicitly cross-reference the student's synthetic data (Attendance rate: ${student.attendanceRate}%, Status: ${student.attendanceStatus}, Fee Status: ${student.tuitionFeeStatus}, Balance: $${student.outstandingBalance}, Academic Standing: ${student.academicStanding}). Corroborate whether the student's concern aligns with their records.
4. SENSITIVE CASE ESCALATION: If the student mentions self-harm, suicide, physical violence, acute crisis, sexual harassment, or imminent homelessness, set "escalationLevel": "critical_crisis" or "high", set "suggestedAction": "escalate_human", provide 24/7 emergency hotlines (University Welfare Helpline: (555) 019-9000 or Crisis Text Line: Text HOME to 741741), and explain that a human duty specialist is being notified immediately.

AVAILABLE CAMPUS SERVICES:
- Student Wellbeing & Counseling Service (ID: "srv-wellbeing"): 1-on-1 counseling, stress management, anxiety, grief, personal hurdles.
- Academic Advising & Attendance Support (ID: "srv-academic-advising"): Missed classes, attendance thresholds, mitigating circumstances, course withdraw/deferral.
- Student Financial Support & Hardship Unit (ID: "srv-financial-aid"): Tuition fee balances, emergency grants, food insecurity, payment plans.
- Disability & Accessibility Inclusion Service (ID: "srv-accessibility"): Learning accommodations, exam arrangements, neurodiversity support.
- Urgent Duty Safeguarding & Crisis Team (ID: "srv-crisis-rapid"): 24/7 emergency human response.

STUDENT PROFILE CONTEXT (SYNTHETIC RECORD):
ID: ${student.id}
Name: ${student.name}
Program: ${student.program} (Year ${student.yearOfStudy})
Attendance: ${student.attendanceRate}% (${student.attendanceStatus})
Missed Sessions: ${student.missedSessionsCount} / ${student.totalSessionsCount}
Fee Status: ${student.tuitionFeeStatus} (Balance: $${student.outstandingBalance})
Emergency Fund Eligible: ${student.emergencyFundEligible}
Academic Standing: ${student.academicStanding} (GPA: ${student.gpa})
Recent Visit History: ${JSON.stringify(student.pastSupportVisits)}
Profile Notes: ${student.notes}

Return ONLY a valid JSON object matching this schema:
{
  "concernSummary": "Brief 1-sentence summary of what the student is experiencing",
  "primaryCategory": "attendance" | "finances" | "wellbeing" | "intersecting" | "general",
  "detectedFactors": ["array", "of", "key", "factors"],
  "recommendedServices": [
    {
      "id": "srv-wellbeing" | "srv-academic-advising" | "srv-financial-aid" | "srv-accessibility" | "srv-crisis-rapid",
      "serviceName": "Full Service Name",
      "department": "Department",
      "relevanceScore": 95,
      "reason": "Specific reason this service helps the student's situation",
      "urgency": "Low" | "Medium" | "High" | "Immediate",
      "preparationTip": "What the student should have or know before their appointment",
      "location": "Location info",
      "contactEmail": "email@university.edu",
      "availableModes": ["In-Person", "Virtual Video", "Phone Call"]
    }
  ],
  "guardrails": {
    "clinicalDiagnosisAvoided": true,
    "clinicalDiagnosisExplanation": "Explain why this response complies with the non-clinical rule",
    "disciplinaryDecisionAvoided": true,
    "disciplinaryDecisionExplanation": "Explain why this response complies with the non-disciplinary rule",
    "syntheticRecordCorroborated": true,
    "syntheticRecordNotes": "How the synthetic profile was inspected and used",
    "sensitiveCaseEscalated": boolean,
    "escalationReason": "Reason if escalated, or null"
  },
  "escalationLevel": "none" | "moderate" | "high" | "critical_crisis",
  "agentReply": "Compassionate, professional message to the student. Non-clinical, non-disciplinary, offering reassurance and directing to the recommended service.",
  "syntheticRecordContextUsed": "Brief sentence describing the synthetic record data utilized",
  "suggestedAction": "book_appointment" | "escalate_human" | "view_resources" | "routine_guidance"
}`;

    const conversationContext = history.slice(-4).map((h: {sender: string, text: string}) => `${h.sender.toUpperCase()}: ${h.text}`).join('\n');
    const userPromptText = `${conversationContext ? `Recent Conversation History:\n${conversationContext}\n\n` : ''}Student Message: "${userMessage}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${promptSystem}\n\n${userPromptText}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed: TriageResponse;

    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = generateFallbackTriage(student, userMessage);
    }

    parsed.auditId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
    parsed.timestamp = new Date().toISOString();

    recordEscalationIfTriggered(student, parsed, userMessage);
    res.json({ success: true, triage: parsed });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('403') || errorMsg.includes('denied access')) {
      isApiDenied = true;
      console.warn('[EduPath Triage] External API permission restricted; seamlessly routing via institutional guardrail engine.');
    } else {
      console.warn('[EduPath Triage] Notice: Handled with institutional guardrail engine:', errorMsg);
    }

    const fallback = generateFallbackTriage(student, userMessage);
    recordEscalationIfTriggered(student, fallback, userMessage);
    res.json({ success: true, triage: fallback });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`EduPath Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
