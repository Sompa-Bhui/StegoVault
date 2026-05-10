import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Shield, Settings, Check, Download, AlertCircle, Eye } from 'lucide-react';
import { stegoService, BASE_URL } from '../services/api';
import { GlassCard, Button, Input } from '../components/UI';

const Encode = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [secretText, setSecretText] = useState('');
  const [password, setPassword] = useState('');
  const [algorithm, setAlgorithm] = useState('lsb');
  const [encrypt, setEncrypt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setStep(2);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp'] },
    multiple: false
  });

  const handleEncode = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('secret_text', secretText);
    formData.append('password', password);
    formData.append('algorithm', algorithm);
    formData.append('encrypt', encrypt);

    try {
      const data = await stegoService.encode(formData);
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Encoding failed. Image may be too small for this secret.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Encode Secret</h1>
        <p className="text-gray-400">Embed your encrypted message into a carrier image.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-12 space-x-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,210,255,0.5)]' : 'bg-white/5 text-gray-500 border border-white/10'
            }`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-white/5'}`}></div>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Carrier Image</h3>
              <p className="text-gray-500">Drag & drop or click to browse. Supports PNG, JPG, BMP.</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <GlassCard className="space-y-6">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Configuration</span>
              </h3>
              
              <div className="space-y-4">
                <Input 
                  label="Secret Message"
                  placeholder="Type your hidden message here..."
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  multiline="true"
                  rows={4}
                />
                
                <Input 
                  label="Extraction Password"
                  type="password"
                  placeholder="Required for security"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Algorithm</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                  >
                    <option value="lsb">Standard LSB (Fast)</option>
                    <option value="random_lsb">Randomized LSB (Secure)</option>
                    <option value="adaptive">Adaptive (Invisible)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <input 
                    type="checkbox" 
                    id="encrypt" 
                    checked={encrypt} 
                    onChange={(e) => setEncrypt(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                  />
                  <label htmlFor="encrypt" className="text-sm text-gray-300 select-none">Enable AES-256 Encryption</label>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleEncode} className="flex-2" disabled={loading || !secretText || !password}>
                  {loading ? 'Processing...' : 'Run Encoding'}
                </Button>
              </div>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm font-medium">Original Preview</span>
                  <span className="text-xs text-gray-500">{file?.name}</span>
                </div>
                <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-contain bg-black/50" />
              </GlassCard>
              
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-sm text-primary/80">
                  Your data will be encrypted with your password before being embedded. 
                  Without the password, the data is mathematically impossible to retrieve.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GlassCard className="p-12 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Encoding Complete</h3>
              <p className="text-gray-400 mb-8">Your secret has been successfully merged into the image.</p>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-500 uppercase mb-1">PSNR</p>
                  <p className="text-xl font-bold text-primary">{result.metrics.psnr} dB</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-500 uppercase mb-1">SSIM</p>
                  <p className="text-xl font-bold text-secondary">{result.metrics.ssim}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <p className="text-xl font-bold text-green-500">Secure</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={`${BASE_URL}/encoded_images/${result.filename}`} download>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Download className="mr-2 w-5 h-5" />
                    Download Encoded Image
                  </Button>
                </a>
                <Button variant="ghost" onClick={() => {
                  setStep(1);
                  setSecretText('');
                  setPassword('');
                  setResult(null);
                }}>Encode Another</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Encode;
