import { useState, useEffect, useRef } from 'react';
import { useMandalaStore } from './hooks/useMandalaStore';
import { Sidebar } from './components/Sidebar';
import { NetworkViewerModal } from './components/NetworkViewerModal';
import { TutorialModal } from './components/TutorialModal';
import { X, Link as LinkIcon, LayoutGrid, Download, Camera, HelpCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MandalaGrid } from './components/MandalaGrid';
import { AdSense } from './components/AdSense';
import { PolicyModal } from './components/PolicyModal';
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
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');
  const [isDownloading, setIsDownloading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('mandala-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? '' : savedTheme);
    }
  }, []);
  const handleDownloadGrid = async () => {
    if (!gridRef.current) return;
    try {
      setIsDownloading(true);
      // Wait a moment for any popovers/menus to close if needed
      await new Promise(res => setTimeout(res, 100));
      
      const dataUrl = await toPng(gridRef.current, {
        cacheBust: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-app').trim() || '#f0f2f5',
        style: {
          padding: '20px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `mandala-chart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export grid image', err);
      alert('画像の保存に失敗しました。');
    } finally {
      setIsDownloading(false);
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
        
        <main className="flex-1 overflow-hidden flex flex-col items-center p-2 sm:p-4 md:p-8 pt-12 sm:pt-14 md:pt-8 w-full max-w-5xl mx-auto">
          {/* Header Area */}
          <div className="w-full text-center mb-2 sm:mb-4 md:mb-6 space-y-1 sm:space-y-2 relative">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-500 tracking-tight line-clamp-1">
              {breadcrumbs[breadcrumbs.length - 1]?.text || '名称未設定'}
            </h2>
            <p className="text-textSecondary text-xs sm:text-sm font-medium pr-12 hidden sm:block">
              {activePath.length <= 1
                ? "中央にメインテーマ、周囲に8つの構成要素を入力します。"
                : "周囲の要素を深堀りしてさらに具体化できます。"}
            </p>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-all hidden md:flex items-center justify-center shadow-sm ring-1 ring-blue-200"
                title="使い方ガイド"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadGrid}
                disabled={isDownloading}
                className="p-2.5 bg-white text-gray-700 hover:text-primary rounded-full transition-all hidden md:flex items-center justify-center group shadow-sm ring-1 ring-border shadow-md active:scale-95 disabled:opacity-50"
                title="チャートを画像で保存"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsNetworkModalOpen(true)}
                className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors hidden md:flex items-center justify-center group shadow-sm ring-1 ring-primary/20"
                title="全体マップを見る"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
              </button>
            </div>

            <div className="mt-4 md:hidden flex justify-center gap-3">
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors shadow-sm ring-1 ring-blue-200 text-sm font-semibold"
              >
                <HelpCircle className="w-4 h-4" />
                ガイド
              </button>
              <button
                onClick={handleDownloadGrid}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:text-primary rounded-full transition-colors shadow-md ring-1 ring-border text-sm font-semibold active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                画像を保存
              </button>
              <button
                onClick={() => setIsNetworkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors shadow-sm ring-1 ring-primary/20 text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
                全体マップ
              </button>
            </div>
          </div>

          <div className="w-full max-w-[800px] flex-1 flex flex-col justify-center pb-8 border-b border-border/10">
            <div ref={gridRef} className="p-2 sm:p-4 rounded-3xl transition-colors">
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

            {/* AdSense Placement at the bottom of the grid */}
            <AdSense 
              client="ca-pub-XXXXXXXXXXXXXXXX" 
              slot="XXXXXXXXXX" 
              className="mt-12"
            />
          </div>

          <footer className="w-full py-12 text-center space-y-4">
             <div className="flex justify-center gap-6 text-sm text-textSecondary font-medium">
               <button onClick={() => setIsHowToUseOpen(true)} className="hover:text-primary transition-colors cursor-pointer">How to Use</button>
               <button onClick={() => { setPolicyType('privacy'); setIsPolicyModalOpen(true); }} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>
               <button onClick={() => { setPolicyType('terms'); setIsPolicyModalOpen(true); }} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</button>
             </div>
             <p className="text-xs text-textMuted tracking-widest uppercase">
               © 2024 Mandala Chart
             </p>
          </footer>
        </main>
      </div>

      {/* How to Use Modal */}
      {isHowToUseOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <button 
              onClick={() => setIsHowToUseOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 overflow-y-auto">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                <LayoutGrid className="w-8 h-8 text-primary" />
                How to Use
              </h2>
              <div className="space-y-8 text-gray-600 leading-relaxed">
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</div>
                    マンダラチャートを作成する
                  </h3>
                  <p>
                    中央のマスに「メインテーマ」を入力します。その周りの8マスに、テーマに関連する「要素」や「目標」を書き込んでいきましょう。
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">2</div>
                    さらに深く掘り下げる
                  </h3>
                  <p>
                    各マスの右下にある矢印ボタンをクリックすると、その要素を新しいチャートの「中心」として深掘りできます。パンくずリストを使って、いつでも元の階層に戻れます。
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">3</div>
                    全体像を可視化・保存する
                  </h3>
                  <p>
                    画面上部の「全体マップ」から、チャートの繋がりをハプロタイプネットワーク風に表示できます。画像として保存して、振り返りや共有に活用しましょう。
                  </p>
                </section>
              </div>
              <button 
                onClick={() => setIsHowToUseOpen(false)}
                className="w-full mt-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primaryHover transition-all shadow-lg active:scale-[0.98]"
              >
                分かった！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Selection Modal */}
      {linkMenuTargetCell !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white text-gray-900">
              <h3 className="text-lg font-bold text-textDefault flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                紐付けるチャートを選択
              </h3>
              <button onClick={() => setLinkMenuTargetCell(null)} className="p-1 text-textSecondary hover:text-textDefault rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2 bg-gray-50">
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
                        ? 'opacity-50 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' 
                        : 'bg-white border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-sm text-gray-700'
                    }`}
                  >
                    <span className="font-medium block truncate">{title}</span>
                    <span className="text-[10px] opacity-60 mt-0.5 block truncate italic">ID: {id}</span>
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

      <PolicyModal
        isOpen={isPolicyModalOpen}
        type={policyType}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}

export default App;
