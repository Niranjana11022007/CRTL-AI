export interface SyntheticStudent {
  id: string;
  name: string;
  avatar: string;
  email: string;
  program: string;
  school: string;
  yearOfStudy: number;
  semester: string;
  attendanceRate: number; // e.g. 64.5%
  attendanceStatus: 'Good' | 'At Risk' | 'Critical Review';
  missedSessionsCount: number;
  totalSessionsCount: number;
  tuitionFeeStatus: 'Paid' | 'Outstanding Balance' | 'Payment Plan Active' | 'Hold on Account';
  outstandingBalance: number;
  emergencyFundEligible: boolean;
  academicStanding: 'Good Standing' | 'Academic Warning' | 'Satisfactory';
  gpa: number;
  recentModules: {
    code: string;
    name: string;
    attendance: number;
    credits: number;
  }[];
  pastSupportVisits: {
    date: string;
    serviceName: string;
    advisorName: string;
    notesSummary: string;
  }[];
  consentDataTriage: boolean;
  notes: string;
}

export type TriageCategory = 'attendance' | 'finances' | 'wellbeing' | 'intersecting' | 'general';

export type EscalationLevel = 'none' | 'moderate' | 'high' | 'critical_crisis';

export interface GuardrailEvaluation {
  clinicalDiagnosisAvoided: boolean;
  clinicalDiagnosisExplanation: string;
  disciplinaryDecisionAvoided: boolean;
  disciplinaryDecisionExplanation: string;
  syntheticRecordCorroborated: boolean;
  syntheticRecordNotes: string;
  sensitiveCaseEscalated: boolean;
  escalationReason?: string;
}

export interface RecommendedService {
  id: string;
  serviceName: string;
  department: string;
  relevanceScore: number; // 0-100
  reason: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  preparationTip: string;
  location: string;
  contactEmail: string;
  availableModes: ('In-Person' | 'Virtual Video' | 'Phone Call')[];
}

export interface TriageResponse {
  concernSummary: string;
  primaryCategory: TriageCategory;
  detectedFactors: string[];
  recommendedServices: RecommendedService[];
  guardrails: GuardrailEvaluation;
  escalationLevel: EscalationLevel;
  agentReply: string;
  syntheticRecordContextUsed: string;
  suggestedAction: 'book_appointment' | 'escalate_human' | 'view_resources' | 'routine_guidance';
  auditId: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'agent' | 'system';
  text: string;
  timestamp: string;
  triageData?: TriageResponse;
  isEscalated?: boolean;
}

export interface SupportAdvisor {
  id: string;
  name: string;
  role: string;
  serviceId: string;
  serviceName: string;
  avatar: string;
  availableDays: string[];
  slots: string[];
  location: string;
  specialization: string;
}

export interface Appointment {
  id: string;
  referenceCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  serviceId: string;
  serviceName: string;
  advisorId: string;
  advisorName: string;
  date: string;
  timeSlot: string;
  mode: 'In-Person' | 'Virtual Video' | 'Phone Call';
  locationOrLink: string;
  concernNotes: string;
  triageAuditId?: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface EscalationCase {
  id: string;
  referenceCode: string;
  studentId: string;
  studentName: string;
  program: string;
  yearOfStudy: number;
  triggerPhrase: string;
  escalationLevel: 'critical_crisis' | 'high';
  category: TriageCategory;
  timestamp: string;
  status: 'Open' | 'In Review' | 'Outreach Sent' | 'Resolved';
  assignedAdvisor?: string;
  actionNotes: string[];
  syntheticSnapshot: {
    attendance: number;
    feeStatus: string;
    academicStanding: string;
  };
}
