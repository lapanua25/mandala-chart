import React, { useRef, useEffect, useState } from 'react';
import { CellData } from '../types';
import { Maximize2, Edit3 } from 'lucide-react';

interface CellProps {
  data: CellData;
  index: number;
  isCenter: boolean;
  onChange: (text: string) => void;
  onDrillDown?: () => void;
}

export const Cell: React.FC<CellProps> = ({ data, isCenter, onChange, onDrillDown }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    const textLength = data.text.length;
    if (textLength < 8) setFontSize(24);
    else if (textLength < 25) setFontSize(18);
    else if (textLength < 50) setFontSize(14);
    else setFontSize(12);
  }, [data.text]);

  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDrillDown) onDrillDown();
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center p-2 sm:p-3
        aspect-square rounded-xl transition-all duration-200
        border shadow-sm group
        ${isCenter 
          ? 'bg-blue-50 border-primary/50 shadow-ant z-10 scale-[1.02]' 
          : 'bg-white border-border/80 hover:shadow-ant-hover hover:border-primary/30'}
      `}
    >
      <div className="absolute top-2 right-2 text-border group-hover:text-primary/30 transition-colors pointer-events-none">
        {isCenter ? <Edit3 className="w-4 h-4" /> : null}
      </div>

      <textarea
        ref={textareaRef}
        value={data.text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isCenter ? "メインテーマ" : "要素を入力"}
        className={`
          w-full h-full resize-none bg-transparent outline-none
          text-center flex items-center justify-center
          overflow-hidden focus:ring-0
          ${isCenter ? 'font-bold text-blue-900' : 'text-textDefault'}
        `}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: 1.2,
          display: 'flex',
          alignItems: 'center'
        }}
      />
      
      {!isCenter && onDrillDown && (
        <button
          onClick={handleDrillDown}
          className="absolute bottom-2 right-2 p-2 sm:p-1.5 
                     text-primary bg-blue-50 hover:bg-primary hover:text-white
                     rounded-full transition-all duration-200 shadow-sm
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                     active:scale-95"
          title="このマスを掘り下げる"
        >
          <Maximize2 className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};
