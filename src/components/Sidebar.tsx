import React, { useState } from 'react';
import { AppState } from '../types';
import { Plus, Trash2, Menu, X, LayoutGrid, Download, Upload } from 'lucide-react';

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
        className="md:hidden fixed top-16 left-4 z-40 p-2 bg-secondary border border-border rounded-md shadow-md text-textDefault hover:bg-border transition-colors"
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-textSecondary uppercase tracking-wider ml-2">My Charts</h2>
            <button
              onClick={() => {
                onCreate();
                setIsOpen(false);
              }}
              className="p-1.5 bg-primary hover:bg-primaryHover text-white rounded-lg transition-all shadow-sm"
              title="新規作成"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
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
          <div className="mb-2">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">テーマ</p>
            <div className="space-y-2">
              {[
                { name: 'light', bg: 'bg-[#f0f2f5]', textColor: 'text-gray-800', desc: 'Light' },
                { name: 'dark', bg: 'bg-[#0f172a]', textColor: 'text-white', desc: 'Dark' }
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    document.documentElement.setAttribute('data-theme', theme.name === 'light' ? '' : theme.name);
                    localStorage.setItem('mandala-theme', theme.name);
                  }}
                  className={`w-full py-2.5 px-4 rounded-lg ${theme.bg} ${theme.textColor} border-2 border-border shadow-sm hover:-translate-y-0.5 transition-all font-semibold text-sm`}
                  title={theme.desc}
                >
                  {theme.desc}
                </button>
              ))}
            </div>
          </div>

      <div className="flex flex-col gap-2 mt-4">
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
        </div>
      </aside>
    </>
  );
};
