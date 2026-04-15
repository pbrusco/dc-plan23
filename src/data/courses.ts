import { Course } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'CBC',
    name: 'Ciclo Básico Común',
    objective: 'Formación básica general.',
    prerequisites: [],
    workload: '20 hs / sem',
    semester: 0,
    type: 'bachiller'
  },
  {
    id: 'IP',
    name: 'Introducción a la Programación',
    objective: 'Introducir al alumnado en el pensamiento algorítmico. Describir conceptos y estructuras algorítmicas fundamentales a través del estudio de la programación imperativa y funcional.',
    prerequisites: ['CBC'],
    workload: '10 hs / sem',
    semester: 1,
    type: 'bachiller'
  },
  {
    id: 'AL',
    name: 'Álgebra',
    objective: 'Cubrir las nociones algebraicas básicas que forman la base sobre los que se sustentan distintos temas de las ciencias de la computación.',
    prerequisites: ['CBC'],
    workload: '10 hs / sem',
    semester: 1,
    type: 'bachiller'
  },
  {
    id: 'AED',
    name: 'Algoritmos y Estructuras de Datos',
    objective: 'Utilizar técnicas de especificación, validación y verificación formal de algoritmos. Definir los tipos abstractos de datos fundamentales, diseñando estructuras de datos y algoritmos eficientes para su implementación, entendiendo cómo impactan las distintas decisiones estructurales en la complejidad de los algoritmos y en la interfaz de los tipos abstractos.',
    prerequisites: ['IP', 'AL'],
    workload: '15 hs / sem',
    semester: 2,
    type: 'bachiller'
  },
  {
    id: 'AM',
    name: 'Análisis Matemático II',
    objective: 'Proveer nociones elementales de cálculo multivariado.',
    prerequisites: ['CBC'],
    workload: '10 hs / sem',
    semester: 2,
    type: 'bachiller'
  },
  {
    id: 'TDA',
    name: 'Técnicas de Diseño de Algoritmos',
    objective: 'Describir las principales técnicas usadas para diseñar algoritmos a partir de la identificación de características comunes en los problemas, como por ejemplo búsqueda iterativa, divide and conquer, backtracking, etc, aplicando las distintas técnicas a problemas clásicos de grafos, cadenas y problemas geométricos.',
    prerequisites: ['AED'],
    workload: '10 hs / sem',
    semester: 3,
    type: 'bachiller'
  },
  {
    id: 'SD',
    name: 'Sistemas Digitales',
    objective: 'Presentar los temas fundamentales vinculados con los dispositivos de cómputo, incluyendo sistemas de representación, lógica digital y estructura de computadoras.',
    prerequisites: ['IP'],
    workload: '5 hs / sem',
    semester: 3,
    type: 'bachiller'
  },
  {
    id: 'PP',
    name: 'Paradigmas de Programación',
    objective: 'Describir distintos paradigmas de programación con su aplicabilidad, ventajas y desventajas, preparando al alumnado para que pueda entender, comparar y aplicar distintos tipos de lenguajes.',
    prerequisites: ['AED'],
    workload: '10 hs / sem',
    semester: 3,
    type: 'bachiller'
  },
  {
    id: 'LFA',
    name: 'Lenguajes Formales, Autómatas y Computabilidad',
    objective: 'Introducir al alumnado en las estructuras de autómatas y los lenguajes que estas estructuras pueden definir, junto con aspectos de computabilidad de problemas.',
    prerequisites: ['AED'],
    workload: '5 hs / sem',
    semester: 4,
    type: 'licenciatura'
  },
  {
    id: 'AOC',
    name: 'Arquitectura y Organización de Computadores',
    objective: 'Describir la estructura básica de los computadores de propósito general y dedicado.',
    prerequisites: ['SD'],
    workload: '10 hs / sem',
    semester: 4,
    type: 'bachiller'
  },
  {
    id: 'IS',
    name: 'Ingeniería de Software',
    objective: 'Brindar los conocimientos básicos sobre cómo construir software en escala, sobre todo en lo referido a especificaciones, diseño y verificación / testing.',
    prerequisites: ['PP'],
    workload: '10 hs / sem',
    semester: 4,
    type: 'bachiller'
  },
  {
    id: 'ALC',
    name: 'Álgebra Lineal Computacional',
    objective: 'Describir las principales herramientas del álgebra lineal con una perspectiva computacional.',
    prerequisites: ['AED'],
    workload: '10 hs / sem',
    semester: 5,
    type: 'licenciatura'
  },
  {
    id: 'CC',
    name: 'Complejidad Computacional',
    objective: 'Definir el concepto de clases de complejidad de problemas computacionales, entendiendo cómo se clasifican los distintos problemas de acuerdo a la cantidad de recursos que consumen.',
    prerequisites: ['TDA', 'LFA'],
    workload: '5 hs / sem',
    semester: 5,
    type: 'licenciatura'
  },
  {
    id: 'SO',
    name: 'Sistemas Operativos',
    objective: 'Describir la arquitectura de un sistema operativo moderno y el funcionamiento de las distintas componentes de tal forma que el alumnado tenga los elementos básicos para su construcción.',
    prerequisites: ['AOC'],
    workload: '10 hs / sem',
    semester: 5,
    type: 'licenciatura'
  },
  {
    id: 'EC',
    name: 'Estadística Computacional',
    objective: 'Brindar una introducción a los temas de probabilidad y estadística, con foco en inferencia estadística y aprendizaje automático.',
    prerequisites: ['ALC', 'AM'],
    workload: '10 hs / sem',
    semester: 6,
    type: 'licenciatura'
  },
  {
    id: 'ARI',
    name: 'Almacenamiento y Recuperación de la Información',
    objective: 'Cubrir el diseño y funcionamiento de sistemas de almacenamiento y recuperación de información, incluyendo distintos tipos de bases de datos y tópicos de gobierno de datos.',
    prerequisites: ['IS'],
    workload: '10 hs / sem',
    semester: 6,
    type: 'licenciatura'
  },
  {
    id: 'RCD',
    name: 'Redes de Comunicaciones y Cómputo Distribuido',
    objective: 'Brindar al alumnado fundamentos teóricos y consideraciones prácticas sobre cómo funcionan las redes de comunicaciones y los sistemas de cómputo distribuido modernos.',
    prerequisites: ['TDA', 'EC', 'SO'],
    workload: '10 hs / sem',
    semester: 7,
    type: 'licenciatura'
  },
  {
    id: 'PCP',
    name: 'Programación Concurrente y Paralela',
    objective: 'Describir los principales tipos de algoritmos y estructuras de datos concurrentes junto con sus limitaciones y posibles soluciones, incluyendo el aprovechamiento de procesamiento paralelo.',
    prerequisites: ['PP', 'SO'],
    workload: '10 hs / sem',
    semester: 7,
    type: 'licenciatura'
  },
  {
    id: 'STS',
    name: 'Seminario sobre Tecnología y Sociedad',
    objective: 'Analizar el impacto de la tecnología en la sociedad.',
    prerequisites: [],
    workload: '5 hs / sem',
    semester: 9,
    type: 'licenciatura'
  },
  {
    id: 'PSE',
    name: 'Práctica Social Educativa',
    objective: 'Vincular la formación académica con la realidad social.',
    prerequisites: [],
    workload: '5 hs / sem',
    semester: 9,
    type: 'licenciatura'
  },
  {
    id: 'OPT1',
    name: 'Optativas (80 horas)',
    objective: 'Cursos electivos.',
    prerequisites: [],
    workload: '5 hs / sem',
    semester: 6,
    type: 'licenciatura'
  },
  {
    id: 'OPT2',
    name: 'Optativas (80 horas)',
    objective: 'Cursos electivos.',
    prerequisites: [],
    workload: '5 hs / sem',
    semester: 7,
    type: 'licenciatura'
  },
  {
    id: 'OPT3',
    name: 'Optativas (80 horas)',
    objective: 'Cursos electivos.',
    prerequisites: [],
    workload: '5 hs / sem',
    semester: 8,
    type: 'licenciatura'
  },
  {
    id: 'OPT4',
    name: 'Optativas (80 horas)',
    objective: 'Cursos electivos.',
    prerequisites: [],
    workload: '5 hs / sem',
    semester: 8,
    type: 'licenciatura'
  },
  {
    id: 'TF',
    name: 'Trabajo Final - Tesis de Licenciatura',
    objective: 'Proyecto final de carrera.',
    prerequisites: [],
    workload: '15 hs / sem',
    semester: 8,
    type: 'licenciatura'
  }
];
