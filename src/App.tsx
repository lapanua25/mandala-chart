import { useState, useEffect } from 'react';
import { useMandalaStore } from './hooks/useMandalaStore';
import { Sidebar } from './components/Sidebar';
import { NetworkViewerModal } from './components/NetworkViewerModal';
import { TutorialModal } from './components/TutorialModal';
import { X, LayoutGrid, HelpCircle } from 'lucide-react';
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
    switchRootChart
  } = useMandalaStore();

  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');
  useEffect(() => {
    const savedTheme = localStorage.getItem('mandala-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? '' : savedTheme);
    }
  }, []);
  if (!appState || !currentGrid) {
    return <div className="flex h-screen items-center justify-center bg-secondary">Loading...</div>;
  }

  const activeRootId = activePath.length > 0 ? activePath[0] : null;

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
        
        <main className="flex-1 overflow-hidden flex flex-col items-center p-1 sm:p-2 md:p-4 pt-2 sm:pt-3 md:pt-4 w-full max-w-4xl mx-auto">
          {/* Header Area */}
          <div className="w-full text-center mb-1 sm:mb-2 md:mb-3 space-y-0 sm:space-y-1 relative">
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-500 dark:from-gray-200 dark:to-gray-400 tracking-tight line-clamp-1">
              {breadcrumbs[breadcrumbs.length - 1]?.text || '名称未設定'}
            </h2>
            <p className="text-textSecondary text-xs font-medium pr-12 hidden sm:block">
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
                onClick={() => setIsNetworkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors shadow-sm ring-1 ring-primary/20 text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
                全体マップ
              </button>
            </div>
          </div>

          <div className="w-full max-w-[700px] flex-1 flex flex-col justify-center pb-1 sm:pb-2 border-b border-border/10">
            <div className="p-1 sm:p-2 rounded-3xl transition-colors">
              <MandalaGrid
                gridData={currentGrid}
                onCellChange={(index, text) => updateCell(activePath[activePath.length - 1], index, text)}
                onCenterChange={(text) => updateCenterCell(activePath[activePath.length - 1], text)}
                onDrillDown={drillDown}
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

          <footer className="w-full py-2 sm:py-3 text-center space-y-1">
             <div className="flex justify-center gap-3 text-xs sm:text-sm text-textSecondary font-medium">
               <button onClick={() => setIsHowToUseOpen(true)} className="hover:text-primary transition-colors cursor-pointer">How to Use</button>
               <button onClick={() => { setPolicyType('privacy'); setIsPolicyModalOpen(true); }} className="hover:text-primary transition-colors cursor-pointer">Privacy</button>
               <button onClick={() => { setPolicyType('terms'); setIsPolicyModalOpen(true); }} className="hover:text-primary transition-colors cursor-pointer">Terms</button>
             </div>
             <p className="text-[10px] sm:text-xs text-textMuted tracking-widest uppercase">
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
