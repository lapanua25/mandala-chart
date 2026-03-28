import { GridData, V1GridData, AppState } from '../types';

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const createEmptyGrid = (centerText: string = ''): GridData => {
  return Array.from({ length: 9 }).map((_, i) => ({
    id: generateId(),
    text: i === 4 ? centerText : '',
  }));
};

/**
 * Migrates old V1 nested tree data to V2 normalized data
 */
export const migrateV1toV2 = (v1Root: V1GridData): AppState => {
  const grids: Record<string, GridData> = {};
  const rootGridId = generateId();
  
  const processGrid = (v1Grid: V1GridData, currentGridId: string) => {
    const v2Grid: GridData = [];
    v1Grid.forEach((v1Cell) => {
      let linkedGridId: string | undefined = undefined;
      
      // If it has children, we need to create a new grid for it
      if (v1Cell.children) {
        linkedGridId = generateId();
        processGrid(v1Cell.children, linkedGridId);
      }
      
      v2Grid.push({
        id: v1Cell.id || generateId(),
        text: v1Cell.text || '',
        linkedGridId,
      });
    });
    grids[currentGridId] = v2Grid;
  };
  
  processGrid(v1Root, rootGridId);
  
  return {
    grids,
    rootGridIds: [rootGridId],
  };
};
