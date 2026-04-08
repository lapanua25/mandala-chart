import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridData } from '../types';
import { Cell } from './Cell';

interface MandalaGridProps {
  gridData: GridData;
  onCellChange: (index: number, text: string) => void;
  onCenterChange: (text: string) => void;
  onDrillDown: (index: number) => void;
  onPromoteCell: (index: number) => void;
  onOpenLinkMenu: (index: number) => void;
  onUnlinkCell: (index: number) => void;
  pathLength: number;
}

export const MandalaGrid: React.FC<MandalaGridProps> = ({ 
  gridData, 
  onCellChange, 
  onCenterChange,
  onDrillDown,
  onPromoteCell,
  onOpenLinkMenu,
  onUnlinkCell,
  pathLength
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto aspect-square p-2 sm:p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathLength}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
          className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2 sm:gap-4 md:gap-5"
        >
          {gridData.map((cell, index) => {
            const isCenter = index === 4;
            return (
              <Cell
                key={`${cell.id}-${index}`}
                data={cell}
                index={index}
                isCenter={isCenter}
                onChange={(text) => isCenter ? onCenterChange(text) : onCellChange(index, text)}
                onDrillDown={() => onDrillDown(index)}
                onPromote={() => onPromoteCell(index)}
                onOpenLinkMenu={() => onOpenLinkMenu(index)}
                onUnlink={() => onUnlinkCell(index)}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
