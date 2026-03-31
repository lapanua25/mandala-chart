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

  const graphData = useMemo(() => generateGraphData(appState, rootGridId), [appState, rootGridId]);

  // Handle Resize
  useEffect(() => {
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
      
      // Wait a moment for any UI states to clear if necessary
      await new Promise(res => setTimeout(res, 100));

      const dataUrl = await toPng(containerRef.current, { 
        cacheBust: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-app').trim() || '#f0f2f5'
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

  // Node drawing with text
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = node.val === 5 ? 16/globalScale : (node.val >= 2 ? 12/globalScale : 10/globalScale);
    ctx.font = `bold ${fontSize}px Sans-Serif`;
    
    // Draw dot
    const isRoot = node.val === 5;
    const size = isRoot ? 6 : (node.val >= 2 ? 4 : 2);
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    
    // Try to parse the CSS variable or fallback. Since canvas can't use var() directly sometimes,
    // we use a trick or map it. The graph data uses 'var(--theme...)', which canvas won't understand.
    // Let's manually map it based on val for now for simplicity.
    if (node.val === 5) ctx.fillStyle = '#ec4899'; // root pink
    else if (node.val >= 2) ctx.fillStyle = '#3b82f6'; // sub blue
    else ctx.fillStyle = '#94a3b8'; // leaf gray
    ctx.fill();

    // Draw text label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Slight shadow for readability
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowColor = "white";
    ctx.shadowBlur = 4;
    ctx.fillText(label, node.x, node.y + size + fontSize);
    
    // Text outline
    ctx.shadowBlur = 0;
    ctx.fillStyle = node.val >= 2 ? '#1e293b' : '#475569';
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
            graphData={graphData}
            nodeCanvasObject={drawNode}
            linkColor={() => 'rgba(156, 163, 175, 0.4)'} // gray border style
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
