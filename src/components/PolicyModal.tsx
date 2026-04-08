import React from 'react';
import { X, Shield, ScrollText } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = {
    privacy: {
      title: "プライバシーポリシー",
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      text: (
        <div className="space-y-4">
          <p>当アプリ（以下「本サービス」）におけるプライバシーポリシーを以下の通り定めます。</p>
          <section>
            <h4 className="font-bold text-gray-800">1. データの保存について</h4>
            <p>本サービスで入力されたマンダラチャートのデータは、ユーザーのブラウザ（Local Storage）にのみ保存されます。サーバー側に送信・保存されることはありません。</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800">2. Google AdSenseの使用</h4>
            <p>本サービスでは、Googleによる広告サービス「Google AdSense」を利用しています。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。</p>
          </section>

        </div>
      )
    },
    terms: {
      title: "利用規約",
      icon: <ScrollText className="w-6 h-6 text-indigo-500" />,
      text: (
        <div className="space-y-4">
          <p>本サービスの利用にあたり、以下の規約に同意したものとみなします。</p>
          <section>
            <h4 className="font-bold text-gray-800">1. 免責事項</h4>
            <p>本サービスを利用したことによって生じた不利益や損害について、開発者は一切の責任を負いません。</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800">2. 禁止事項</h4>
            <p>公序良俗に反する行為、本サービスの運営を妨害する行為を禁止します。</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800">3. サービスの中断・変更</h4>
            <p>本サービスは予告なく内容の変更、または提供を中止することがあります。</p>
          </section>
        </div>
      )
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col relative">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            {active.icon}
            <h3 className="text-lg font-bold text-gray-900">{active.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed">
          {active.text}
          <button 
            onClick={onClose}
            className="w-full mt-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
