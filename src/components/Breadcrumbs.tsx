import React from 'react';
import { BreadcrumbItem } from '../types';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (depth: number) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 p-4 bg-white shadow-sm w-full top-0 z-10 sticky overflow-x-auto whitespace-nowrap">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={item.gridId + index}>
            <button
              onClick={() => !isLast && onNavigate(index)}
              className={`flex items-center text-sm font-medium transition-colors ${
                isLast ? 'text-textDefault cursor-default' : 'text-primary hover:text-blue-700 cursor-pointer'
              }`}
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.text || '名称未設定'}
            </button>
            {!isLast && <ChevronRight className="w-4 h-4 text-textSecondary flex-shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
