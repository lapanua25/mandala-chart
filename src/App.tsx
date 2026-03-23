
import { useMandalaStore } from './hooks/useMandalaStore';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MandalaGrid } from './components/MandalaGrid';

function App() {
  const {
    currentGrid,
    currentPath,
    breadcrumbs,
    updateCell,
    updateCenterCell,
    drillDown,
    gotoBreadcrumb,
  } = useMandalaStore();

  if (!currentGrid) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={gotoBreadcrumb} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Helper text for user */}
        <p className="text-textSecondary text-sm mb-4 text-center">
          {currentPath.length === 0 
            ? "中央にメインテーマ、周囲に8つの要素を入力します。" 
            : "周囲の要素を入力し、深堀りボタンでさらに細分化できます。"}
        </p>

        <MandalaGrid
          gridData={currentGrid}
          onCellChange={updateCell}
          onCenterChange={updateCenterCell}
          onDrillDown={drillDown}
          pathLength={currentPath.length}
        />
      </main>
    </div>
  );
}

export default App;
