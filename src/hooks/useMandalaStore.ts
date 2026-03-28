import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { AppState, V1GridData } from '../types';
import { createEmptyGrid, generateId, migrateV1toV2 } from '../utils/gridUtils';

export function useMandalaStore() {
  // We use "any" for the initial raw load to detect migration
  const [rawData, setRawData] = useLocalStorage<any>('mandala-data', null);
  
  // In-memory state wrapper
  const [appState, setAppState] = useState<AppState | null>(null);
  
  // Navigation state
  const [activePath, setActivePath] = useState<string[]>([]); // array of gridIds

  // On mount: Migration or Initialization
  useEffect(() => {
    if (!rawData) {
      // First time user
      const rootId = generateId();
      setAppState({
        grids: { [rootId]: createEmptyGrid() },
        rootGridIds: [rootId]
      });
      setActivePath([rootId]);
    } else if (Array.isArray(rawData)) {
      // V1 to V2 Migration
      const migrated = migrateV1toV2(rawData as V1GridData);
      setAppState(migrated);
      setActivePath([migrated.rootGridIds[0]]);
      setRawData(migrated); // Save migrated data immediately
    } else {
      // Standard V2 load
      setAppState(rawData as AppState);
      if (rawData.rootGridIds && rawData.rootGridIds.length > 0) {
        setActivePath([rawData.rootGridIds[0]]);
      } else {
        // Fallback if empty for some reason
        const rootId = generateId();
        setAppState({ grids: { [rootId]: createEmptyGrid() }, rootGridIds: [rootId] });
        setActivePath([rootId]);
      }
    }
  }, []);

  // Sync back to local storage whenever appState changes explicitly
  const updateAppState = useCallback((updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      if (!prev) return prev;
      const nextState = updater(prev);
      setRawData(nextState); // Autosave to localStorage
      return nextState;
    });
  }, [setRawData]);

  // Read current grid safely
  const currentGridId = activePath.length > 0 ? activePath[activePath.length - 1] : null;
  const currentGrid = useMemo(() => {
    if (!appState || !currentGridId) return null;
    return appState.grids[currentGridId] || null;
  }, [appState, currentGridId]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!appState || activePath.length === 0) return [];
    return activePath.map((gridId) => {
      const grid = appState.grids[gridId];
      // The center text of the grid is its title
      const text = grid ? grid[4].text || '名称未設定' : 'Unknown';
      return { gridId, text };
    });
  }, [appState, activePath]);


  /* --- Data Mutators --- */

  const updateCell = useCallback((gridId: string, cellIndex: number, text: string) => {
    updateAppState((prev) => {
      const g = prev.grids[gridId];
      if (!g) return prev;
      const newGrid = [...g];
      newGrid[cellIndex] = { ...newGrid[cellIndex], text };
      return { ...prev, grids: { ...prev.grids, [gridId]: newGrid } };
    });
  }, [updateAppState]);

  const updateCenterCell = useCallback((gridId: string, text: string) => {
    // Center cell just updates its own text.
    // In V2, we don't rigidly sync backwards to parent cells automatically 
    // because a grid can have multiple parents. We can do it broadly, or leave it detached.
    updateCell(gridId, 4, text);
  }, [updateCell]);

  /* --- Navigation --- */

  const drillDown = useCallback((cellIndex: number) => {
    if (cellIndex === 4 || !currentGridId || !appState) return;
    
    const cell = appState.grids[currentGridId][cellIndex];
    let targetGridId = cell.linkedGridId;

    if (!targetGridId) {
      // Generate new grid for it on the fly
      targetGridId = generateId();
      updateAppState((prev) => {
        const newGridArray = [...prev.grids[currentGridId]];
        newGridArray[cellIndex] = { ...newGridArray[cellIndex], linkedGridId: targetGridId };
        
        // The new grid inherits the text of the cell as its center text
        const newTargetGrid = createEmptyGrid(newGridArray[cellIndex].text);
        
        return {
          ...prev,
          grids: {
            ...prev.grids,
            [currentGridId as string]: newGridArray,
            [targetGridId as string]: newTargetGrid
          }
        };
      });
    }

    setActivePath((prev) => [...prev, targetGridId!]);
  }, [appState, currentGridId, updateAppState]);

  const gotoBreadcrumb = useCallback((index: number) => {
    setActivePath((prev) => prev.slice(0, index + 1));
  }, []);

  /* --- Advanced Ops --- */

  const createNewRootChart = useCallback(() => {
    const rootId = generateId();
    updateAppState((prev) => {
      return {
        ...prev,
        grids: { ...prev.grids, [rootId]: createEmptyGrid() },
        rootGridIds: [...prev.rootGridIds, rootId]
      };
    });
    setActivePath([rootId]);
  }, [updateAppState]);

  const deleteRootChart = useCallback((gridId: string) => {
    let nextRootId = '';
    updateAppState((prev) => {
      const newRootIds = prev.rootGridIds.filter(id => id !== gridId);
      if (newRootIds.length === 0) return prev; // Prevent deleting the last root
      nextRootId = newRootIds[0];
      return { ...prev, rootGridIds: newRootIds };
    });
    
    // If we are currently displaying the deleted grid (or inside it), go to the first available root
    setActivePath((prev) => {
      if (prev.includes(gridId) && nextRootId) {
        return [nextRootId];
      }
      return prev;
    });
  }, [updateAppState]);

  const switchRootChart = useCallback((gridId: string) => {
    setActivePath([gridId]);
  }, []);

  const promoteToRoot = useCallback((gridId: string) => {
    updateAppState((prev) => {
      if (prev.rootGridIds.includes(gridId)) return prev;
      return { ...prev, rootGridIds: [...prev.rootGridIds, gridId] };
    });
  }, [updateAppState]);

  const linkGridToCell = useCallback((cellIndex: number, targetGridId: string) => {
    if (!currentGridId) return;
    updateAppState((prev) => {
      const g = prev.grids[currentGridId];
      if (!g) return prev;
      const newGrid = [...g];
      newGrid[cellIndex] = { ...newGrid[cellIndex], linkedGridId: targetGridId };
      return { ...prev, grids: { ...prev.grids, [currentGridId]: newGrid } };
    });
  }, [currentGridId, updateAppState]);
  
  const unlinkGridFromCell = useCallback((cellIndex: number) => {
    if (!currentGridId) return;
    updateAppState((prev) => {
      const g = prev.grids[currentGridId];
      if (!g) return prev;
      const newGrid = [...g];
      delete newGrid[cellIndex].linkedGridId; // Remve link
      return { ...prev, grids: { ...prev.grids, [currentGridId]: newGrid } };
    });
  }, [currentGridId, updateAppState]);

  return {
    appState,
    activePath,
    currentGridId,
    currentGrid,
    breadcrumbs,
    updateCell,
    updateCenterCell,
    drillDown,
    gotoBreadcrumb,
    createNewRootChart,
    deleteRootChart,
    switchRootChart,
    promoteToRoot,
    linkGridToCell,
    unlinkGridFromCell,
  };
}
