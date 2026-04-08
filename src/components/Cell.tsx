import React, { useRef, useEffect, useState } from 'react';
import { CellData } from '../types';
import { Edit3, MoreHorizontal, Link as LinkIcon, Unlink, ArrowUpRight } from 'lucide-react';
import { useOnClickOutside } from 'usehooks-ts';

interface CellProps {
  data: CellData;
  index: number;
  isCenter: boolean;
  onChange: (text: string) => void;
  onDrillDown?: () => void;
  onPromote?: () => void;
  onOpenLinkMenu?: () => void;
  onUnlink?: () => void;
  onMagicSuggest?: () => void;
  isGenerating?: boolean;
}

export const Cell: React.FC<CellProps> = ({ 
  data, isCenter, onChange, onDrillDown, onPromote, onOpenLinkMenu, onUnlink, onMagicSuggest, isGenerating 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(20);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const textLength = data.text.length;
    if (textLength < 8) setFontSize(20);
    else if (textLength < 25) setFontSize(16);
    else if (textLength < 50) setFontSize(13);
    else setFontSize(11);
  }, [data.text]);

  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDrillDown) onDrillDown();
  };

  const isLinked = !!data.linkedGridId;

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center p-2 md:p-3
        aspect-square rounded-2xl transition-all duration-300
        group cursor-text outline-none
        ${isCenter 
          ? `bg-cellCenterStart border-2 border-cellCenterBorder shadow-md scale-[1.03] hover:shadow-lg ${isMenuOpen ? 'z-50' : 'z-10'}` 
          : `bg-cellBg backdrop-blur-md border border-border shadow-ant hover:shadow-ant-hover hover:-translate-y-0.5 hover:border-primary ${isMenuOpen ? 'z-50' : 'z-0'}`}
      `}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        textareaRef.current?.focus();
      }}
    >
      <div className="absolute top-2 right-2 text-border group-hover:text-primary transition-colors pointer-events-none">
        {isCenter && !isGenerating ? <Edit3 className="w-4 h-4" /> : null}
      </div>

      <textarea
        ref={textareaRef}
        value={data.text}
        onChange={(e) => {
          onChange(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        rows={1}
        placeholder={isCenter ? "メインテーマ" : "要素を入力"}
        className={`
          w-full resize-none bg-transparent outline-none
          text-center font-medium tracking-wide
          overflow-hidden focus:ring-0 whitespace-pre-wrap
          ${isCenter ? 'font-bold bg-clip-text text-transparent opacity-100 mix-blend-normal py-1' : 'text-textDefault py-0.5'}
          ${isGenerating ? 'animate-pulse opacity-50' : ''}
        `}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: 1.25,
          maxHeight: '100%',
          wordBreak: 'break-all',
          overflowWrap: 'break-word',
          WebkitTextFillColor: isCenter && data.text ? 'transparent' : 'initial',
          backgroundImage: isCenter ? 'var(--center-text-start)' : 'none',
          backgroundColor: isCenter ? 'var(--center-text-solid)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          marginTop: 'auto',
          marginBottom: 'auto'
        }}
      />
      
      {/* Magic Suggest AI Button */}
      {isCenter && data.text && onMagicSuggest && (
        <button
          onClick={(e) => { e.stopPropagation(); onMagicSuggest(); }}
          disabled={isGenerating}
          className={`
            absolute bottom-2 right-2 p-1.5 md:p-2 
            rounded-full transition-all duration-300 shadow-sm z-20
            ${isGenerating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:scale-110 active:scale-95'}
          `}
          title="AIに周りのマスを考えてもらう✨"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
        </button>
      )}
      
      {/* Drill down button */}
      {!isCenter && onDrillDown && (
        <button
          onClick={handleDrillDown}
          className={`
            absolute bottom-2 right-2 p-1.5 md:p-1.5 
            rounded-full transition-all duration-300 shadow-sm z-10
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            active:scale-95
            ${isLinked 
              ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white ring-1 ring-primary/30' 
              : 'bg-cellBg text-primary hover:bg-primary hover:text-white border border-primary/20'}
          `}
          title={isLinked ? "リンク先のチャートを開く" : "この要素を深堀りする"}
        >
          {isLinked ? (
            <LinkIcon className="w-5 h-5 md:w-4 md:h-4" />
          ) : (
            <ArrowUpRight className="w-5 h-5 md:w-4 md:h-4" />
          )}
        </button>
      )}

      {/* Action Menu (Link/Promote) */}
      {!isCenter && (
        <div className="absolute top-2 left-2 z-20" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-md text-textSecondary hover:text-primary hover:bg-blue-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <MoreHorizontal className="w-5 h-5 md:w-4 md:h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-border/50 py-1 overflow-hidden">
              <button 
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                onClick={() => { setIsMenuOpen(false); onPromote && onPromote(); }}
              >
                <ArrowUpRight className="w-4 h-4" />
                独立したチャートにする
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                onClick={() => { setIsMenuOpen(false); onOpenLinkMenu && onOpenLinkMenu(); }}
              >
                <LinkIcon className="w-4 h-4" />
                既存チャートを紐付ける
              </button>
              {isLinked && (
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => { setIsMenuOpen(false); onUnlink && onUnlink(); }}
                >
                  <Unlink className="w-4 h-4" />
                  紐付けを解除
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Linked indicator dot on mobile / desktop */}
      {!isCenter && isLinked && (
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-primary shadow-sm pointer-events-none" title="リンク先あり" />
      )}
    </div>
  );
};
