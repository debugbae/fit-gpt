
import React, { useState, useRef, useEffect } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodAnalysis } from '../types';

interface FoodScannerProps {
  onLogMeal: (analysis: FoodAnalysis, photo?: string) => void;
}

const FoodScanner: React.FC<FoodScannerProps> = ({ onLogMeal }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [clarification, setClarification] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError(null);
    setPermissionDenied(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError("Camera access was denied. Please enable it in your browser settings to scan meals.");
      } else {
        setError("Unable to access camera. Please check your connection and permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(data);
        stopCamera();
        runAnalysis(data);
      }
    }
  };

  const runAnalysis = async (imageData: string, userText?: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64 = imageData.split(',')[1];
      const result = await analyzeFoodImage(base64, userText);
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Vision engine failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setAnalysis(null);
    setError(null);
    startCamera();
  };

  const handleClarify = () => {
    if (photo) runAnalysis(photo, clarification);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-zinc-100 px-1 tracking-tight">Lens Assistant</h2>

      <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-800 shadow-2xl border border-zinc-700">
        {!photo ? (
          <>
            {permissionDenied ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700">
                  <i className="fas fa-camera-slash text-zinc-500 text-2xl"></i>
                </div>
                <h3 className="text-zinc-100 font-bold mb-2">Camera Blocked</h3>
                <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
                  FitGPT needs camera access to analyze your meals. Please allow camera permissions in your browser.
                </p>
                <button 
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/40"
                >
                  Request Camera Access
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[20%]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-[1px] border-blue-500/30 rounded-3xl flex items-center justify-center">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-blue-500 absolute top-0 left-0"></div>
                    <div className="w-8 h-8 border-t-2 border-r-2 border-blue-500 absolute top-0 right-0"></div>
                    <div className="w-8 h-8 border-b-2 border-l-2 border-blue-500 absolute bottom-0 left-0"></div>
                    <div className="w-8 h-8 border-b-2 border-r-2 border-blue-500 absolute bottom-0 right-0"></div>
                  </div>
                </div>
                <button 
                  onClick={capture}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-800 active:scale-90 transition-transform shadow-2xl"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40">
                    <div className="w-4 h-4 bg-white/20 rounded-full border border-white/40"></div>
                  </div>
                </button>
              </>
            )}
          </>
        ) : (
          <img src={photo} alt="Food capture" className="w-full h-full object-cover" />
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center">
            <div className="relative w-16 h-16 mb-6">
               <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="font-bold text-xl text-zinc-100 tracking-tight">Deciphering Meal...</p>
            <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">Powered by Gemini Vision</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && !permissionDenied && (
        <div className="p-4 bg-blue-950/20 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center gap-3">
          <i className="fas fa-circle-xmark"></i>
          <span className="text-sm font-bold">{error}</span>
          <button onClick={handleRetake} className="ml-auto font-black uppercase text-[10px] bg-blue-500/20 px-3 py-1.5 rounded-lg">Retry</button>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="bg-zinc-800 rounded-3xl p-6 shadow-xl border border-zinc-700 space-y-5 animate-in fade-in zoom-in-95">
          {analysis.isAmbiguous ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-400">
                <i className="fas fa-sparkles text-xl"></i>
                <h3 className="font-bold text-lg">One detail needed</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">{analysis.ambiguityQuestion}</p>
              
              {analysis.options ? (
                <div className="grid grid-cols-2 gap-2">
                  {analysis.options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setClarification(opt); runAnalysis(photo!, opt); }}
                      className="py-3 px-4 bg-zinc-700 border border-zinc-600 rounded-2xl text-xs font-bold text-zinc-300 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all hover:text-blue-400"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-600"
                    placeholder="Describe item..."
                    value={clarification}
                    onChange={(e) => setClarification(e.target.value)}
                  />
                  <button 
                    onClick={handleClarify}
                    className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-sm font-black shadow-lg shadow-blue-950/40"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Ingredient Insight</span>
                  <h3 className="text-2xl font-black text-zinc-100 leading-none">{analysis.itemName}</h3>
                  <p className="text-zinc-500 text-xs font-bold mt-2 flex items-center gap-1.5">
                    <i className="fas fa-weight-scale text-[10px]"></i>
                    {analysis.portionEstimate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-500 tabular-nums">{analysis.macros.calories}</div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Kcal</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 pt-4 border-t border-zinc-700">
                <SmallMacro val={analysis.macros.protein} label="Protein" unit="g" />
                <SmallMacro val={analysis.macros.carbs} label="Carbs" unit="g" />
                <SmallMacro val={analysis.macros.fats} label="Fats" unit="g" />
                <SmallMacro val={analysis.macros.sodium} label="Sodium" unit="mg" />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleRetake}
                  className="flex-1 py-4 bg-zinc-700 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-zinc-600 hover:text-zinc-300"
                >
                  Discard
                </button>
                <button 
                  onClick={() => onLogMeal(analysis, photo || undefined)}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-950/50 hover:bg-blue-500 transition-all active:scale-90"
                >
                  Confirm Entry
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const SmallMacro: React.FC<{ val: number; label: string; unit: string }> = ({ val, label, unit }) => (
  <div className="text-center p-2.5 rounded-2xl bg-zinc-700/50 border border-zinc-700/80">
    <div className="text-xs font-black text-zinc-100 tabular-nums">{val}{unit}</div>
    <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">{label}</div>
  </div>
);

export default FoodScanner;
