import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, RotateCcw, Play, Palette, Settings, Eraser, Save, Download, Upload } from 'lucide-react';

interface GeneratedResult {
    expression: string;
    answer: string;
    id: string;
}

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

interface DrawingPoint {
    x: number;
    y: number;
}

const COLORS = [
    '#ffffff', '#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff',
    '#ff8844', '#88ff44', '#4488ff', '#ff4488', '#88ff88', '#8888ff'
];

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16];

export default function EnhancedMathCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(4);
    const [isErasing, setIsErasing] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [results, setResults] = useState<GeneratedResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
    const [historyStep, setHistoryStep] = useState(0);
    const [smoothing, setSmoothing] = useState(true);
    const [pressure, setPressure] = useState(1);
    const [lastPoint, setLastPoint] = useState<DrawingPoint | null>(null);

    // Initialize canvases
    useEffect(() => {
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        if (canvas && overlayCanvas) {
            const ctx = canvas.getContext('2d');
            const overlayCtx = overlayCanvas.getContext('2d');
            
            if (ctx && overlayCtx) {
                // Set canvas dimensions
                const updateCanvasSize = () => {
                    const rect = canvas.getBoundingClientRect();
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    overlayCanvas.width = window.innerWidth;
                    overlayCanvas.height = window.innerHeight;
                    
                    // Set drawing context properties
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Dark background
                    ctx.fillStyle = '#0a0a0a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Save initial state
                    saveToHistory();
                };
                
                updateCanvasSize();
                window.addEventListener('resize', updateCanvasSize);
                
                return () => window.removeEventListener('resize', updateCanvasSize);
            }
        }
    }, []);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const newHistory = drawingHistory.slice(0, historyStep + 1);
                newHistory.push(imageData);
                setDrawingHistory(newHistory);
                setHistoryStep(newHistory.length - 1);
            }
        }
    }, [drawingHistory, historyStep]);

    const undo = () => {
        if (historyStep > 0) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx && drawingHistory[historyStep - 1]) {
                    ctx.putImageData(drawingHistory[historyStep - 1], 0, 0);
                    setHistoryStep(historyStep - 1);
                }
            }
        }
    };

    const getEventPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        return { x: 0, y: 0 };
    };

    const drawLine = (ctx: CanvasRenderingContext2D, from: DrawingPoint, to: DrawingPoint, currentPressure = 1) => {
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : color;
        ctx.lineWidth = brushSize * currentPressure;
        
        if (smoothing && lastPoint) {
            // Smooth line drawing using quadratic curves
            const midPoint = {
                x: (lastPoint.x + to.x) / 2,
                y: (lastPoint.y + to.y) / 2
            };
            
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.quadraticCurveTo(from.x, from.y, midPoint.x, midPoint.y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const pos = getEventPos(e);
        
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                setIsDrawing(true);
                setLastPoint(pos);
                
                // Draw a dot for single clicks
                ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
                ctx.fillStyle = isErasing ? 'rgba(0,0,0,1)' : color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const pos = getEventPos(e);
        
        if (canvas && lastPoint) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawLine(ctx, lastPoint, pos, pressure);
                setLastPoint(pos);
            }
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            setLastPoint(null);
            saveToHistory();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                setResults([]);
                setDictOfVars({});
                saveToHistory();
            }
        }
    };

    const removeResult = (id: string) => {
        setResults(results.filter(result => result.id !== id));
    };

    const processDrawing = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsProcessing(true);
        
        try {
            // Convert canvas to base64 image
            const imageData = canvas.toDataURL('image/png');
            
            // Make API call to backend
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    dict_of_vars: dictOfVars
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && result.data && Array.isArray(result.data)) {
                const newResults: GeneratedResult[] = result.data.map((data: Response, index: number) => ({
                    expression: data.expr,
                    answer: data.result.toString(),
                    id: Date.now() + index + ''
                }));
                
                setResults(prev => [...prev, ...newResults]);
                
                // Update variables dictionary
                result.data.forEach((data: Response) => {
                    if (data.assign) {
                        setDictOfVars(prev => ({
                            ...prev,
                            [data.expr]: data.result
                        }));
                    }
                });
            } else {
                throw new Error(result.message || 'Failed to process image');
            }
            
        } catch (error) {
            console.error('Processing failed:', error);
            // Show error to user
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `math-canvas-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const loadImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                clearCanvas();
                                ctx.drawImage(img, 0, 0);
                                saveToHistory();
                            }
                        }
                    };
                    img.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    return (
        <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                    >
                        <RotateCcw size={18} />
                        Clear
                    </button>
                    
                    <button
                        onClick={undo}
                        disabled={historyStep <= 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        Undo
                    </button>
                    
                    <button
                        onClick={() => setIsErasing(!isErasing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                            isErasing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'
                        } text-white`}
                    >
                        <Eraser size={18} />
                        {isErasing ? 'Drawing' : 'Eraser'}
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                    >
                        <Palette size={18} />
                        Color
                    </button>
                    
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                    >
                        <Settings size={18} />
                        Settings
                    </button>
                    
                    <button
                        onClick={saveCanvas}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                    >
                        <Save size={18} />
                        Save
                    </button>
                    
                    <button
                        onClick={loadImage}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
                    >
                        <Upload size={18} />
                        Load
                    </button>
                    
                    <button
                        onClick={processDrawing}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100"
                    >
                        <Play size={18} />
                        {isProcessing ? 'Processing...' : 'Solve'}
                    </button>
                </div>
            </div>

            {/* Color Picker Panel */}
            {showColorPicker && (
                <div className="absolute top-20 right-4 z-30 bg-gray-800/95 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-white font-semibold mb-4">Choose Color</h3>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {COLORS.map((colorOption) => (
                            <button
                                key={colorOption}
                                onClick={() => setColor(colorOption)}
                                className={`w-12 h-12 rounded-xl border-4 transition-all hover:scale-110 ${
                                    color === colorOption ? 'border-white' : 'border-gray-600'
                                }`}
                                style={{ backgroundColor: colorOption }}
                            />
                        ))}
                    </div>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-12 rounded-xl"
                    />
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="absolute top-20 right-4 z-30 bg-gray-800/95 backdrop-blur-md rounded-2xl p-6 border border-gray-700 w-80">
                    <h3 className="text-white font-semibold mb-4">Drawing Settings</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Brush Size: {brushSize}px
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Pressure: {pressure}
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={pressure}
                                onChange={(e) => setPressure(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        
                        <div>
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={smoothing}
                                    onChange={(e) => setSmoothing(e.target.checked)}
                                    className="rounded"
                                />
                                Line Smoothing
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            
            <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Results Panel */}
            {results.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 z-20 max-h-60 overflow-y-auto">
                    <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl p-4 border border-gray-700">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                            Results
                        </h3>
                        <div className="space-y-3">
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between group"
                                >
                                    <div className="text-white">
                                        <div className="text-lg font-mono">
                                            {result.expression} = <span className="text-green-400">{result.answer}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeResult(result.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-2xl p-8 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-white text-lg">Processing your drawing...</p>
                        <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
                    </div>
                </div>
            )}

            {/* Current tool indicator */}
            <div className="absolute bottom-4 right-4 z-20 bg-gray-800/90 backdrop-blur-md rounded-xl p-3 border border-gray-700">
                <div className="flex items-center gap-3 text-white text-sm">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: isErasing ? 'transparent' : color }}
                        />
                        <span>{isErasing ? 'Eraser' : 'Brush'}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-600"></div>
                    <span>{brushSize}px</span>
                </div>
            </div>
        </div>
    );
}