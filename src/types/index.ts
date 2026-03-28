export interface CellData {
  id: string;
  text: string;
  linkedGridId?: string; // Point to another grid's ID to drill down
}

export type GridData = CellData[]; // Always length 9

export interface AppState {
  grids: Record<string, GridData>;
  rootGridIds: string[]; // Grids that show up on the sidebar/home
}

// Support history navigation
export interface PathNode {
  gridId: string;   // The grid we navigated into
  fromCellId?: string; // the cell we clicked from the parent (to know how we got here, optional)
}

export interface BreadcrumbItem {
  gridId: string;
  text: string;
}

// V1 types for migration
export interface V1CellData {
  id: string;
  text: string;
  children: V1CellData[] | null;
}
export type V1GridData = V1CellData[];
