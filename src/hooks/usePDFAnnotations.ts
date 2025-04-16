import { useState, useCallback } from 'react';
import type { Annotation, Stroke, AnnotationHistory } from '@/types/annotator';

export function usePDFAnnotations() {
  // State to track annotations for each page
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  
  // History for undo/redo operations (per page)
  const [history, setHistory] = useState<Record<number, AnnotationHistory>>({});
  
  // Add a new stroke to a page
  const addStroke = useCallback((pageNumber: number, stroke: Stroke) => {
    setAnnotations(prev => {
      const pageAnnotations = [...(prev[pageNumber] || [])];
      pageAnnotations.push({ type: 'stroke', ...stroke });
      
      return {
        ...prev,
        [pageNumber]: pageAnnotations
      };
    });
  }, []);
  
  // Update an existing stroke (during drawing)
  const updateStroke = useCallback((pageNumber: number, updatedStroke: Stroke) => {
    setAnnotations(prev => {
      const pageAnnotations = [...(prev[pageNumber] || [])];
      
      // Find and replace the stroke with the same ID
      const index = pageAnnotations.findIndex(
        a => a.type === 'stroke' && a.id === updatedStroke.id
      );
      
      if (index !== -1) {
        pageAnnotations[index] = { type: 'stroke', ...updatedStroke };
      } else {
        // Add if not found (shouldn't typically happen)
        pageAnnotations.push({ type: 'stroke', ...updatedStroke });
      }
      
      return {
        ...prev,
        [pageNumber]: pageAnnotations
      };
    });
  }, []);
  
  // Finalize a stroke and update history
  const finalizeStroke = useCallback((pageNumber: number, stroke: Stroke) => {
    setAnnotations(prev => {
      const pageAnnotations = [...(prev[pageNumber] || [])];
      
      // Find and replace the stroke with the same ID
      const index = pageAnnotations.findIndex(
        a => a.type === 'stroke' && a.id === stroke.id
      );
      
      if (index !== -1) {
        pageAnnotations[index] = { type: 'stroke', ...stroke };
      } else {
        pageAnnotations.push({ type: 'stroke', ...stroke });
      }

      // Update history after state update is complete
      const currentAnnotations = prev[pageNumber] || [];
      setTimeout(() => {
        setHistory(prevHistory => {
          const pageHistory = prevHistory[pageNumber] || { past: [], future: [] };
          return {
            ...prevHistory,
            [pageNumber]: {
              past: [...pageHistory.past, currentAnnotations],
              future: []
            }
          };
        });
      }, 0);
      
      return {
        ...prev,
        [pageNumber]: pageAnnotations
      };
    });
  }, []);
  
  // Clear all annotations on a page
  const clearPage = useCallback((pageNumber: number) => {
    setAnnotations(prev => {
      // Save current state to history before clearing
      const currentAnnotations = prev[pageNumber] || [];
      
      setHistory(prevHistory => {
        const pageHistory = prevHistory[pageNumber] || { past: [], future: [] };
        return {
          ...prevHistory,
          [pageNumber]: {
            past: [...pageHistory.past, currentAnnotations],
            future: []
          }
        };
      });
      
      // Return new state with cleared page
      return {
        ...prev,
        [pageNumber]: []
      };
    });
  }, []);
  
  // Undo last action on a page
  const undo = useCallback((pageNumber: number) => {
    if (!canUndo(pageNumber)) return false;
    
    setHistory(prev => {
      const pageHistory = prev[pageNumber] || { past: [], future: [] };
      
      if (pageHistory.past.length === 0) {
        return prev;
      }
      
      const newPast = [...pageHistory.past];
      const lastState = newPast.pop();
      
      // Current annotations to push to future
      const currentAnnotations = annotations[pageNumber] || [];
      
      // Update annotations
      setAnnotations(annotationsPrev => ({
        ...annotationsPrev,
        [pageNumber]: lastState || []
      }));
      
      // Update history
      return {
        ...prev,
        [pageNumber]: {
          past: newPast,
          future: [currentAnnotations, ...pageHistory.future]
        }
      };
    });
    
    return true;
  }, [annotations]);
  
  // Redo last undone action on a page
  const redo = useCallback((pageNumber: number) => {
    if (!canRedo(pageNumber)) return false;
    
    setHistory(prev => {
      const pageHistory = prev[pageNumber] || { past: [], future: [] };
      
      if (pageHistory.future.length === 0) {
        return prev;
      }
      
      const newFuture = [...pageHistory.future];
      const nextState = newFuture.shift();
      
      // Current annotations to push to past
      const currentAnnotations = annotations[pageNumber] || [];
      
      // Update annotations
      setAnnotations(annotationsPrev => ({
        ...annotationsPrev,
        [pageNumber]: nextState || []
      }));
      
      // Update history
      return {
        ...prev,
        [pageNumber]: {
          past: [...pageHistory.past, currentAnnotations],
          future: newFuture
        }
      };
    });
    
    return true;
  }, [annotations]);
  
  // Check if undo is available
  const canUndo = useCallback((pageNumber: number) => {
    return (history[pageNumber]?.past.length || 0) > 0;
  }, [history]);
  
  // Check if redo is available
  const canRedo = useCallback((pageNumber: number) => {
    return (history[pageNumber]?.future.length || 0) > 0;
  }, [history]);
  
  return {
    annotations,
    addStroke,
    updateStroke,
    finalizeStroke,
    clearPage,
    undo,
    canUndo,
    redo,
    canRedo
  };
}