import React, { useState } from 'react';
import { AppState } from '../types';
import { Plus, Trash2, Menu, X, LayoutGrid, Download, Upload, Sparkles } from 'lucide-react';

interface SidebarProps {
  appState: AppState;
  activeRootId: string | null;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appState,
  activeRootId,
  onSwitch,
  onCreate,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the title for each root grid
  const getGridTitle = (gridId: string) => {
    const grid = appState.grids[gridId];
    if (grid && grid[4] && grid[4].text) {
      return grid[4].text;
    }
    return "名称未設定のチャート";
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-textDefault"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-sidebarBg backdrop-blur-md border-r border-border shadow-ant
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 pb-4 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2 text-textDefault">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Mandala
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h2 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-4 ml-2">My Charts</h2>
          
          {appState.rootGridIds.map((id) => {
            const isActive = id === activeRootId;
            return (
              <div 
                key={id}
                className={`
                  group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'hover:bg-secondary text-textDefault hover:text-blue-600'}
                `}
                onClick={() => {
                  onSwitch(id);
                  setIsOpen(false);
                }}
              >
                <span className="truncate flex-1 text-sm font-medium">
                  {getGridTitle(id)}
                </span>
                
                {appState.rootGridIds.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('このチャートを削除しますか？')) {
                        onDelete(id);
                      }
                    }}
                    className={`
                      p-1.5 rounded-lg text-textSecondary hover:text-red-500 hover:bg-red-50 transition-colors
                      ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2 bg-secondary p-1 rounded-xl">
            {['light', 'dark', 'sakura', 'mint'].map((themeName) => {
              const bgClass = 
                themeName === 'light' ? 'bg-[#f0f2f5]' :
                themeName === 'dark' ? 'bg-[#0f172a]' :
                themeName === 'sakura' ? 'bg-[#fdf2f8]' :
                'bg-[#f0fdf4]';
              return (
                <button
                  key={themeName}
                  onClick={() => {
                    document.documentElement.setAttribute('data-theme', themeName === 'light' ? '' : themeName);
                    localStorage.setItem('mandala-theme', themeName);
                  }}
                  className={`w-1/4 aspect-square rounded-lg ${bgClass} border border-border shadow-sm hover:-translate-y-0.5 transition-transform`}
                  title={themeName}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 mb-2">
              <label className="text-xs font-bold text-primary flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3" />
                Gemini AI 設定
              </label>
              {import.meta.env.VITE_SHARED_GEMINI_KEY ? (
                <p className="text-[10px] text-green-600 mb-2 leading-tight flex items-center gap-1 font-medium italic">
                  <span>✅</span> 共有枠が利用可能です。自分のキーを使う場合は以下に入力してください。
                </p>
              ) : (
                <p className="text-[10px] text-textSecondary mb-2 leading-tight">
                  AI提案機能に必要です。Google AI Studioでキーを**無料で**取得して貼り付けてください。
                </p>
              )}
              <input
                type="password"
                placeholder={import.meta.env.VITE_SHARED_GEMINI_KEY ? "個人用キーで上書き (任意)" : "AIキーを入力してEnter"}
                className="w-full text-xs p-2 rounded-lg border border-border bg-white text-textDefault focus:ring-1 focus:ring-primary outline-none"
                defaultValue={localStorage.getItem('mandala-gemini-key') || ''}
                onBlur={(e) => {
                  localStorage.setItem('mandala-gemini-key', e.target.value.trim());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    localStorage.setItem('mandala-gemini-key', e.currentTarget.value.trim());
                    e.currentTarget.blur();
                    alert('AI設定を保存しました。');
                  }
                }}
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline mt-1.5 block font-semibold flex items-center gap-1">
                👉 キーを無料で取得する
              </a>
            </div>

            <button
              onClick={() => {
                const dataStr = JSON.stringify(appState, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.download = `mandala-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.href = url;
                link.click();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-textSecondary hover:text-textDefault hover:bg-border/50 rounded-xl font-medium transition-all text-sm"
              title="データを保存（書き出し）"
            >
              <Download className="w-4 h-4" />
              バックアップを保存
            </button>

            <label className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-textSecondary hover:text-textDefault hover:bg-border/50 rounded-xl font-medium transition-all cursor-pointer text-sm" title="データを読み込む">
              <Upload className="w-4 h-4" />
              データを読み込む
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const data = JSON.parse(ev.target?.result as string);
                      if (data && data.grids && data.rootGridIds) {
                        if (window.confirm('現在のデータは上書きされます。よろしいですか？')) {
                          localStorage.setItem('mandala-data', JSON.stringify(data));
                          window.location.reload();
                        }
                      } else {
                        alert('無効なデータファイルです。');
                      }
                    } catch (err) {
                      alert('ファイルの読み込みに失敗しました。');
                    }
                  };
                  reader.readAsText(file);
                }} 
              />
            </label>
          </div>

          <div className="w-full h-px bg-border my-2 max-w-[80%] mx-auto" />

          <button
            onClick={() => {
              onCreate();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primaryHover text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            新規作成
          </button>
        </div>
      </aside>
    </>
  );
};
