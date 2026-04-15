import React from 'react';
import { Course } from '../types';
import { motion } from 'motion/react';

interface ScheduleViewProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
  highlightedCourseId?: string | null;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  courses, 
  onCourseClick,
  highlightedCourseId
}) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="px-5 py-3 border-b bg-[#fafafa] flex justify-between items-center shrink-0">
        <h3 className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">
          Vista por Día de la Semana
        </h3>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div className="col-span-1" />
            {DAYS.map(day => (
              <div key={day} className="text-center font-bold text-sm text-slate-600 border-b pb-2">
                {day}
              </div>
            ))}
          </div>
          
          {SEMESTERS.map(sem => (
            <div key={sem} className="grid grid-cols-6 gap-4 min-h-[100px] border-b border-slate-100 last:border-0 py-4">
              <div className="col-span-1 flex flex-col justify-center items-end pr-4 border-r border-slate-100">
                <span className="text-xs font-bold text-slate-500">Cuat. {sem}</span>
                <span className="text-[10px] text-slate-400">
                  ({courses.filter(c => c.semester === sem).reduce((acc, curr) => acc + (parseInt(curr.workload) || 0), 0)} hs)
                </span>
              </div>
              
              {DAYS.map(day => {
                const coursesInSlot = courses.filter(c => c.semester === sem && c.days?.includes(day));
                
                return (
                  <div key={day} className="col-span-1 flex flex-col gap-2">
                    {coursesInSlot.map(course => (
                      <motion.div
                        key={course.id}
                        layoutId={`course-${course.id}-${day}`}
                        onClick={() => onCourseClick?.(course)}
                        className={`
                          p-2 rounded-lg border text-center cursor-pointer transition-all
                          ${course.id === highlightedCourseId 
                            ? 'ring-2 ring-blue-500 border-blue-500 shadow-md z-10' 
                            : 'hover:border-slate-300 hover:shadow-sm'}
                          ${course.type === 'bachiller' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}
                        `}
                      >
                        <div className="font-bold text-[10px] text-slate-800">{course.id}</div>
                        <div className="text-[8px] text-slate-500 truncate">{course.name}</div>
                      </motion.div>
                    ))}
                    {coursesInSlot.length === 0 && (
                      <div className="flex-1 rounded-lg border border-dashed border-slate-100 bg-slate-50/30" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
