import { AppState } from '../types';

export interface GraphNode {
  id: string;
  name: string;
  val: number; // For styling (size)
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export const generateGraphData = (appState: AppState, rootGridId: string) => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const visitedGrids = new Set<string>();

  const traverse = (gridId: string, depth: number) => {
    if (visitedGrids.has(gridId)) return;
    visitedGrids.add(gridId);

    const grid = appState.grids[gridId];
    if (!grid) return;

    const centerCell = grid[4];
    const centerNodeId = `grid-${gridId}`;

    // Add center node for this grid
    if (!nodes.find(n => n.id === centerNodeId)) {
      nodes.push({
        id: centerNodeId,
        name: centerCell.text || '名称未設定',
        val: depth === 0 ? 5 : (depth === 1 ? 3 : 2), // Root is biggest
        color: depth === 0 ? 'var(--theme-primary)' : 'var(--theme-primary-hover)'
      });
    }

    // Traverse 8 peripheral cells
    grid.forEach((cell, index) => {
      if (index === 4) return; // Skip center
      if (!cell.text && !cell.linkedGridId) return; // Skip empty cells with no links

      if (cell.linkedGridId && appState.grids[cell.linkedGridId]) {
        // This cell acts as a bridge to another grid.
        // The cell's text is essentially the other grid's center text.
        // Link directly to the other grid's center.
        const targetGridId = `grid-${cell.linkedGridId}`;
        links.push({
          source: centerNodeId,
          target: targetGridId
        });
        traverse(cell.linkedGridId, depth + 1);
      } else {
        // This is just a leaf node with some text
        const leafNodeId = cell.id;
        nodes.push({
          id: leafNodeId,
          name: cell.text,
          val: 1, // leaf is small
          color: 'var(--text-muted)'
        });
        links.push({
          source: centerNodeId,
          target: leafNodeId
        });
      }
    });
  };

  traverse(rootGridId, 0);

  return { nodes, links };
};
