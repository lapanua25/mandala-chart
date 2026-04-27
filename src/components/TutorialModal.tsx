import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Array<{
    title: string;
    icon: string;
    content: string;
    visual: string;
  }> = [
    {
      title: 'マンダラ・チャートについて',
      icon: '🎯',
      content: 'マンダラ・チャートは、中央のテーマから8つの関連要素を展開し、各要素をさらに細分化する目標設定ツールです。',
      visual: '中央の大きなマス = メインテーマ\n周囲の8マス = 主要な要素'
    },
    {
      title: '基本操作',
      icon: '✍️',
      content: '1. 中央のマス（メインテーマ）をクリックして大目標を入力\n2. 周囲の8マスに関連する要素を入力\n3. 各要素をクリックすると、その要素を深掘りできます',
      visual: '各マスをタップして入力開始'
    },
    {
      title: '階層を掘り下げる',
      icon: '🔍',
      content: '各マスの右下の矢印ボタンをクリックすると、その要素の詳細チャートが表示されます。階層的に目標を細分化できます。',
      visual: '→ ボタンで次階層へ移動\nパンくずで戻る'
    },
    {
      title: 'データを保存',
      icon: '💾',
      content: 'データは自動的にブラウザに保存されます。「バックアップを保存」でダウンロード、「データを読み込む」でインポート可能です。',
      visual: 'JSON形式で完全バックアップ'
    }
  ];

  const step = steps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary border border-border rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{step.icon}</span>
            <h2 className="text-xl font-bold text-textDefault">{step.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
            title="閉じる"
          >
            <X className="w-5 h-5 text-textSecondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-textDefault leading-relaxed">{step.content}</p>
          <div className="bg-secondary p-4 rounded-xl border border-border">
            <p className="text-sm text-textSecondary whitespace-pre-line font-mono">
              {step.visual}
            </p>
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-textDefault"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>

          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  i === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-textSecondary hover:text-textDefault'
                }`}
                title={s.title}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-textDefault font-medium"
          >
            {currentStep === steps.length - 1 ? '閉じる' : '次へ'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-6 pb-4 text-xs text-textSecondary text-center">
          {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
};
