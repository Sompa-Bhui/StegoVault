import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, Download, FileText, AlertCircle } from 'lucide-react';
import { stegoService } from '../services/api';
import { GlassCard, Button, Input } from '../components/UI';

const Decode = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState('');
  const [algorithm, setAlgorithm] = useState('lsb');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setSecret(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp'] },
    multiple: false
  });

  const handleDecode = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('password', password);
    formData.append('algorithm', algorithm);
    formData.append('is_encrypted', isEncrypted);

    try {
      const data = await stegoService.decode(formData);
      setSecret(data.secret);
    } catch (err) {
      setError(err.response?.data?.detail || 'Extraction failed. Check password and algorithm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Extract Secret</h1>
        <p className="text-gray-400">Retrieve hidden data from an encoded image.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50'
            } h-64 flex flex-col items-center justify-center`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="Target" className="w-full h-full object-contain rounded-xl" />
            ) : (
              <>
                <Unlock className="w-10 h-10 text-primary mb-4" />
                <p className="text-sm text-gray-500">Click or drag image to decode</p>
              </>
            )}
          </div>

          <GlassCard className="space-y-4">
            <Input 
              label="Extraction Password"
              type="password"
              placeholder="Enter password used during encoding"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Embedding Algorithm</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="lsb">Standard LSB</option>
                <option value="random_lsb">Randomized LSB</option>
                <option value="adaptive">Adaptive</option>
              </select>
            </div>

            <Button onClick={handleDecode} className="w-full" disabled={loading || !file || !password}>
              {loading ? 'Decrypting...' : 'Extract Data'}
            </Button>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {secret ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <GlassCard className="bg-gradient-to-br from-green-500/10 to-primary/10 border-green-500/30 h-full min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      <span>Extracted Secret</span>
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(secret);
                    }}>Copy</Button>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-xl p-4 font-mono text-sm overflow-auto break-all">
                    {secret}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-dashed border-white/5">
                <Lock className="w-16 h-16 text-gray-700 mb-4" />
                <h3 className="text-xl font-bold text-gray-700">Awaiting Extraction</h3>
                <p className="text-gray-800 text-sm max-w-xs mx-auto">Upload an image and provide the correct password to reveal the hidden contents.</p>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Decode;
