import { AnalyzeCandidateProfileOutput } from "@/ai/flows/analyze-candidate-profile";

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  role: 'root' | 'Superadmin' | 'Tech/Soporte' | 'Distribuidor' | 'Administrador' | 'Supervisor' | 'Reclutador' | 'Entrevistador' | 'Lector' | 'Candidato';
  companyIds: string[];
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

// --- MOCK DATA ---

export const users: User[] = [
    { id: 'u1', name: 'Héctor Vargas', email: 'hector.vargas@altiaweb.com', avatar: 'https://picsum.photos/seed/u1/100/100', role: 'Superadmin', status: 'Activo', companies: ['comp1'] },
    { id: 'u2', name: 'Ana Torres', email: 'ana.torres@example.com', avatar: 'https://picsum.photos/seed/u2/100/100', role: 'Administrador', status: 'Activo', companies: ['comp1'] },
    { id: 'u3', name: 'Carlos Jimenez', email: 'carlos.jimenez@example.com', avatar: 'https://picsum.photos/seed/u3/100/100', role: 'Supervisor', status: 'Activo', companies: ['comp1'] },
    { id: 'u4', name: 'Lucia Fernandez', email: 'lucia.fernandez@example.com', avatar: 'https://picsum.photos/seed/u4/100/100', role: 'Reclutador', status: 'Invitado', companies: ['comp1'] },
    { id: 'u5', name: 'Miguel Angel', email: 'miguel.angel@example.com', avatar: 'https://picsum.photos/seed/u5/100/100', role: 'Entrevistador', status: 'Activo', companies: ['comp1'] },
];

export const candidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    avatar: 'candidate-1',
    jobTitle: 'Desarrolladora Frontend Senior',
    profile: {
      summary: 'Desarrolladora Frontend con más de 8 años de experiencia en la creación de interfaces de usuario interactivas y de alto rendimiento. Experta en React, TypeScript y en la optimización de la velocidad de carga de la página.',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'CI/CD', 'Jest'],
      experience: [
        { title: 'Lead Frontend Developer', company: 'Innovatech', duration: '2020 - Presente' },
        { title: 'Senior Frontend Developer', company: 'Web Solutions', duration: '2017 - 2020' }
      ]
    }
  },
  {
    id: 'c2',
    name: 'Javier Gomez',
    email: 'javier.g@example.com',
    avatar: 'candidate-2',
    jobTitle: 'Diseñador UX/UI',
    profile: {
      summary: 'Diseñador de productos con un enfoque en la investigación de usuarios y el diseño centrado en el ser humano. Apasionado por crear experiencias digitales intuitivas y atractivas.',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
      experience: [
        { title: 'UX/UI Designer', company: 'Creative Minds', duration: '2019 - Presente' },
        { title: 'Junior Designer', company: 'Pixel Perfect', duration: '2018 - 2019' }
      ]
    }
  },
  {
    id: 'c3',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    avatar: 'candidate-3',
    jobTitle: 'Especialista en Marketing Digital',
    profile: {
      summary: 'Profesional de marketing con experiencia en SEO, SEM y gestión de redes sociales. Enfocada en aumentar el engagement y la conversión a través de campañas creativas.',
      skills: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing'],
      experience: [
        { title: 'Digital Marketing Manager', company: 'GrowthHackers', duration: '2021 - Presente' },
        { title: 'Marketing Coordinator', company: 'AdSolutions', duration: '2019 - 2021' }
      ]
    }
  },
   {
    id: 'c4',
    name: 'David Martinez',
    email: 'david.m@example.com',
    avatar: 'candidate-4',
    jobTitle: 'Ingeniero de DevOps',
    profile: {
      summary: 'Ingeniero de DevOps con experiencia en la automatización de infraestructura y la implementación de pipelines de CI/CD. Experto en AWS, Docker y Kubernetes.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Python'],
      experience: [
        { title: 'DevOps Engineer', company: 'CloudNative Inc.', duration: '2019 - Presente' },
        { title: 'System Administrator', company: 'ServerFarm', duration: '2017 - 2019' }
      ]
    }
  },
];

export const companies: Company[] = [
    {
        id: 'comp1',
        name: 'Kognisync',
        logo: 'https://picsum.photos/seed/kognisync/200/200',
        description: 'Líderes en soluciones de inteligencia artificial para la automatización de procesos empresariales.',
        website: 'https://kognisync.com',
        email: 'contacto@kognisync.com',
        phone: '+1 555-123-4567',
        foundedDate: '2018',
        jobCount: 2,
        recruitmentStages: ['Recepción de CV', 'Entrevista RH', 'Prueba Técnica', 'Entrevista Técnica', 'Oferta'],
        departments: ['Tecnología', 'Ventas', 'Marketing', 'Recursos Humanos'],
        addresses: [
            { id: 1, branchName: 'Oficina Central', address1: '123 Tech Avenue', city: 'San Francisco', state: 'CA', country: 'USA', postalCode: '94107', type: 'Sede Principal' }
        ],
        branding: {
          enableCustomFooter: true,
          customFooter: `© ${new Date().getFullYear()} Kognisync. Todos los derechos reservados.<br>Una empresa de Grupo Altia.`
        }
    },
    {
        id: 'comp2',
        name: 'Innovatech',
        logo: 'https://picsum.photos/seed/innovatech/200/200',
        description: 'Desarrollo de software a medida y consultoría tecnológica para startups y grandes corporaciones.',
        website: 'https://innovatech.dev',
        email: 'info@innovatech.dev',
        phone: '+1 555-987-6543',
        foundedDate: '2020',
        jobCount: 1,
        recruitmentStages: ['Screening', 'Entrevista', 'Desafío de código', 'Oferta'],
        departments: ['Desarrollo', 'Diseño UX/UI', 'Gestión de Proyectos'],
        addresses: [
            { id: 1, branchName: 'Sede Principal', address1: '456 Innovation Drive', city: 'Austin', state: 'TX', country: 'USA', postalCode: '78701', type: 'Sede Principal' },
            { id: 2, branchName: 'Oficina LATAM', address1: 'Av. Reforma 222', city: 'Ciudad de México', state: 'CDMX', country: 'México', postalCode: '06600', type: 'Filial' }
        ],
        branding: {
          enableCustomFooter: false,
          customFooter: ''
        }
    }
];

export const jobs: Job[] = [
  {
    id: 'job1',
    title: 'Desarrollador Frontend Senior',
    slug: 'desarrollador-frontend-senior-kognisync',
    department: 'Tecnología',
    companyId: 'comp1',
    location: 'Oficina Central, San Francisco, CA, USA',
    vacancies: 2,
    type: 'Full-time',
    status: 'Open',
    postedDate: '2024-05-01',
    salary: { amount: '90,000 - 120,000', currency: 'USD' },
    schedule: { type: 'Flexible', details: 'Horario flexible con núcleo de 10am a 4pm.' },
    coverImage: 'job-cover-1',
    description: 'Buscamos un desarrollador Frontend Senior con experiencia para unirse a nuestro equipo. Serás responsable de desarrollar y mantener aplicaciones web de alta calidad, colaborando con diseñadores y desarrolladores de backend para crear una experiencia de usuario excepcional.',
    requirements: ['5+ años de experiencia con React y TypeScript.', 'Conocimiento profundo de Next.js.', 'Experiencia con pruebas unitarias y de integración.'],
    education: { level: 'Educación Superior - Pregrado Completa (Licenciatura/Ingeniería)', career: 'Ingeniería en Informática o similar' },
    competencies: ['Trabajo en equipo', 'Resolución de problemas', 'Comunicación'],
    languages: [{ name: 'Inglés', level: 'Avanzado' }],
    experience: '5+ años en desarrollo frontend',
    responsibilities: ['Desarrollar nuevas características de la aplicación.', 'Optimizar aplicaciones para máxima velocidad y escalabilidad.', 'Colaborar con otros miembros del equipo.'],
    benefits: ['Seguro médico completo', 'Horario flexible', 'Presupuesto para formación']
  },
  {
    id: 'job2',
    title: 'Diseñador de Producto (UX/UI)',
    slug: 'disenador-ux-ui-kognisync',
    department: 'Tecnología',
    companyId: 'comp1',
    location: 'Oficina Central, San Francisco, CA, USA',
    vacancies: 1,
    type: 'Full-time',
    status: 'Open',
    postedDate: '2024-05-10',
    salary: { amount: '80,000 - 100,000', currency: 'USD' },
    schedule: { type: 'Fixed', entryTime: '09:00', exitTime: '17:00' },
    coverImage: 'job-cover-3',
    description: 'Estamos buscando un diseñador de producto talentoso para crear experiencias de usuario asombrosas. El candidato ideal tendrá experiencia en el diseño de productos desde la concepción hasta el lanzamiento.',
    requirements: ['Portafolio sólido de proyectos de diseño.', 'Experiencia con Figma, Sketch o Adobe XD.', 'Conocimiento de metodologías de investigación de usuarios.'],
    education: { level: 'Educación Superior - Pregrado Completa (Licenciatura/Ingeniería)', career: 'Diseño Gráfico, Diseño de Interacción o similar' },
    competencies: ['Creatividad', 'Atención al detalle', 'Empatía'],
    languages: [{ name: 'Inglés', level: 'Intermedio' }],
    experience: '3+ años en diseño de UX/UI',
    responsibilities: ['Realizar investigación de usuarios y validar conceptos de productos.', 'Crear wireframes, prototipos y diseños visuales de alta fidelidad.', 'Colaborar con PMs e ingenieros.'],
    benefits: ['Seguro médico', '401(k)', 'Días de vacaciones ilimitados']
  },
    {
    id: 'job3',
    title: 'Ingeniero de Datos',
    slug: 'ingeniero-de-datos-innovatech',
    department: 'Desarrollo',
    companyId: 'comp2',
    location: 'Oficina LATAM, Ciudad de México, CDMX, México',
    vacancies: 1,
    type: 'Contract',
    status: 'Closed',
    postedDate: '2024-04-15',
    salary: { amount: '60,000 - 80,000', currency: 'USD' },
    schedule: { type: 'Custom', details: 'Basado en proyectos, remoto con reuniones presenciales ocasionales.' },
    coverImage: 'job-cover-2',
    description: 'Buscamos un Ingeniero de Datos para diseñar, construir y mantener nuestros pipelines de datos. Trabajarás con grandes volúmenes de datos para permitir la toma de decisiones basada en datos en toda la empresa.',
    requirements: ['Experiencia con SQL y Python/Scala.', 'Conocimiento de herramientas de Big Data como Spark o Hadoop.', 'Experiencia con servicios en la nube (AWS, GCP, Azure).'],
    education: { level: 'Educación Superior - Pregrado Completa (Licenciatura/Ingeniería)', career: 'Ciencias de la Computación, Estadística o campo relacionado' },
    competencies: ['Pensamiento analítico', 'Resolución de problemas', 'Autonomía'],
    languages: [{ name: 'Inglés', level: 'Avanzado' }, { name: 'Español', level: 'Nativo' }],
    experience: '4+ años en ingeniería de datos',
    responsibilities: ['Construir y mantener pipelines de datos ETL/ELT.', 'Asegurar la calidad y consistencia de los datos.', 'Colaborar con analistas y científicos de datos.'],
    benefits: ['Trabajo remoto', 'Equipo de última generación', 'Oportunidades de crecimiento']
  }
];

export const applications: Application[] = [
  { id: 'app1', jobId: 'job1', candidateId: 'c1', applicationDate: '2024-05-02', status: 'Interview', assignedEvaluations: [] },
  { id: 'app2', jobId: 'job1', candidateId: 'c4', applicationDate: '2024-05-03', status: 'Assessment', assignedEvaluations: [] },
  { id: 'app3', jobId: 'job2', candidateId: 'c2', applicationDate: '2024-05-11', status: 'Pending', assignedEvaluations: [] },
  { id: 'app4', jobId: 'job3', candidateId: 'c3', applicationDate: '2024-04-18', status: 'Hired', assignedEvaluations: [] }
];
