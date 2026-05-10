import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { BarChart3, Search, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { stegoService } from '../services/api';
import { GlassCard, Button } from '../components/UI';

const Steganalysis = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp'] },
    multiple: false
  });

  const handleAnalyze = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await stegoService.analyze(formData);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (hist) => {
    if (!hist) return [];
    return hist.r.map((val, i) => ({
      index: i,
      red: val,
      green: hist.g[i],
      blue: hist.b[i],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Stego Analysis</h1>
        <p className="text-gray-400">Detect potential hidden data using statistical analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
          >
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="Target" className="w-full h-auto rounded-xl" />
            ) : (
              <Search className="w-12 h-12 text-primary mx-auto mb-4" />
            )}
            <p className="text-sm text-gray-500 mt-4">Upload suspicious image</p>
          </div>

          <Button onClick={handleAnalyze} className="w-full" disabled={loading || !file}>
            {loading ? 'Running Scan...' : 'Start Deep Analysis'}
          </Button>

          {result && (
            <GlassCard className={`border-2 ${result.suspicious ? 'border-red-500/50' : 'border-green-500/50'}`}>
              <div className="flex items-center space-x-3 mb-4">
                {result.suspicious ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                )}
                <h3 className="text-xl font-bold">
                  {result.suspicious ? 'Suspicious' : 'Safe Image'}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Entropy Score</span>
                  <span className="font-mono text-primary">{result.entropy}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${result.suspicious ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${(result.entropy / 8) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 italic">
                  *Entropy values close to 8.0 bits/pixel indicate high randomness, often suggesting encrypted data embedding.
                </p>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="h-[500px] flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Color Channel Distribution (Histogram)</span>
            </h3>
            <div className="flex-1 w-full">
              {result ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData(result.histogram)}>
                    <defs>
                      <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="index" stroke="#94a3b8" fontSize={12} tickCount={8} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="red" stroke="#ef4444" fillOpacity={1} fill="url(#colorRed)" strokeWidth={2} />
                    <Area type="monotone" dataKey="green" stroke="#22c55e" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={2} />
                    <Area type="monotone" dataKey="blue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBlue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">
                  Select an image to see data distribution
                </div>
              )}
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h4 className="font-bold mb-2 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-secondary" />
                <span>Noise Profile</span>
              </h4>
              <p className="text-sm text-gray-400">Analysis of high-frequency components to detect anomalies in pixel intensity variations.</p>
            </GlassCard>
            <GlassCard>
              <h4 className="font-bold mb-2 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-neon-green" />
                <span>LSB Bitmask</span>
              </h4>
              <p className="text-sm text-gray-400">Visual mapping of least significant bits to identify patterned or non-natural distributions.</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Steganalysis;
