import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Course } from '../types';
import { motion } from 'motion/react';

interface GraphViewProps {
  courses: Course[];
  onCourseClick?: (course: Course | null) => void;
  onCourseMove?: (courseId: string, newSemester: number) => void;
  highlightedCourseId?: string | null;
  title: string;
}

const SEMESTER_HEIGHT = 100;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 52;
const PADDING_TOP = 60;
const LEFT_MARGIN = 120;

export const GraphView: React.FC<GraphViewProps> = ({ 
  courses, 
  onCourseClick, 
  onCourseMove,
  highlightedCourseId,
  title 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const nodes = useMemo(() => {
    // Group by semester to calculate X positions
    const semesters: { [key: number]: Course[] } = {};
    courses.forEach(c => {
      if (!semesters[c.semester]) semesters[c.semester] = [];
      semesters[c.semester].push(c);
    });

    return courses.map(course => {
      const semesterCourses = semesters[course.semester];
      const index = semesterCourses.indexOf(course);
      const totalInSemester = semesterCourses.length;
      
      // Center nodes in the semester row
      const x = (index - (totalInSemester - 1) / 2) * (NODE_WIDTH + 20) + 450;
      const y = course.semester * SEMESTER_HEIGHT + PADDING_TOP;
      
      return {
        ...course,
        x,
        y
      };
    });
  }, [courses]);

  const links = useMemo(() => {
    const l: { source: any, target: any, isInvalid: boolean }[] = [];
    nodes.forEach(target => {
      target.prerequisites.forEach(prereqId => {
        const source = nodes.find(n => n.id === prereqId);
        if (source) {
          l.push({ 
            source, 
            target, 
            isInvalid: source.semester >= target.semester 
          });
        }
      });
    });
    return l;
  }, [nodes]);

  const ancestors = useMemo(() => {
    if (!highlightedCourseId) return new Set<string>();
    const result = new Set<string>();
    const queue = [...(courses.find(c => c.id === highlightedCourseId)?.prerequisites || [])];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (result.has(currentId)) continue;
      result.add(currentId);
      const course = courses.find(c => c.id === currentId);
      if (course) {
        queue.push(...course.prerequisites);
      }
    }
    return result;
  }, [highlightedCourseId, courses]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 10 * SEMESTER_HEIGHT + PADDING_TOP + 50;
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Background to catch clicks outside nodes
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('click', () => onCourseClick?.(null));

    // Draw Year Sidebar and Semester Labels
    const years = [
      { label: 'CBC', start: 0, end: 0 },
      { label: 'Año 1', start: 1, end: 2 },
      { label: 'Año 2', start: 3, end: 4 },
      { label: 'Año 3', start: 5, end: 6 },
      { label: 'Año 4', start: 7, end: 8 },
      { label: 'Elecc.', start: 9, end: 9 },
    ];

    years.forEach((year, idx) => {
      const yStart = year.start * SEMESTER_HEIGHT + PADDING_TOP - SEMESTER_HEIGHT / 2;
      const yEnd = year.end * SEMESTER_HEIGHT + PADDING_TOP + SEMESTER_HEIGHT / 2;
      const yMid = (yStart + yEnd) / 2;

      // Year vertical label
      const yearG = g.append('g')
        .attr('transform', `translate(20, ${yMid}) rotate(-90)`);
      
      yearG.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#334155')
        .text(year.label);

      // Year separator bracket/line
      g.append('path')
        .attr('d', `M 40 ${yStart + 5} L 35 ${yStart + 5} L 35 ${yEnd - 5} L 40 ${yEnd - 5}`)
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2);
    });

    // Calculate semester totals
    const semesterTotals: { [key: number]: number } = {};
    courses.forEach(c => {
      const hours = parseInt(c.workload) || 0;
      semesterTotals[c.semester] = (semesterTotals[c.semester] || 0) + hours;
    });

    // Draw semester lines and labels
    for (let i = 0; i <= 9; i++) {
      const y = i * SEMESTER_HEIGHT + PADDING_TOP;
      const totalHours = semesterTotals[i] || 0;
      
      g.append('line')
        .attr('x1', LEFT_MARGIN)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', '#cbd5e1')
        .attr('stroke-dasharray', '5,5');
      
      let label = `${i}° Cuatrimestre`;
      if (i === 0) label = 'CBC';
      if (i === 9) label = 'A elección';

      const labelText = g.append('text')
        .attr('x', 50)
        .attr('y', y + 5)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#475569');

      labelText.append('tspan').text(label);
      
      if (totalHours > 0) {
        labelText.append('tspan')
          .attr('x', 50)
          .attr('dy', '1.2em')
          .attr('font-size', '9px')
          .attr('font-weight', '400')
          .attr('fill', '#94a3b8')
          .text(`(${totalHours} hs/sem)`);
      }
    }

    // Draw links
    const linkPaths = g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        const prereqs = d.target.prerequisites;
        const prereqIndex = prereqs.indexOf(d.source.id);
        const totalPrereqs = prereqs.length;
        
        const offsetRange = NODE_WIDTH * 0.6; 
        const offset = totalPrereqs > 1 
          ? (prereqIndex - (totalPrereqs - 1) / 2) * (offsetRange / (totalPrereqs - 1 || 1))
          : 0;

        const startX = d.source.x;
        const startY = d.source.y + NODE_HEIGHT / 2;
        const endX = d.target.x + offset;
        const endY = d.target.y - NODE_HEIGHT / 2;
        
        // Smooth cubic bezier curve
        const cp1y = startY + (endY - startY) * 0.4;
        const cp2y = startY + (endY - startY) * 0.6;
        
        return `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        if (d.isInvalid) return '#ef4444';
        
        const isDirect = highlightedCourseId && (d.source.id === highlightedCourseId || d.target.id === highlightedCourseId);
        const isAncestorPath = highlightedCourseId && ancestors.has(d.target.id);
        
        if (highlightedCourseId) {
          if (isDirect) return '#3b82f6';
          if (isAncestorPath) return '#94a3b8';
          return '#f1f5f9';
        }

        if (d.source.type === 'bachiller') return '#93c5fd';
        return '#cbd5e1';
      })
      .attr('stroke-width', (d: any) => {
        const isDirect = highlightedCourseId && (d.source.id === highlightedCourseId || d.target.id === highlightedCourseId);
        const isAncestorPath = highlightedCourseId && ancestors.has(d.target.id);
        if (isDirect) return 3;
        if (isAncestorPath) return 1.5;
        return 1;
      })
      .attr('stroke-dasharray', (d: any) => {
        if (highlightedCourseId) {
          const isDirect = d.source.id === highlightedCourseId || d.target.id === highlightedCourseId;
          const isAncestorPath = ancestors.has(d.target.id);
          return (isDirect || isAncestorPath) ? null : '2,2';
        }
        return null;
      })
      .attr('opacity', (d: any) => {
        if (highlightedCourseId) {
          const isDirect = d.source.id === highlightedCourseId || d.target.id === highlightedCourseId;
          const isAncestorPath = ancestors.has(d.target.id);
          return (isDirect || isAncestorPath) ? 1 : 0.4;
        }
        return 1;
      })
      .attr('marker-end', (d: any) => {
        if (highlightedCourseId) {
          const isDirect = d.source.id === highlightedCourseId || d.target.id === highlightedCourseId;
          const isAncestorPath = ancestors.has(d.target.id);
          if (isDirect) return d.isInvalid ? 'url(#arrowhead-invalid)' : (d.source.type === 'bachiller' ? 'url(#arrowhead-blue)' : 'url(#arrowhead)');
          if (isAncestorPath) return 'url(#arrowhead-ancestor)';
          return 'url(#arrowhead-faint)';
        }
        return d.isInvalid ? 'url(#arrowhead-invalid)' : (d.source.type === 'bachiller' ? 'url(#arrowhead-blue)' : 'url(#arrowhead)');
      });

    // Arrowhead definitions
    const defs = svg.append('defs');
    
    const createMarker = (id: string, color: string, opacity: number = 1) => {
      defs.append('marker')
        .attr('id', id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 9)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color)
        .attr('fill-opacity', opacity);
    };

    createMarker('arrowhead', '#334155');
    createMarker('arrowhead-blue', '#2563eb');
    createMarker('arrowhead-invalid', '#ef4444');
    createMarker('arrowhead-faint', '#cbd5e1', 0.3);
    createMarker('arrowhead-ancestor', '#94a3b8', 0.8);

    // Drag behavior
    const drag = d3.drag<SVGGElement, any>()
      .on('start', function() {
        if (!onCourseMove) return;
        d3.select(this).raise();
      })
      .on('drag', function(event) {
        if (!onCourseMove) return;
        d3.select(this).attr('transform', `translate(${event.x - NODE_WIDTH / 2}, ${event.y - NODE_HEIGHT / 2})`);
      })
      .on('end', function(event, d) {
        if (!onCourseMove) return;
        const newSemester = Math.max(0, Math.min(8, Math.round((event.y - PADDING_TOP) / SEMESTER_HEIGHT)));
        if (newSemester !== d.semester) {
          onCourseMove(d.id, newSemester);
        } else {
          d3.select(this).attr('transform', `translate(${d.x - NODE_WIDTH / 2}, ${d.y - NODE_HEIGHT / 2})`);
        }
      });

    // Draw nodes
    const nodeGroups = g.selectAll<SVGGElement, any>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x - NODE_WIDTH / 2}, ${d.y - NODE_HEIGHT / 2})`)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (event.defaultPrevented) return;
        onCourseClick?.(d);
      })
      .style('cursor', onCourseMove ? 'grab' : 'pointer');

    if (onCourseMove) {
      nodeGroups.call(drag as any);
    }

    nodeGroups.append('rect')
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .attr('rx', NODE_HEIGHT / 2)
      .attr('ry', NODE_HEIGHT / 2)
      .attr('fill', (d: any) => {
        if (highlightedCourseId && d.id !== highlightedCourseId) {
          // Check if it's a direct prereq or direct successor
          const isPrereq = links.some(l => l.target.id === highlightedCourseId && l.source.id === d.id);
          const isSuccessor = links.some(l => l.source.id === highlightedCourseId && l.target.id === d.id);
          const isAncestor = ancestors.has(d.id);
          if (!isPrereq && !isSuccessor && !isAncestor) return '#f8fafc';
        }
        if (d.type === 'bachiller') return '#bfdbfe';
        if (d.type === 'licenciatura') return '#fef3c7';
        return '#ffffff';
      })
      .attr('stroke', (d: any) => {
        if (d.id === highlightedCourseId) return '#3b82f6';
        
        if (highlightedCourseId) {
          const isPrereq = links.some(l => l.target.id === highlightedCourseId && l.source.id === d.id);
          const isSuccessor = links.some(l => l.source.id === highlightedCourseId && l.target.id === d.id);
          const isAncestor = ancestors.has(d.id);
          if (isPrereq || isSuccessor) return '#94a3b8';
          if (isAncestor) return '#cbd5e1';
          return '#f1f5f9';
        }

        if (d.type === 'bachiller') return '#3b82f6';
        if (d.type === 'licenciatura') return '#f59e0b';
        return '#e2e8f0';
      })
      .attr('stroke-width', (d: any) => d.id === highlightedCourseId ? 3 : 1.5)
      .attr('opacity', (d: any) => {
        if (highlightedCourseId) {
          const isPrereq = links.some(l => l.target.id === highlightedCourseId && l.source.id === d.id);
          const isSuccessor = links.some(l => l.source.id === highlightedCourseId && l.target.id === d.id);
          const isAncestor = ancestors.has(d.id);
          return (d.id === highlightedCourseId || isPrereq || isSuccessor || isAncestor) ? 1 : 0.3;
        }
        return 1;
      })
      .attr('class', 'transition-all duration-200');

    // Node Name
    nodeGroups.append('text')
      .attr('x', NODE_WIDTH / 2)
      .attr('y', NODE_HEIGHT / 2 - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('fill', '#1e293b')
      .text((d: any) => {
        const name = d.name;
        return name.length > 28 ? name.substring(0, 25) + '...' : name;
      });

    // Node ID + Hours
    nodeGroups.append('text')
      .attr('x', NODE_WIDTH / 2)
      .attr('y', NODE_HEIGHT / 2 + 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', '600')
      .attr('fill', '#475569')
      .text((d: any) => `${d.id} • ${d.workload}`);

  }, [nodes, links, highlightedCourseId, onCourseClick]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="px-5 py-3 border-b bg-[#fafafa] flex justify-between items-center shrink-0">
        <h3 className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-4 rounded bg-[#bfdbfe] border border-[#3b82f6]" />
            <span className="text-[10px] text-muted-foreground font-medium">Bachiller</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-4 rounded bg-[#fef3c7] border border-[#f59e0b]" />
            <span className="text-[10px] text-muted-foreground font-medium">Licenciatura</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <div className="min-w-[900px] p-5">
          <svg 
            ref={svgRef} 
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
};
