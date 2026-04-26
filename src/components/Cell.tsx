import React, { useRef, useEffect, useState } from 'react';
import { CellData } from '../types';
import { Edit3, Link as LinkIcon, ArrowUpRight } from 'lucide-react';
import { useOnClickOutside } from 'usehooks-ts';

interface CellProps {
  data: CellData;
  index: number;
  isCenter: boolean;
  onChange: (text: string) => void;
  onDrillDown?: () => void;
}

export const Cell: React.FC<CellProps> = ({
  data, isCenter, onChange, onDrillDown
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(20);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const textLength = data.text.length;
    if (textLength < 6) setFontSize(isCenter ? 16 : 14);
    else if (textLength < 12) setFontSize(isCenter ? 14 : 12);
    else if (textLength < 25) setFontSize(isCenter ? 12 : 11);
    else if (textLength < 50) setFontSize(isCenter ? 11 : 10);
    else setFontSize(isCenter ? 10 : 9);
  }, [data.text, isCenter]);

  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDrillDown) onDrillDown();
  };

  const isLinked = !!data.linkedGridId;

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center p-1 sm:p-1.5 md:p-3
        aspect-square rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300
        group cursor-text outline-none overflow-hidden
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
        {isCenter ? <Edit3 className="w-4 h-4" /> : null}
      </div>


      {/* Placeholder label - only show when empty */}
      {!data.text && (
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            pointer-events-none text-center font-medium tracking-wide px-2
            ${isCenter ? 'font-bold' : 'text-textSecondary'}
          `}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.4'
          }}
        >
          {isCenter ? "メインテーマ" : "要素を入力"}
        </div>
      )}

      <div
        ref={textareaRef as any}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          onChange(e.currentTarget.textContent || '');
        }}
        onBlur={(e) => {
          // Ensure the div still displays placeholder text if empty
          if (!e.currentTarget.textContent?.trim()) {
            e.currentTarget.textContent = '';
          }
        }}
        className={`
          w-full h-full resize-none bg-transparent outline-none
          text-center font-medium tracking-wide
          focus:ring-0
          ${isCenter ? 'font-bold bg-clip-text text-transparent opacity-100 mix-blend-normal' : 'text-textDefault'}
        `}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.4',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          textAlign: 'center',
          WebkitTextFillColor: isCenter && data.text ? 'transparent' : 'initial',
          backgroundImage: isCenter ? 'var(--center-text-start)' : 'none',
          backgroundColor: 'transparent',
          padding: '0',
          margin: '0',
          border: 'none',
          display: 'grid',
          placeItems: 'center',
          minHeight: '100%'
        }}
      >
        {data.text}
      </div>
      
      
      {/* Drill down button */}
      {!isCenter && onDrillDown && (
        <button
          onClick={handleDrillDown}
          className={`
            absolute bottom-1.5 right-1.5 p-1 md:p-0.5
            rounded-lg transition-all duration-300 shadow-sm z-10
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            active:scale-95
            ${isLinked
              ? 'bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/30'
              : 'bg-secondary/50 text-textSecondary hover:bg-primary hover:text-white'}
          `}
          title={isLinked ? "リンク先のチャートを開く" : "この要素を深堀りする"}
        >
          {isLinked ? (
            <LinkIcon className="w-3.5 h-3.5 md:w-3 md:h-3" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 md:w-3 md:h-3" />
          )}
        </button>
      )}


      {/* Linked indicator dot on mobile / desktop */}
      {!isCenter && isLinked && (
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-primary shadow-sm pointer-events-none" title="リンク先あり" />
      )}
    </div>
  );
};
