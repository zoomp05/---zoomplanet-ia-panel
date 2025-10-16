import { useState, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'compact_widget_state_';

export const useCompactState = (widgetId, defaultState = false) => {
  // Función para obtener el estado inicial
  const getInitialState = useCallback(() => {
    const key = `${STORAGE_KEY_PREFIX}${widgetId}`;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultState;
    } catch {
      return defaultState;
    }
  }, [widgetId, defaultState]);

  const [isExpanded, setIsExpandedState] = useState(getInitialState);

  const setIsExpanded = useCallback((newState) => {
    const key = `${STORAGE_KEY_PREFIX}${widgetId}`;
    const finalState = typeof newState === 'function' ? newState(isExpanded) : newState;
    
    // Actualizar localStorage primero
    try {
      localStorage.setItem(key, JSON.stringify(finalState));
    } catch (error) {
      console.error('Error saving state:', error);
    }

    // Luego actualizar el estado
    setIsExpandedState(finalState);
  }, [widgetId, isExpanded]);

  return [isExpanded, setIsExpanded];
};
