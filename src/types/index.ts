
export interface Course {
  id: string;
  name: string;
  objective: string;
  prerequisites: string[];
  workload: string;
  semester: number; // 0 for CBC, 1-8 for Cuatrimestres
  type: 'bachiller' | 'licenciatura' | 'optativa';
}

export interface Change {
  type: 'remove_connection' | 'add_connection' | 'move_course';
  courseId: string;
  targetId?: string;
  fromSemester?: number;
  toSemester?: number;
}
