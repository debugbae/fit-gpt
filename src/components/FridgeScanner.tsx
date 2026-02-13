
import React, { useState, useRef, useEffect } from 'react';
import { analyzeFridgeImage } from '../services/geminiService';
import { InventoryItem } from '../types';

interface FridgeScannerProps {
  onAddItems: (items: InventoryItem[]) => void;
  onCancel: () => void;
}

const FridgeScanner: React.FC<FridgeScannerProps> = ({ onAddItems, onCancel }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Partial<InventoryItem>[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setError("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(data);
        stopCamera();
        
        setIsAnalyzing(true);
        try {
          const base64 = data.split(',')[1];
          const found = await analyzeFridgeImage(base64);
          setResults(found);
        } catch (err) {
          setError("Analysis failed.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const handleConfirm = () => {
    const finalItems = results.map(r => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9),
    })) as InventoryItem[];
    onAddItems(finalItems);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Stock Auditor</h2>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-800 shadow-2xl border border-zinc-700">
        {!photo ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <button onClick={capture} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-600 rounded-full border-4 border-zinc-900 shadow-2xl flex items-center justify-center">
              <i className="fas fa-camera text-white text-2xl"></i>
            </button>
          </>
        ) : (
          <img src={photo} alt="Fridge scan" className="w-full h-full object-cover" />
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold">Auditing Inventory...</p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-zinc-800 rounded-3xl p-6 border border-zinc-700 space-y-4 max-h-[40vh] overflow-y-auto">
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Identified Items</h3>
          <div className="space-y-2">
            {results.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                <span className="text-sm font-bold text-zinc-200">{item.name}</span>
                <span className="text-[10px] font-black text-zinc-500 uppercase">{item.category}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleConfirm}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Add All to Kitchen
          </button>
        </div>
      )}
    </div>
  );
};

export default FridgeScanner;
