
import type { Evaluation, PsychometricCategory } from './data';

export const psychometricCategories: PsychometricCategory[] = [
    {
        name: 'Pruebas de Inteligencia',
        tests: [
            {
                id: 'psy-terman',
                name: 'TERMAN',
                type: 'Psicométrica',
                duration: '40 minutos',
                description: 'La Prueba Terman-Merrill tiene como objetivo medir el Coeficiente Intelectual (CI) y está diseñada para detectar el grado de inteligencia de una persona, así como sus fortalezas y debilidades en diversas áreas intelectuales.',
                factors: 'CI / Información / Juicio / Vocabulario / Síntesis / Concentración / Análisis / Abstracción / Planeación / Organización / Atención',
                organizationalLevel: 'Ejecutivos / Jefes / Empleados',
                educationLevel: 'Profesional',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'terman-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para TERMAN. La respuesta correcta es A.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-raven',
                name: 'RAVEN',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'La prueba de matrices progresivas de Raven es una prueba no verbal que mide la capacidad intelectual y la habilidad mental general a través del razonamiento por analogías y la comparación de formas.',
                factors: 'Capacidad intelectual, habilidad mental general por medio de la comparación de formas y el razonamiento por analogías.',
                organizationalLevel: 'Ejecutivos / Jefes / Empleados',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                     {
                        id: 'raven-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para RAVEN. La respuesta correcta es C.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'c',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-dominos',
                name: 'DOMINÓS',
                type: 'Psicométrica',
                duration: '30 minutos',
                description: 'El Test de Dominós mide el factor G de la inteligencia (capacidad de inteligencia general) evaluando las facultades lógicas del individuo en un tiempo limitado.',
                factors: 'El factor G de la inteligencia (capacidad de inteligencia general) en función de facultades lógicas.',
                organizationalLevel: 'Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                     {
                        id: 'dominos-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para DOMINÓS. La respuesta correcta es B.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-barsit',
                name: 'BÁRSIT',
                type: 'Psicométrica',
                duration: '15 minutos',
                description: 'El Test Básico de Inteligencia y Aptitudes (BÁRSIT) mide la inteligencia general y las aptitudes verbales y numéricas, siendo útil para niveles operativos.',
                factors: 'Conocimientos generales / Comprensión de vocabulario / Razonamiento verbal / Razonamiento Lógico / Razonamiento numérico.',
                organizationalLevel: 'Operativos',
                educationLevel: 'Primaria / Secundaria',
                evaluationCriteria: [],
                questions: [
                     {
                        id: 'barsit-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para BÁRSIT. La respuesta correcta es A.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            }
        ]
    },
    {
        name: 'Pruebas de Personalidad',
        tests: [
            {
                id: 'psy-kostick',
                name: 'KOSTICK',
                type: 'Psicométrica',
                duration: '40 minutos',
                description: 'La prueba de Kostick es un inventario de la personalidad que mide diversos factores relacionados con el comportamiento en el ámbito laboral.',
                factors: 'Liderazgo / Modo de Vida / Naturaleza Social / Adaptación al trabajo / Naturaleza Emocional / Subordinación / Grado de Energía.',
                organizationalLevel: 'Ejecutivos / Empleados / Mandos medios / Supervisores / Gerentes',
                educationLevel: 'Primaria / Secundaria / Bachillerato / Profesional / Posgrados',
                evaluationCriteria: [],
                questions: [
                     {
                        id: 'kostick-q1',
                        type: 'disc',
                        text: 'Grupo de adjetivos 1',
                        instruction: 'Elige la opción que MÁS te describe y la que MENOS te describe.',
                        options: [
                            { id: '1', text: 'Soy trabajador(a) intenso(a) y persistente' },
                            { id: '2', text: 'Me gusta hacer las cosas mejor que los demás' },
                            { id: '3', text: 'Me gusta hacer amigos nuevos' },
                            { id: '4', text: 'Me gusta que me digan exactamente qué debo hacer' }
                        ],
                        correctAnswer: { best: '1', worst: '4' }, // Ejemplo, no hay respuesta "correcta" en personalidad
                        timeLimit: 45
                    }
                ]
            },
            {
                id: 'psy-16facper',
                name: '16FACPER',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'El cuestionario 16 Factores de la Personalidad es una prueba exhaustiva que mide un conjunto de rasgos fundamentales de la personalidad.',
                factors: 'Inteligencia, Estabilidad Emocional, Dominación, Impulsividad, Lealtad Grupal, Aptitud Situacional, Emotividad, Credibilidad, Actitud Cognitiva, Sutileza, Consciencia, Posición Social, Certeza Individual, Autoestima, Estado De Ansiedad.',
                organizationalLevel: 'Ejecutivos / Empleados / Mandos medios / Supervisores / Gerentes',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: '16fp-q1',
                        type: 'multiple-choice',
                        text: 'En un negocio, ¿preferiría usted:',
                        options: [
                            { id: 'a', text: 'encargarse de las máquinas o de los archivos' },
                            { id: 'b', text: 'interrogar y hablar con la gente' },
                            { id: 'c', text: '?' }
                        ],
                        correctAnswer: 'b', // Ejemplo
                        timeLimit: 30
                    }
                ]
            },
            {
                id: 'psy-gordon',
                name: 'GORDON',
                type: 'Psicométrica',
                duration: '40 minutos',
                description: 'El Perfil e Inventario de Personalidad de Gordon mide rasgos que son significativos en el funcionamiento diario de una persona normal.',
                factors: 'Ascendencia / Responsabilidad / Estabilidad Emocional / Sociabilidad / Cautela / Originalidad / Relaciones.',
                organizationalLevel: 'Directivos / Jefes / Ejecutivos / Empleados',
                educationLevel: 'Profesional / Posgrados',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'gordon-q1',
                        type: 'disc',
                        text: 'Grupo de adjetivos 1',
                        instruction: 'De las cuatro opciones, elige la que más se parece a ti y la que menos se parece a ti.',
                        options: [
                            { id: '1', text: 'Capaz de realizar un trabajo detallado' },
                            { id: '2', text: 'No se rinde fácilmente' },
                            { id: '3', text: 'Un líder con iniciativa propia' },
                            { id: '4', text: 'Fácil de hacer amistad' }
                        ],
                        correctAnswer: { best: '3', worst: '1' }, // Ejemplo
                        timeLimit: 40
                    }
                ]
            }
        ]
    },
    {
        name: 'Pruebas de Ventas',
        tests: [
            {
                id: 'psy-ipv',
                name: 'IPV (VENTAS)',
                type: 'Psicométrica',
                duration: '60 minutos',
                description: 'El Inventario de Personalidad para Vendedores (IPV) evalúa la disposición general para la venta y otras aptitudes clave para roles comerciales.',
                factors: 'Comprensión / Adaptabilidad / Control de sí Mismo / Tolerancia a la Frustración / Combatividad / Dominio / Seguridad / Actividad / Sociabilidad.',
                organizationalLevel: 'Ejecutivos / Empleados',
                educationLevel: 'Profesional / Preparatoria / Técnico / Secundaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'ipv-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para IPV. La respuesta correcta es A.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-selleval',
                name: 'SELLEVAL',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Evalúa un amplio espectro de habilidades y competencias clave para el éxito en roles de ventas, desde la prospección hasta el cierre.',
                factors: 'Adaptabilidad / Administración del tiempo / Autonomía / Conocimiento del producto / Habilidades de cierre / Habilidades de comunicación / Habilidades de escucha / Habilidades de negociación / Habilidades de presentación / Habilidades de prospección / Habilidades de seguimiento / Orientación al cliente / Persistencia / Toma de decisiones.',
                organizationalLevel: 'Ejecutivos / Operativos',
                educationLevel: 'Profesional / Preparatoria / Técnico / Secundaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'selleval-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para SELLEVAL. La respuesta correcta es C.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'c',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-clienfocus',
                name: 'CLIENFOCUS',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Mide las competencias relacionadas con la atención y el servicio al cliente, evaluando la capacidad para construir y mantener relaciones positivas.',
                factors: 'Amabilidad / Comunicación clara / Cumplimiento de promesas / Empatía / Escucha activa / Flexibilidad / Orientación a la resolución / Orientación al cliente / Proactividad / Resolución de problemas / Retención de clientes / Seguimiento / Tiempo de respuesta / Trabajo en equipo.',
                organizationalLevel: 'Mandos Medios / Ejecutivos / Operativos',
                educationLevel: 'Profesional / Preparatoria / Técnico / Secundaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'clienfocus-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para CLIENFOCUS. La respuesta correcta es B.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-negoval',
                name: 'NEGOVAL',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Evalúa las habilidades de negociación de un individuo, cubriendo desde la preparación y planificación hasta el cierre de acuerdos.',
                factors: 'Preparación y planificación / Pensamiento estratégico / Manejo del tiempo / Capacidad para manejar el rechazo / Conocimiento del producto o servicio / Conocimiento de la competencia / Capacidad para cerrar acuerdos / Persuasión / Adaptabilidad / Ética / Pensamiento crítico / Paciencia y perseverancia / Evaluación de opciones / Establecimiento de metas realistas.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Profesional / Preparatoria / Técnico / Secundaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'negoval-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para NEGOVAL. La respuesta correcta es A.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            }
        ]
    },
    {
        name: 'Pruebas de Liderazgo',
        tests: [
            {
                id: 'psy-moss',
                name: 'MOSS',
                type: 'Psicométrica',
                duration: '30 minutos',
                description: 'La prueba MOSS evalúa las habilidades de liderazgo y supervisión, enfocándose en la toma de decisiones y las relaciones interpersonales.',
                factors: 'Habilidad en Supervisión / Capacidad de decisión / Capacidad de evaluación de problemas / Habilidad para establecer relaciones interpersonales / Sentido común y tacto en las relaciones interpersonales.',
                organizationalLevel: 'Directivos / Gerentes / Jefes / Mandos Medios',
                educationLevel: 'Profesional / Técnico',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'moss-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para MOSS. La respuesta correcta es B.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-lideresia',
                name: 'LIDERESIA',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Evalúa un amplio conjunto de competencias de liderazgo, desde la delegación y comunicación hasta la visión estratégica y el desarrollo de equipos.',
                factors: 'Delegación / Interés en la comunicación / Empatía / Toma de decisiones / Resolución de conflictos / Adaptabilidad / Visión estratégica / Innovación / Integridad / Motivación / Gestión del tiempo / Desarrollo del equipo / Autoevaluación / Compromiso.',
                organizationalLevel: 'Directivos / Gerentes / Jefes / Mandos Medios / Operativos',
                educationLevel: 'Profesional / Preparatoria / Técnicos / Secundaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'lideresia-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para LIDERESIA. La respuesta correcta es C.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'c',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-managerskill',
                name: 'MANAGERSKILL',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Mide las habilidades gerenciales clave necesarias para el éxito en roles de gestión y liderazgo, enfocándose en la ejecución y la estrategia.',
                factors: 'Desarrollo de alianzas estratégicas / Empoderamiento / Ética y responsabilidad / Gestión de conflictos / Gestión de equipos / Gestión de la diversidad / Gestión de recursos / Gestión del cambio / Gestión del desempeño / Inteligencia emocional / Orientación a resultados / Pensamiento estratégico / Pensamiento innovador / Visión estratégica.',
                organizationalLevel: 'No especificado',
                educationLevel: 'Profesional / Preparatoria / Técnicos / Secundaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'managerskill-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para MANAGERSKILL. La respuesta correcta es A.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            }
        ]
    },
    {
        name: 'Pruebas de Valores',
        tests: [
            {
                id: 'psy-zavic',
                name: 'ZAVIC',
                type: 'Psicométrica',
                duration: '30 minutos',
                description: 'Evalúa los intereses y valores de una persona, enfocándose en su perfil moral y su alineación con los valores de la organización.',
                factors: 'Moral / Legalidad / Indiferencia / Corrupción / Interés económico / político / social / religioso.',
                organizationalLevel: 'Ejecutivos / Jefes / Empleados / Operarios',
                educationLevel: 'Profesional / Preparatoria / Técnicos / Secundaria / Primaria',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'zavic-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para ZAVIC. La respuesta correcta es B.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-allport',
                name: 'ALLPORT',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Mide la importancia relativa de seis valores básicos en la personalidad: teórico, económico, estético, social, político y religioso.',
                factors: 'Interés teórico / económico / estético / social / político / religioso.',
                organizationalLevel: 'Ejecutivos / Jefes / Empleados',
                educationLevel: 'Profesional / Técnicos',
                evaluationCriteria: [],
                questions: [
                     {
                        id: 'allport-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para ALLPORT. La respuesta correcta es A.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-honestivalues',
                name: 'HONESTIVALUES',
                type: 'Psicométrica',
                duration: '45 minutos',
                description: 'Evalúa la integridad y honestidad del individuo en el contexto laboral, midiendo su postura frente a situaciones como el robo, soborno y acoso.',
                factors: 'Discriminación / Robo / Soborno / Lealtad / Congruencia / Uso de Substancias (Drogas) / Acoso sexual.',
                organizationalLevel: 'Ejecutivos / Jefes / Empleados',
                educationLevel: 'Profesional / Técnicos',
                evaluationCriteria: [],
                questions: [
                     {
                        id: 'honestivalues-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para HONESTIVALUES. La respuesta correcta es C.',
                        options: [
                            { id: 'a', text: 'Opción A' },
                            { id: 'b', text: 'Opción B' },
                            { id: 'c', text: 'Opción C' }
                        ],
                        correctAnswer: 'c',
                        timeLimit: 60
                    }
                ]
            }
        ]
    },
    {
        name: 'Pruebas de Comportamiento',
        tests: [
            {
                id: 'psy-efectico',
                name: 'EFECTICO',
                type: 'Comportamiento (Comunicación)',
                duration: '45 minutos',
                description: 'Evalúa la efectividad en la comunicación, incluyendo la adaptabilidad, asertividad y la capacidad de dar y recibir retroalimentación.',
                factors: 'Adaptabilidad de comunicación, Retroalimentación constructiva, Comunicación asertiva, Escucha activa, etc.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'efectico-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para EFECTICO. La respuesta correcta es A.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-emotint',
                name: 'EMOTINT',
                type: 'Comportamiento (Inteligencia Emocional)',
                duration: '45 minutos',
                description: 'Mide la inteligencia emocional del individuo, abarcando desde la autoconciencia y regulación emocional hasta la empatía y el liderazgo.',
                factors: 'Autoconciencia emocional, Regulación emocional, Motivación, Empatía, Resolución de conflictos, Liderazgo emocional, etc.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'emotint-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para EMOTINT. La respuesta correcta es B.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-evalutime',
                name: 'EVALUTIME',
                type: 'Comportamiento (Gestión del Tiempo)',
                duration: '45 minutos',
                description: 'Evalúa las habilidades para la gestión del tiempo, incluyendo la planificación, priorización de tareas y manejo de la carga de trabajo.',
                factors: 'Gestión efectiva de reuniones, Manejo de la carga de trabajo, Coordinación y planificación de proyectos, Priorización de tareas, etc.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'evalutime-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para EVALUTIME. La respuesta correcta es C.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'c',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-trabeq',
                name: 'TRABEQ',
                type: 'Comportamiento (Trabajo en Equipo)',
                duration: '45 minutos',
                description: 'Mide las competencias relacionadas con el trabajo en equipo, como la colaboración, comunicación, y resolución de conflictos.',
                factors: 'Colaboración, Comunicación efectiva, Coordinación, Confianza, Compromiso, Flexibilidad, Resolución de conflictos, etc.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'trabeq-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para TRABEQ. La respuesta correcta es A.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-flexiadap',
                name: 'FLEXIADAP',
                type: 'Comportamiento (Adaptabilidad)',
                duration: '45 minutos',
                description: 'Evalúa la capacidad de adaptación de un individuo frente a cambios, midiendo la flexibilidad cognitiva, la gestión del cambio y la tolerancia al riesgo.',
                factors: 'Flexibilidad cognitiva, Gestión del cambio, Adaptabilidad emocional, Tolerancia al riesgo, Resolución de problemas en entornos cambiantes, etc.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'flexiadap-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para FLEXIADAP. La respuesta correcta es B.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'psy-stabilieval',
                name: 'STABILIEVAL',
                type: 'Comportamiento (Estabilidad Laboral)',
                duration: '45 minutos',
                description: 'Mide factores asociados con la estabilidad y permanencia en el trabajo, como el compromiso, la adaptabilidad y la tolerancia al estrés.',
                factors: 'Adaptabilidad, Autonomía, Capacidad de planificación a largo plazo, Compromiso con la organización, Permanencia laboral, Tolerancia al estrés.',
                organizationalLevel: 'Gerentes / Jefes / Ejecutivos / Operativos',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                    {
                        id: 'stabilieval-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para STABILIEVAL. La respuesta correcta es C.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'c',
                        timeLimit: 60
                    }
                ]
            }
        ]
    },
    {
        name: 'Pruebas de Habilidades Cognitivas',
        tests: [
            {
                id: 'psy-10fig',
                name: '10FIG',
                type: 'Habilidades Cognitivas',
                duration: '40 minutos',
                description: 'Evalúa un conjunto de habilidades cognitivas clave, incluyendo razonamiento, análisis y organización.',
                factors: 'Información, Juicio, Vocabulario, Síntesis, Habilidad numérica, Análisis, Abstracción, Planeación, Organización y clasificación, Atención y deducción.',
                organizationalLevel: 'Ejecutivos / Jefes / Empleados',
                educationLevel: 'Indistinta',
                evaluationCriteria: [],
                questions: [
                     {
                        id: '10fig-q1',
                        type: 'multiple-choice',
                        text: 'Pregunta de ejemplo para 10FIG. La respuesta correcta es A.',
                        options: [{ id: 'a', text: 'Opción A' }, { id: 'b', text: 'Opción B' }, { id: 'c', text: 'Opción C' }],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            },
        ]
    },
    {
        name: 'Pruebas de Idiomas',
        tests: [
            {
                id: 'lang-en',
                name: 'Prueba de Inglés de Negocios (B2/C1)',
                type: 'Idiomas',
                duration: '50 minutos',
                description: 'Evalúa la competencia en inglés en un contexto profesional, midiendo la comprensión de lectura, gramática y vocabulario de negocios.',
                factors: 'Comprensión de lectura, Gramática, Vocabulario de negocios, Redacción de correos electrónicos.',
                organizationalLevel: 'Todos',
                educationLevel: 'Indistinta',
                evaluationCriteria: ['Nivel MCER (B2, C1)'],
                questions: [
                    {
                        id: 'en-q1',
                        type: 'multiple-choice',
                        text: 'Choose the correct word to complete the sentence: The company decided to ___ its operations to Asia.',
                        options: [
                            { id: 'a', text: 'outsource' },
                            { id: 'b', text: 'offshore' },
                            { id: 'c', text: 'delegate' }
                        ],
                        correctAnswer: 'b',
                        timeLimit: 60
                    }
                ]
            },
            {
                id: 'lang-fr',
                name: 'Prueba de Francés Conversacional (A2/B1)',
                type: 'Idiomas',
                duration: '45 minutos',
                description: 'Mide la habilidad para mantener una conversación básica en francés sobre temas cotidianos y profesionales.',
                factors: 'Comprensión auditiva, Expresión oral, Vocabulario cotidiano, Gramática básica.',
                organizationalLevel: 'Personal de atención al cliente / Ventas',
                educationLevel: 'Indistinta',
                evaluationCriteria: ['Nivel MCER (A2, B1)'],
                questions: [
                    {
                        id: 'fr-q1',
                        type: 'multiple-choice',
                        text: 'Que répondriez-vous à "Comment ça va?"',
                        options: [
                            { id: 'a', text: 'Ça va bien, merci.' },
                            { id: 'b', text: 'Je suis de France.' },
                            { id: 'c', text: 'Il est trois heures.' }
                        ],
                        correctAnswer: 'a',
                        timeLimit: 60
                    }
                ]
            }
        ]
    }
];

export const technicalTests: Evaluation[] = [
    { 
        id: 'tech1', 
        name: 'Desafío de Algoritmos (HackerRank)', 
        type: 'Programación', 
        duration: '60 mins',
        description: 'Una serie de problemas algorítmicos para evaluar la capacidad de resolución de problemas, eficiencia del código y conocimiento de estructuras de datos.',
        factors: 'Resolución de problemas, eficiencia de código, estructuras de datos',
        organizationalLevel: 'Desarrolladores',
        educationLevel: 'Técnica / Profesional',
        evaluationCriteria: ['Correctitud de la Solución', 'Eficiencia (Complejidad Temporal y Espacial)', 'Calidad del Código'],
        questions: [
            { 
                id: 'algo-q1',
                type: 'code',
                text: 'Escribe una función para invertir un árbol binario.', 
                options: [],
                correctAnswer: `function invertTree(node) {
    if (node == null) {
        return null;
    }
    const left = invertTree(node.left);
    const right = invertTree(node.right);
    node.left = right;
    node.right = left;
    return node;
}`,
                timeLimit: 180
            },
            { 
                id: 'algo-q2', 
                type: 'code',
                text: 'Encuentra el subarray contiguo más grande en un array de números.',
                options: [],
                correctAnswer: `function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    return maxSoFar;
}`,
                timeLimit: 240,
            },
        ]
    },
    { 
        id: 'tech2', 
        name: 'Desafío de React & TypeScript', 
        type: 'Frontend', 
        duration: '90 mins',
        description: 'Construir una pequeña aplicación de una sola página (SPA) que consume una API REST, gestiona el estado y demuestra el uso de componentes reutilizables y tipado estricto.',
        factors: 'Desarrollo Frontend, React, TypeScript, Manejo de estado',
        organizationalLevel: 'Desarrolladores Frontend',
        educationLevel: 'Técnica / Profesional',
        evaluationCriteria: ['Estructura del Componente', 'Manejo del Estado (Hooks)', 'Uso de TypeScript', 'Estilado y Maquetación (CSS/Tailwind)'],
        questions: [
            { 
                id: 'react-q1', 
                type: 'code',
                text: 'Crea un hook personalizado `useFetch` para manejar la carga de datos, estados de carga y errores.',
                options: [],
                correctAnswer: `import { useState, useEffect } from 'react';

function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
}`,
                timeLimit: 300,
            },
            { 
                id: 'react-q2',
                type: 'code',
                text: 'Implementa un componente de tabla reutilizable y ordenable con los datos de la API.',
                options: [],
                correctAnswer: `// This would be a more complex component.
// A good answer would involve creating a generic Table component
// that accepts columns and data, and uses local state to manage sorting.
// Example:
// const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'}>({ key: '', direction: 'asc' });
// ... logic to sort data based on sortConfig ...
// ... render table headers with onClick handlers to setSortConfig ...
`,
                timeLimit: 600,
            },
        ]
    },
];

export * from './data';
