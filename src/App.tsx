import { useState } from 'react';
import { useMandalaStore } from './hooks/useMandalaStore';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MandalaGrid } from './components/MandalaGrid';
import { Sidebar } from './components/Sidebar';
import { X, Link as LinkIcon } from 'lucide-react';

function App() {
  const {
    appState,
    activePath,
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
    unlinkGridFromCell
  } = useMandalaStore();

  const [linkMenuTargetCell, setLinkMenuTargetCell] = useState<number | null>(null);

  if (!appState || !currentGrid) {
    return <div className="flex h-screen items-center justify-center bg-secondary">Loading...</div>;
  }

  const activeRootId = activePath.length > 0 ? activePath[0] : null;

  const handlePromoteCell = (index: number) => {
    let targetId = currentGrid[index].linkedGridId;
    if (!targetId) {
      // If no grid attached yet, just drill down to create it, then promote
      drillDown(index);
      // Wait for state to update: Actually simpler to just not allow promotion of empty, 
      // but drillDown creates and immediately navigates. Let's just create it directly or alert.
      alert('先にこの要素を一度掘り下げてから「独立」させてください。');
      return;
    }
    promoteToRoot(targetId);
    alert('このチャートをサイドバーに独立させました！');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary selection:bg-blue-100">
      <Sidebar 
        appState={appState}
        activeRootId={activeRootId}
        onSwitch={switchRootChart}
        onCreate={createNewRootChart}
        onDelete={deleteRootChart}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={gotoBreadcrumb} />
        
        <main className="flex-1 overflow-y-auto flex flex-col items-center p-4 md:p-8 pt-16 md:pt-8 w-full max-w-5xl mx-auto">
          {/* Header Area */}
          <div className="w-full text-center mb-6 md:mb-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-500 tracking-tight">
              {breadcrumbs[breadcrumbs.length - 1]?.text || '名称未設定'}
            </h2>
            <p className="text-textSecondary text-sm font-medium">
              {activePath.length <= 1 
                ? "中央にメインテーマ、周囲に8つの構成要素を入力します。" 
                : "周囲の要素を深堀りしてさらに具体化できます。"}
            </p>
          </div>

          <div className="w-full max-w-[800px] flex-1 flex flex-col justify-center pb-12">
            <MandalaGrid
              gridData={currentGrid}
              onCellChange={(index, text) => updateCell(activePath[activePath.length - 1], index, text)}
              onCenterChange={(text) => updateCenterCell(activePath[activePath.length - 1], text)}
              onDrillDown={drillDown}
              onPromoteCell={handlePromoteCell}
              onOpenLinkMenu={(index) => setLinkMenuTargetCell(index)}
              onUnlinkCell={unlinkGridFromCell}
              pathLength={activePath.length}
            />
          </div>
        </main>
      </div>

      {/* Link Selection Modal */}
      {linkMenuTargetCell !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                紐付けるチャートを選択
              </h3>
              <button onClick={() => setLinkMenuTargetCell(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {appState.rootGridIds.map(id => {
                const title = appState.grids[id]?.[4]?.text || "名称未設定のチャート";
                // Prevent linking to the exact same current grid to avoid immediate infinite loops
                const isCurrentGrid = id === activePath[activePath.length - 1];
                
                return (
                  <button
                    key={id}
                    disabled={isCurrentGrid}
                    onClick={() => {
                      linkGridToCell(linkMenuTargetCell, id);
                      setLinkMenuTargetCell(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      isCurrentGrid 
                        ? 'opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed' 
                        : 'bg-white border-border hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm'
                    }`}
                  >
                    <span className="font-medium text-gray-800 block truncate">{title}</span>
                    <span className="text-xs text-gray-500 mt-0.5 block truncate">ID: {id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
