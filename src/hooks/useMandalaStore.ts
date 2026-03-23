import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { GridData, BreadcrumbItem } from '../types';
import { createEmptyGrid } from '../utils/gridUtils';

export function useMandalaStore() {
  const [rootData, setRootData] = useLocalStorage<GridData>('mandala-data', createEmptyGrid());
  const [currentPath, setCurrentPath] = useState<number[]>([]); // array of indices

  // Helper to get current layer data
  const getCurrentGrid = useCallback(() => {
    let current = rootData;
    for (const index of currentPath) {
      if (!current[index].children) {
        // Fallback: This shouldn't happen usually if drillDown creates children
        return null;
      }
      current = current[index].children!;
    }
    return current;
  }, [rootData, currentPath]);

  // Deep clone and update tree
  const _updateTree = useCallback((
    tree: GridData,
    path: number[],
    updater: (grid: GridData) => GridData
  ): GridData => {
    if (path.length === 0) {
      return updater([...tree]);
    }
    const [head, ...rest] = path;
    const newTree = [...tree];
    const targetCell = { ...newTree[head] };
    if (!targetCell.children) {
      targetCell.children = createEmptyGrid();
    }
    targetCell.children = _updateTree(targetCell.children, rest, updater);
    newTree[head] = targetCell;
    return newTree;
  }, []);

  const updateCell = useCallback((index: number, text: string) => {
    setRootData((prev) => {
      return _updateTree(prev, currentPath, (grid) => {
        const newGrid = [...grid];
        newGrid[index] = { ...newGrid[index], text };
        return newGrid;
      });
    });
  }, [currentPath, setRootData, _updateTree]);

  const drillDown = useCallback((index: number) => {
    if (index === 4) return; // Cannot drill down center
    
    // Ensure children exist before drilling down
    setRootData((prev) => {
      return _updateTree(prev, currentPath, (grid) => {
        const newGrid = [...grid];
        if (!newGrid[index].children) {
          const newChildren = createEmptyGrid();
          // The center of the new children grid should inherit the text of the parent cell
          newChildren[4] = { ...newChildren[4], text: newGrid[index].text };
          newGrid[index] = { ...newGrid[index], children: newChildren };
        }
        return newGrid;
      });
    });

    setCurrentPath((prev) => [...prev, index]);
  }, [currentPath, setRootData, _updateTree]);

  const drillUp = useCallback(() => {
    setCurrentPath((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  const gotoBreadcrumb = useCallback((depth: number) => {
    setCurrentPath((prev) => prev.slice(0, depth));
  }, []);

  // Compute breadcrumbs
  const breadcrumbs = useMemo(() => {
    const list: BreadcrumbItem[] = [];
    list.push({ id: 'root', text: rootData[4]?.text || 'メインテーマ', indexInParent: -1 });

    let current = rootData;
    currentPath.forEach((index) => {
      const node = current[index];
      list.push({ id: node.id, text: node.text || '名称未設定', indexInParent: index });
      current = node.children!;
    });
    
    return list;
  }, [rootData, currentPath]);

  // Sync center cell text back to parent when center cell changes
  const updateCenterCell = useCallback((text: string) => {
    // 1. Update Current Center
    updateCell(4, text);

    // 2. If we are deep, update the parent's generic cell too
    if (currentPath.length > 0) {
      const parentPath = currentPath.slice(0, -1);
      const childIndexInParent = currentPath[currentPath.length - 1];
      
      setRootData((prev) => {
        return _updateTree(prev, parentPath, (grid) => {
          const newGrid = [...grid];
          newGrid[childIndexInParent] = { ...newGrid[childIndexInParent], text };
          return newGrid;
        });
      });
    }
  }, [currentPath, updateCell, setRootData, _updateTree]);

  return {
    currentGrid: getCurrentGrid(),
    currentPath,
    breadcrumbs,
    updateCell,
    updateCenterCell,
    drillDown,
    drillUp,
    gotoBreadcrumb,
  };
}
