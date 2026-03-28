import React, { useState } from 'react';
import { AppState } from '../types';
import { Plus, Trash2, Menu, X, LayoutGrid } from 'lucide-react';

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
          w-64 bg-white/80 backdrop-blur-md border-r border-border/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 pb-4 border-b border-border/30">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
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

        <div className="p-4 border-t border-border/30">
          <button
            onClick={() => {
              onCreate();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            新規作成
          </button>
        </div>
      </aside>
    </>
  );
};
