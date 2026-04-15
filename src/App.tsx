import React, { useState, useCallback, useMemo } from 'react';
import { INITIAL_COURSES } from './data/courses';
import { Course, Change } from './types';
import { GraphView } from './components/GraphView';
import { ScheduleView } from './components/ScheduleView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  ArrowRight, 
  History, 
  Plus, 
  Trash2, 
  Info, 
  ChevronRight,
  GitCompare,
  LayoutDashboard,
  Settings2,
  BookOpen,
  CheckCircle2,
  Undo2,
  Redo2,
  Menu
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [originalCourses] = useState<Course[]>(INITIAL_COURSES);
  const [proposedCourses, setProposedCourses] = useState<Course[]>(INITIAL_COURSES);
  const [changes, setChanges] = useState<Change[]>([]);
  const [history, setHistory] = useState<{ courses: Course[], changes: Change[] }[]>([
    { courses: INITIAL_COURSES, changes: [] }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'schedule'>('graph');

  const pushToHistory = useCallback((newCourses: Course[], newChanges: Change[]) => {
    setHistory(prev => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, { courses: newCourses, changes: newChanges }];
    });
    setHistoryIndex(prev => prev + 1);
    setProposedCourses(newCourses);
    setChanges(newChanges);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setProposedCourses(prev.courses);
      setChanges(prev.changes);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setProposedCourses(next.courses);
      setChanges(next.changes);
    }
  }, [history, historyIndex]);

  const toggleOriginal = () => setShowOriginal(prev => !prev);

  const selectedCourse = useMemo(() => 
    proposedCourses.find(c => c.id === selectedCourseId), 
    [proposedCourses, selectedCourseId]
  );

  const indirectPrerequisites = useMemo(() => {
    if (!selectedCourse) return [];
    
    const allPrereqs = new Set<string>();
    const directPrereqs = new Set(selectedCourse.prerequisites);
    const queue = [...selectedCourse.prerequisites];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentCourse = proposedCourses.find(c => c.id === currentId);
      if (currentCourse) {
        currentCourse.prerequisites.forEach(p => {
          if (!allPrereqs.has(p) && !directPrereqs.has(p)) {
            allPrereqs.add(p);
            queue.push(p);
          }
        });
      }
    }
    
    return Array.from(allPrereqs);
  }, [selectedCourse, proposedCourses]);

  const successors = useMemo(() => {
    if (!selectedCourse) return [];
    return proposedCourses.filter(c => c.prerequisites.includes(selectedCourse.id));
  }, [selectedCourse, proposedCourses]);

  const handleCourseClick = useCallback((course: Course | null) => {
    if (!course) {
      setSelectedCourseId(null);
      return;
    }
    setSelectedCourseId(prev => prev === course.id ? null : course.id);
  }, []);

  const handleCourseMove = useCallback((courseId: string, newSemester: number) => {
    const course = proposedCourses.find(c => c.id === courseId);
    if (!course || course.semester === newSemester) return;

    const newCourses = proposedCourses.map(c => 
      c.id === courseId ? { ...c, semester: newSemester } : c
    );
    const newChanges = [
      ...changes,
      { type: 'move_course' as const, courseId, fromSemester: course.semester, toSemester: newSemester }
    ];
    pushToHistory(newCourses, newChanges);
  }, [proposedCourses, changes, pushToHistory]);

  const moveCourse = (courseId: string, direction: 'up' | 'down') => {
    const course = proposedCourses.find(c => c.id === courseId);
    if (!course) return;
    const newSemester = direction === 'up' ? Math.max(0, course.semester - 1) : Math.min(8, course.semester + 1);
    handleCourseMove(courseId, newSemester);
  };

  const removePrerequisite = (courseId: string, prereqId: string) => {
    const newCourses = proposedCourses.map(c => {
      if (c.id === courseId) {
        return { ...c, prerequisites: c.prerequisites.filter(p => p !== prereqId) };
      }
      return c;
    });
    const newChanges = [
      ...changes,
      { type: 'remove_connection' as const, courseId, targetId: prereqId }
    ];
    pushToHistory(newCourses, newChanges);
  };

  const addPrerequisite = (courseId: string, prereqId: string) => {
    const course = proposedCourses.find(c => c.id === courseId);
    if (!course || course.prerequisites.includes(prereqId)) return;

    const newCourses = proposedCourses.map(c => 
      c.id === courseId ? { ...c, prerequisites: [...c.prerequisites, prereqId] } : c
    );
    const newChanges = [
      ...changes,
      { type: 'add_connection' as const, courseId, targetId: prereqId }
    ];
    pushToHistory(newCourses, newChanges);
  };

  const resetChanges = () => {
    pushToHistory(INITIAL_COURSES, []);
  };

  const stats = useMemo(() => {
    const totalCourses = proposedCourses.length;
    let electiveHours = 0;
    
    // Calculate hours for the semester with most hours
    const semesterHours: { [key: number]: number } = {};
    proposedCourses.forEach(c => {
      const hours = parseInt(c.workload) || 0;
      if (c.semester === 9) {
        electiveHours += hours;
      } else {
        semesterHours[c.semester] = (semesterHours[c.semester] || 0) + hours;
      }
    });
    
    const maxSemesterHours = Math.max(...Object.values(semesterHours), 0);
    
    return {
      totalCourses,
      maxSemesterHours,
      electiveHours
    };
  }, [proposedCourses]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {selectedCourse ? (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono font-bold text-accent text-xs mb-1">{selectedCourse.id}</div>
                  <h2 className="text-sm font-bold text-foreground leading-tight">{selectedCourse.name}</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCourseId(null)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="text-[11px] text-muted-foreground bg-muted p-3 rounded border border-border italic">
                "{selectedCourse.objective}"
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-accent bg-accent/5 p-2 rounded border border-accent/10">
                <span className="uppercase tracking-widest">Dedicación</span>
                <span>{selectedCourse.workload}</span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                    <Settings2 className="w-3.5 h-3.5" /> Position
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => moveCourse(selectedCourse.id, 'up')}>
                      Up
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => moveCourse(selectedCourse.id, 'down')}>
                      Down
                    </Button>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  Current: {selectedCourse.semester === 0 ? 'CBC' : `${selectedCourse.semester}° Cuatrimestre`}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <GitCompare className="w-3.5 h-3.5" /> Prerequisites
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCourse.prerequisites.map(p => (
                    <Badge key={p} variant="secondary" className="pl-2 pr-1 py-0.5 text-[10px] flex items-center gap-1 group">
                      {p}
                      <button 
                        onClick={() => removePrerequisite(selectedCourse.id, p)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {selectedCourse.prerequisites.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">No prerequisites</span>
                  )}
                </div>
                
                <div className="pt-2">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2 tracking-widest">Add Prerequisite</p>
                  <div className="grid grid-cols-3 gap-1">
                    {proposedCourses
                      .filter(c => c.id !== selectedCourse.id && !selectedCourse.prerequisites.includes(c.id) && c.semester < selectedCourse.semester)
                      .slice(0, 9)
                      .map(c => (
                        <Button 
                          key={c.id} 
                          variant="outline" 
                          size="sm" 
                          className="text-[9px] h-6 px-1"
                          onClick={() => addPrerequisite(selectedCourse.id, c.id)}
                        >
                          + {c.id}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>

              {indirectPrerequisites.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5" /> Indirect Prerequisites
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {indirectPrerequisites.map(p => (
                        <Badge key={p} variant="outline" className="px-2 py-0.5 text-[10px] bg-muted/30 text-muted-foreground border-dashed">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {successors.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                      <ArrowRight className="w-3.5 h-3.5" /> Habilita a
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {successors.map(s => (
                        <Badge 
                          key={s.id} 
                          variant="outline" 
                          className="px-2 py-0.5 text-[10px] bg-accent/5 text-accent border-accent/20 cursor-pointer hover:bg-accent/10"
                          onClick={() => setSelectedCourseId(s.id)}
                        >
                          {s.id}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">
                      Estas materias requieren {selectedCourse.id} para ser cursadas.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Info className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <div>
                <h3 className="text-foreground font-bold text-sm">Select a course</h3>
                <p className="text-[11px] text-muted-foreground">Click on any course in the graph to see details and propose changes.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
            <History className="w-3.5 h-3.5" /> Change Log
          </h3>
          <Badge variant="secondary" className="text-[10px] h-4 px-1">{changes.length}</Badge>
        </div>
        <ScrollArea className="h-32 mb-3 border rounded bg-card p-2">
          <div className="space-y-1.5">
            {changes.map((change, i) => (
              <div key={i} className="text-[9px] p-1.5 bg-muted/50 rounded border border-border flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  change.type === 'move_course' ? 'bg-orange-400' : 
                  change.type === 'remove_connection' ? 'bg-destructive' : 'bg-success'
                }`} />
                <span className="font-bold text-accent">{change.courseId}</span>
                <span className="text-muted-foreground truncate">
                  {change.type === 'move_course' ? `moved ${change.fromSemester} → ${change.toSemester}` : 
                   change.type === 'remove_connection' ? `removed prereq ${change.targetId}` : `added prereq ${change.targetId}`}
                </span>
              </div>
            ))}
            {changes.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-4 italic">No changes proposed yet</p>
            )}
          </div>
        </ScrollArea>
        <Button 
          variant="outline" 
          className="w-full h-8 text-[10px]" 
          onClick={resetChanges}
          disabled={changes.length === 0}
        >
          Reset All Changes
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="h-[56px] bg-primary text-white flex items-center justify-between px-4 md:px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-white h-8 w-8" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetHeader className="p-5 border-b">
                <SheetTitle className="text-sm uppercase tracking-widest">Course Architect</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <LayoutDashboard className="w-5 h-5 text-accent hidden sm:block" />
          <div className="font-bold text-base md:text-lg tracking-tight">
            CurriculumArchitect <span className="font-light opacity-70 hidden xs:inline">v1.2</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 gap-2 border-white/30 hover:bg-white/10 hidden sm:flex ${!showOriginal ? 'bg-white/20' : ''}`}
            onClick={toggleOriginal}
          >
            <GitCompare className="w-4 h-4" />
            <span className="hidden lg:inline">{showOriginal ? 'Ocultar Original' : 'Mostrar Original'}</span>
          </Button>
          <div className="flex items-center bg-white/10 rounded-md p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2 text-xs gap-1.5 ${viewMode === 'graph' ? 'bg-white/20 text-white' : 'text-white/60'}`}
              onClick={() => setViewMode('graph')}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grafo</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2 text-xs gap-1.5 ${viewMode === 'schedule' ? 'bg-white/20 text-white' : 'text-white/60'}`}
              onClick={() => setViewMode('schedule')}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Agenda</span>
            </Button>
          </div>
          <div className="flex items-center bg-white/10 rounded-md p-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20 disabled:opacity-30" 
              onClick={undo}
              disabled={historyIndex === 0}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20 disabled:opacity-30" 
              onClick={redo}
              disabled={historyIndex === history.length - 1}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <Button size="sm" className="h-8 bg-accent hover:bg-accent/90 text-white text-xs px-2 md:px-3">
            <span className="hidden sm:inline">Exportar Propuesta</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop only */}
        <div className="hidden md:flex w-80 bg-card border-r flex-col shadow-sm z-10">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <main className={`flex-1 grid ${showOriginal && viewMode === 'graph' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-px bg-border overflow-hidden`}>
          {showOriginal && viewMode === 'graph' && (
            <div className="bg-card h-full overflow-hidden border-b lg:border-b-0">
              <GraphView 
                title="Versión Original" 
                courses={originalCourses} 
                highlightedCourseId={selectedCourseId}
                onCourseClick={handleCourseClick}
              />
            </div>
          )}
          <div className="bg-card h-full overflow-hidden">
            {viewMode === 'graph' ? (
              <GraphView 
                title="Propuesta: Orientación Datos" 
                courses={proposedCourses} 
                highlightedCourseId={selectedCourseId}
                onCourseClick={handleCourseClick}
                onCourseMove={handleCourseMove}
              />
            ) : (
              <ScheduleView 
                courses={proposedCourses}
                highlightedCourseId={selectedCourseId}
                onCourseClick={handleCourseClick}
              />
            )}
          </div>
        </main>
      </div>

      {/* Stats Bar */}
      <footer className="h-auto md:h-8 bg-card border-t flex flex-col md:flex-row items-center px-4 md:px-6 py-2 md:py-0 text-[10px] md:text-[11px] text-muted-foreground gap-2 md:gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Nodo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>Eliminado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Añadido</span>
          </div>
        </div>
        <div className="md:ml-auto flex items-center gap-3 md:gap-4">
          <div>Elecc.: <b className="text-foreground">{stats.electiveHours} hs</b></div>
          <div>Máx: <b className="text-foreground">{stats.maxSemesterHours} hs/s</b></div>
          <div>Materias: <b className="text-foreground">{stats.totalCourses}</b></div>
        </div>
      </footer>
    </div>
  );
}
