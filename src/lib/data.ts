

import { AnalyzeCandidateProfileOutput } from "@/ai/flows/analyze-candidate-profiles";

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  role: 'root' | 'Superadmin' | 'Tech/Soporte' | 'Distribuidor' | 'Administrador' | 'Supervisor' | 'Reclutador' | 'Entrevistador' | 'Lector' | 'Candidato';
  companyIds?: string[];
  requiresPasswordChange?: boolean;
  isGlobalAdmin?: boolean;
  canManageAllCompanies?: boolean;
}

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'root' | 'Superadmin' | 'Tech/Soporte' | 'Distribuidor' | 'Administrador' | 'Supervisor' | 'Reclutador' | 'Entrevistador' | 'Lector' | 'Candidato';
  status: 'Activo' | 'Invitado';
  companies: string[];
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  jobTitle: string;
  profile: {
    summary: string;
    skills: string[];
    experience: {
      title: string;
      company: string;
      duration: string;
    }[];
  };
};

export type Job = {
  id: string;
  title: string;
  slug?: string;
  department: string;
  companyId: string;
  location: string;
  vacancies: number;
  type: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Open' | 'Closed' | 'Archived' | 'Cancelled';
  postedDate: string;
  salary: {
    amount: string;
    currency: 'USD' | 'HNL';
    commissions?: string;
  };
  schedule: {
    type: 'Fixed' | 'Flexible' | 'Custom';
    entryTime?: string;
    exitTime?: string;
    details?: string;
  };
  coverImage: string;
  description: string;
  requirements: string[];
  education: {
    career: string;
    level: string;
  };
  competencies: string[];
  languages: { name: string; level: string }[];
  experience: string;
  responsibilities: string[];
  benefits: string[];
  recruitmentStages?: string[];
  assignedRecruiters?: string[];
  assignedInterviewers?: string[];
};

export type CompanyAddress = {
  id: number;
  branchName?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  type: 'Sede Principal' | 'Filial';
}

export type CompanyBranding = {
  enableCustomFooter: boolean;
  customFooter: string;
}

export type Company = {
  id: string;
  name: string;
  logo: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  foundedDate?: string;
  jobCount: number;
  recruitmentStages: string[];
  departments: string[];
  addresses: CompanyAddress[];
  branding?: CompanyBranding;
}


export type Evaluation = {
  id: string;
  name: string;
  type: string;
  duration: string;
  description: string;
  factors: string;
  organizationalLevel: string;
  educationLevel: string;
  evaluationCriteria: string[];
  questions: Question[];
};

export type PsychometricCategory = {
  name: string;
  tests: Evaluation[];
};

export type Question = {
  id: string;
  type: 'disc' | 'multiple-choice' | 'code';
  text: string;
  instruction?: string;
  options: { id: string; text: string; }[];
  correctAnswer: any;
  timeLimit?: number; // Time in seconds for the question
};

export type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  applicationDate: string;
  status: 'Pending' | 'Screening' | 'Interview' | 'Assessment' | 'Offer' | 'Hired' | 'Rejected';
  analysis?: {
    es: AnalyzeCandidateProfileOutput | null;
    en: AnalyzeCandidateProfileOutput | null;
  };
  interview?: {
    date: string;
    notes: string;
    score?: number;
  };
  assignedEvaluations: {
    evaluationId: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    score?: number;
  }[];
};

export const users: User[] = [
    { id: 'u1', name: 'Héctor Vargas', email: 'hector.vargas@altiaweb.com', avatar: 'https://picsum.photos/seed/u1/100/100', role: 'Superadmin', status: 'Activo', companies: [] },
    { id: 'u2', name: 'Ana Torres', email: 'ana.torres@example.com', avatar: 'https://picsum.photos/seed/u2/100/100', role: 'Administrador', status: 'Activo', companies: [] },
    { id: 'u3', name: 'Carlos Jimenez', email: 'carlos.jimenez@example.com', avatar: 'https://picsum.photos/seed/u3/100/100', role: 'Supervisor', status: 'Activo', companies: [] },
    { id: 'u4', name: 'Lucia Fernandez', email: 'lucia.fernandez@example.com', avatar: 'https://picsum.photos/seed/u4/100/100', role: 'Reclutador', status: 'Invitado', companies: [] },
    { id: 'u5', name: 'Miguel Angel', email: 'miguel.angel@example.com', avatar: 'https://picsum.photos/seed/u5/100/100', role: 'Entrevistador', status: 'Activo', companies: [] },
];

export const candidates: Candidate[] = [];

export const jobs: Job[] = [];

export const companies: Company[] = [];

export const applications: Application[] = [];
    
