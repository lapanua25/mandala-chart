import { useState, useEffect } from 'react';
import { useMandalaStore } from './hooks/useMandalaStore';
import { Sidebar } from './components/Sidebar';
import { NetworkViewerModal } from './components/NetworkViewerModal';
import { X, Link as LinkIcon } from 'lucide-react';
import { generateAISuggestions } from './utils/aiUtils';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MandalaGrid } from './components/MandalaGrid';
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
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mandala-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? '' : savedTheme);
    }
  }, []);

  const handleMagicSuggest = async () => {
    const currentGridId = activePath[activePath.length - 1];
    if (!currentGrid || !currentGridId) return;
    const centerText = currentGrid[4].text;
    if (!centerText) return;

    const apiKey = localStorage.getItem('mandala-gemini-key');
    if (!apiKey) {
      alert('AI機能を利用するには、サイドバー（左上メニュー）からGemini API Keyを設定してください。');
      return;
    }

    try {
      setIsGeneratingAI(true);
      const suggestions = await generateAISuggestions(apiKey, centerText);
      
      // Update the 8 surrounding cells with the new suggestions
      let suggestionIdx = 0;
      for (let i = 0; i < 9; i++) {
        if (i === 4) continue; // skip center
        // Only overwrite empty cells or cells that were just simple placeholders
        if (!currentGrid[i].text || currentGrid[i].text === '') {
          if (suggestions[suggestionIdx]) {
            updateCell(activePath[activePath.length - 1], i, suggestions[suggestionIdx]);
          }
        }
        suggestionIdx++;
      }
    } catch (err: any) {
      alert(`AI提案の取得に失敗しました: ${err.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

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
          <div className="w-full text-center mb-6 md:mb-10 space-y-2 relative">
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-500 tracking-tight">
              {breadcrumbs[breadcrumbs.length - 1]?.text || '名称未設定'}
            </h2>
            <p className="text-textSecondary text-sm font-medium pr-12">
              {activePath.length <= 1 
                ? "中央にメインテーマ、周囲に8つの構成要素を入力します。" 
                : "周囲の要素を深堀りしてさらに具体化できます。"}
            </p>
            
            <button
              onClick={() => setIsNetworkModalOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors hidden md:flex items-center justify-center group shadow-sm ring-1 ring-primary/20"
              title="全体マップを見る"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
            </button>
            <button
              onClick={() => setIsNetworkModalOpen(true)}
              className="mt-3 md:hidden flex mx-auto items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors shadow-sm ring-1 ring-primary/20 text-sm font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
              全体マップを見る
            </button>
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
              onMagicSuggest={handleMagicSuggest}
              isGenerating={isGeneratingAI}
            />
          </div>
        </main>
      </div>

      {/* Link Selection Modal */}
      {linkMenuTargetCell !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary">
              <h3 className="text-lg font-bold text-textDefault flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                紐付けるチャートを選択
              </h3>
              <button onClick={() => setLinkMenuTargetCell(null)} className="p-1 text-textSecondary hover:text-textDefault rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {appState.rootGridIds.map(id => {
                const title = appState.grids[id]?.[4]?.text || "名称未設定のチャート";
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
                        ? 'opacity-50 bg-secondary border-border cursor-not-allowed' 
                        : 'bg-cellBg border-border hover:border-primary hover:bg-primary/5 hover:shadow-sm'
                    }`}
                  >
                    <span className="font-medium text-textDefault block truncate">{title}</span>
                    <span className="text-xs text-textSecondary mt-0.5 block truncate">ID: {id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isNetworkModalOpen && activeRootId && (
        <NetworkViewerModal
          appState={appState}
          rootGridId={activeRootId}
          onClose={() => setIsNetworkModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
