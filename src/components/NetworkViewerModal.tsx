import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { toPng } from 'html-to-image';
import { X, Download, Maximize } from 'lucide-react';
import { AppState } from '../types';
import { generateGraphData } from '../utils/networkUtils';

interface NetworkViewerModalProps {
  appState: AppState;
  rootGridId: string;
  onClose: () => void;
}

export const NetworkViewerModal: React.FC<NetworkViewerModalProps> = ({ appState, rootGridId, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Theme colors dynamically loaded from CSS variables
  const [themeColors, setThemeColors] = useState({
    bgApp: '#f0f2f5',
    primary: '#1890ff',
    centerText: '#1d4ed8',
    textMain: '#262626',
    textMuted: '#8c8c8c'
  });

  const graphData = useMemo(() => generateGraphData(appState, rootGridId), [appState, rootGridId]);

  // Read Theme Colors and Handle Resize
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setThemeColors({
      bgApp: style.getPropertyValue('--bg-app').trim() || '#f0f2f5',
      primary: style.getPropertyValue('--theme-primary').trim() || '#1890ff',
      centerText: style.getPropertyValue('--center-text-start').trim() || '#1d4ed8',
      textMain: style.getPropertyValue('--text-main').trim() || '#262626',
      textMuted: style.getPropertyValue('--text-muted').trim() || '#8c8c8c',
    });

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Make the graph fit on load
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500); // Wait for nodes to settle
    }
  }, []);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    try {
      setIsCapturing(true);
      await new Promise(res => setTimeout(res, 100)); // wait for UI clear
      
      const dataUrl = await toPng(containerRef.current, { 
        cacheBust: true,
        backgroundColor: themeColors.bgApp
      });
      
      const link = document.createElement('a');
      link.download = `mandala-network-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('画像の保存に失敗しました。');
    } finally {
      setIsCapturing(false);
    }
  };

  // Node drawing with text matching the current theme
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = node.val === 5 ? 16/globalScale : (node.val >= 2 ? 12/globalScale : 10/globalScale);
    ctx.font = `bold ${fontSize}px Sans-Serif`;
    
    // Draw dot
    const isRoot = node.val === 5;
    const size = isRoot ? 6 : (node.val >= 2 ? 4 : 2);
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    
    if (node.val === 5) ctx.fillStyle = themeColors.primary;
    else if (node.val >= 2) ctx.fillStyle = themeColors.centerText;
    else ctx.fillStyle = themeColors.textMuted;
    ctx.fill();

    // Draw text label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Theme-aware shadow for readability (works on dark mode too)
    ctx.fillStyle = themeColors.bgApp;
    ctx.shadowColor = themeColors.bgApp;
    ctx.shadowBlur = Math.max(4, 10/globalScale); // Scale shadow with zoom
    ctx.fillText(label, node.x, node.y + size + fontSize);
    ctx.fillText(label, node.x, node.y + size + fontSize); // draw twice for stronger shadow
    
    // Text core
    ctx.shadowBlur = 0;
    ctx.fillStyle = node.val >= 2 ? themeColors.textMain : themeColors.textMuted;
    ctx.fillText(label, node.x, node.y + size + fontSize);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-md">
      <div className="bg-secondary w-full h-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300 border border-border">
        
        {/* Header Options */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {!isCapturing && (
            <>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-xl shadow-lg transition-transform active:scale-95 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                画像を保存
              </button>
              <button 
                onClick={() => fgRef.current?.zoomToFit(400, 50)}
                className="p-2 bg-white text-gray-700 hover:text-primary rounded-xl shadow-lg transition-transform active:scale-95"
                title="全体をフィット"
              >
                <Maximize className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 bg-white text-red-500 hover:bg-red-50 rounded-xl shadow-lg transition-transform active:scale-95"
                title="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Graph Container */}
        <div ref={containerRef} className="flex-1 w-full h-full bg-secondary overflow-hidden">
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor={themeColors.bgApp}
            graphData={graphData}
            nodeCanvasObject={drawNode}
            linkColor={() => themeColors.textMuted}
            linkWidth={1.5}
            // Add a little repulsive force so things spread nicely
            d3VelocityDecay={0.4}
            d3AlphaDecay={0.02}
            cooldownTicks={100}
          />
        </div>

      </div>
    </div>
  );
};
