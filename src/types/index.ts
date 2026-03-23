export interface CellData {
  id: string;
  text: string;
  children: CellData[] | null;
}

export type GridData = CellData[]; // Always length 9

export interface BreadcrumbItem {
  id: string;
  text: string;
  indexInParent: number;
}
