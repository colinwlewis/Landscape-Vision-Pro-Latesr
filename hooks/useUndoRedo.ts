
import { useState, useCallback } from 'react';

export function useUndoRedo(initialValue: string) {
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(initialValue);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = index - 1;
      setIndex(newIndex);
      setValue(history[newIndex]);
    }
  }, [canUndo, index, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = index + 1;
      setIndex(newIndex);
      setValue(history[newIndex]);
    }
  }, [canRedo, index, history]);

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const commit = useCallback(() => {
     if (history[index] !== value && value.trim() !== '') {
        const newHistory = history.slice(0, index + 1);
        newHistory.push(value);
        setHistory(newHistory);
        setIndex(newHistory.length - 1);
     }
  }, [history, index, value]);

  const setAndSave = useCallback((newValue: string) => {
    setValue(newValue);
    const newHistory = history.slice(0, index + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  }, [history, index]);

  return {
    value,
    updateValue,
    commit,
    setAndSave,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
