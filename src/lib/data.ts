
export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Superadmin' | 'Administrador' | 'Supervisor' | 'Reclutador';
  status: 'Activo' | 'Invitado';
  company: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  avatar: string;
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
  department: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Open' | 'Closed' | 'Archived';
  postedDate: string;
  salary: {
    min: number;
    max: number;
    currency: 'USD' | 'HNL';
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
};

export type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  applicationDate: string;
  status: 'Pending' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
};

export type PsychometricTest = {
  title: string;
  description: string;
  items: number;
  duration: string;
  areas: string[];
};

export type TechnicalTest = {
  title: string;
  description: string;
  level: string;
  skills: string[];
};


// --- MOCK DATA ---

export const users: User[] = [
  { id: 'u1', name: 'Héctor Vargas', email: 'hector.vargas@altiaweb.com', avatar: 'https://picsum.photos/seed/u1/100/100', role: 'Superadmin', status: 'Activo', company: 'KogniSYNC' },
  { id: 'u2', name: 'Ana Torres', email: 'ana.torres@example.com', avatar: 'https://picsum.photos/seed/u2/100/100', role: 'Administrador', status: 'Activo', company: 'KogniSYNC' },
  { id: 'u3', name: 'Carlos Jimenez', email: 'carlos.jimenez@example.com', avatar: 'https://picsum.photos/seed/u3/100/100', role: 'Supervisor', status: 'Activo', company: 'KogniSYNC' },
  { id: 'u4', name: 'Lucia Fernandez', email: 'lucia.fernandez@example.com', avatar: 'https://picsum.photos/seed/u4/100/100', role: 'Reclutador', status: 'Invitado', company: 'KogniSYNC' },
];

export const candidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    avatar: 'https://picsum.photos/seed/c1/100/100',
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
    avatar: 'https://picsum.photos/seed/c2/100/100',
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
    avatar: 'https://picsum.photos/seed/c3/100/100',
    jobTitle: 'Especialista en Marketing Digital',
    profile: {
      summary: 'Profesional de marketing con experiencia en SEO, SEM y gestión de redes sociales. Enfocada en aumentar el engagement y la conversión a través de campañas creativas.',
      skills: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing'],
      experience: [
        { title: 'Digital Marketing Manager', company: 'GrowthHackers', duration: '2021 - Presente' },
        { title: 'Marketing Coordinator', company: 'AdSolutions', duration: '2019 - 2021' }
      ]
    }
  }
];

export const jobs: Job[] = [
  {
    id: 'job1',
    title: 'Desarrollador Frontend Senior',
    department: 'Tecnología',
    company: 'KogniSYNC',
    location: 'Remoto (LATAM)',
    type: 'Full-time',
    status: 'Open',
    postedDate: '2024-05-01',
    salary: { min: 90000, max: 120000, currency: 'USD' },
    description: 'Buscamos un desarrollador Frontend Senior con experiencia para unirse a nuestro equipo. Serás responsable de desarrollar y mantener aplicaciones web de alta calidad, colaborando con diseñadores y desarrolladores de backend para crear una experiencia de usuario excepcional.',
    requirements: ['5+ años de experiencia con React y TypeScript.', 'Conocimiento profundo de Next.js.', 'Experiencia con pruebas unitarias y de integración.'],
    responsibilities: ['Desarrollar nuevas características de la aplicación.', 'Optimizar aplicaciones para máxima velocidad y escalabilidad.', 'Colaborar con otros miembros del equipo.']
  },
  {
    id: 'job2',
    title: 'Diseñador de Producto (UX/UI)',
    department: 'Diseño',
    company: 'KogniSYNC',
    location: 'San Pedro Sula, Honduras',
    type: 'Full-time',
    status: 'Open',
    postedDate: '2024-05-10',
    salary: { min: 80000, max: 100000, currency: 'USD' },
    description: 'Estamos buscando un diseñador de producto talentoso para crear experiencias de usuario asombrosas. El candidato ideal tendrá experiencia en el diseño de productos desde la concepción hasta el lanzamiento.',
    requirements: ['Portafolio sólido de proyectos de diseño.', 'Experiencia con Figma, Sketch o Adobe XD.', 'Conocimiento de metodologías de investigación de usuarios.'],
    responsibilities: ['Realizar investigación de usuarios y validar conceptos de productos.', 'Crear wireframes, prototipos y diseños visuales de alta fidelidad.', 'Colaborar con PMs e ingenieros.']
  }
];

export const applications: Application[] = [
  { id: 'app1', jobId: 'job1', candidateId: 'c1', applicationDate: '2024-05-02', status: 'Interview' },
  { id: 'app2', jobId: 'job1', candidateId: 'c2', applicationDate: '2024-05-03', status: 'Screening' },
  { id: 'app3', jobId: 'job2', candidateId: 'c2', applicationDate: '2024-05-11', status: 'Pending' },
  { id: 'app4', jobId: 'job2', candidateId: 'c3', applicationDate: '2024-05-12', status: 'Pending' }
];

export const psychometricTests: PsychometricTest[] = [
  {
    title: "Test de Termann-Merril",
    description: "Evalúa la inteligencia y el coeficiente intelectual (CI) a través de diez sub-pruebas que miden habilidades verbales, numéricas, y de razonamiento abstracto. Ideal para procesos de selección y desarrollo.",
    items: 150,
    duration: "45-60 min",
    areas: ["Inteligencia General", "Razonamiento Verbal", "Razonamiento Numérico", "Abstracción"]
  },
  {
    title: "Test de Cleaver (DISC)",
    description: "Mide el comportamiento y la personalidad en el entorno laboral, identificando cuatro dimensiones: Dominancia, Influencia, Estabilidad y Cumplimiento. Útil para la formación de equipos y roles de liderazgo.",
    items: 24,
    duration: "15-20 min",
    areas: ["Liderazgo", "Comunicación", "Toma de Decisiones", "Trabajo en Equipo"]
  },
  {
    title: "Test de Dominós D-48",
    description: "Prueba no verbal que evalúa la inteligencia general (Factor G) a través de la capacidad de una persona para identificar leyes lógicas en series de fichas de dominó. Mide la capacidad de abstracción y razonamiento sistemático.",
    items: 48,
    duration: "25 min",
    areas: ["Inteligencia General", "Razonamiento Abstracto", "Lógica"]
  },
  {
    title: "Test de Honestidad y Valores (Honesti-Valius)",
    description: "Evalúa la integridad, honestidad y los valores éticos de un candidato. Ayuda a predecir comportamientos contraproducentes en el trabajo y a asegurar la alineación con la cultura de la empresa.",
    items: 80,
    duration: "20-30 min",
    areas: ["Honestidad", "Ética Laboral", "Responsabilidad", "Lealtad"]
  },
  {
    title: "Inventario de Personalidad 16PF",
    description: "Cuestionario de personalidad que mide 16 factores primarios y 5 dimensiones secundarias, proporcionando un perfil completo del individuo. Utilizado en selección, orientación vocacional y desarrollo personal.",
    items: 185,
    duration: "30-40 min",
    areas: ["Personalidad", "Estabilidad Emocional", "Relaciones Interpersonales", "Afrontamiento"]
  },
  {
    title: "Test de Moss",
    description: "Evalúa las habilidades de liderazgo y supervisión, midiendo la capacidad para tomar decisiones, manejar personal, evaluar problemas y establecer relaciones interpersonales en un contexto gerencial.",
    items: 30,
    duration: "20-25 min",
    areas: ["Liderazgo", "Gestión de Personal", "Toma de Decisiones", "Relaciones Interpersonales"]
  }
];


export const technicalTests: TechnicalTest[] = [
    {
        title: "Prueba de Habilidad en React",
        description: "Evalúa el conocimiento en React, Hooks, Context API y patrones de diseño.",
        level: "Senior",
        skills: ["React", "JavaScript", "CSS", "Testing"]
    },
    {
        title: "Desafío de Algoritmia",
        description: "Mide la capacidad de resolución de problemas complejos y eficiencia de código.",
        level: "Intermedio/Avanzado",
        skills: ["Algoritmos", "Estructura de Datos", "Complejidad"]
    },
    {
      title: "Prueba de Node.js y Express",
      description: "Evalúa la habilidad para construir APIs RESTful, manejar middleware y conectar a bases de datos.",
      level: "Intermedio",
      skills: ["Node.js", "Express", "API REST", "MongoDB"]
    },
    {
      title: "Prueba de Conocimientos en SQL",
      description: "Mide la competencia en la escritura de consultas SQL complejas, incluyendo joins, subconsultas y funciones de ventana.",
      level: "Avanzado",
      skills: ["SQL", "Modelado de Datos", "Optimización de Consultas"]
    }
];
