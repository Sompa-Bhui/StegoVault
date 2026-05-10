import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Zap, Database, Globe } from 'lucide-react';
import { GlassCard } from '../components/UI';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 space-y-24">
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto"
        >
          <Shield className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">The Future of <span className="text-primary">Covert</span> Messaging</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          StegoVault is a next-generation steganography platform designed for journalists, 
          privacy advocates, and anyone needing to hide information in plain sight.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="space-y-4">
          <Lock className="w-8 h-8 text-secondary" />
          <h3 className="text-xl font-bold">End-to-End Encryption</h3>
          <p className="text-gray-400 text-sm">
            Before data is hidden, it's encrypted using AES-256-CBC. Your password acts as the key, 
            ensuring that even if the steganography is detected, the payload remains unreadable.
          </p>
        </GlassCard>
        <GlassCard className="space-y-4">
          <Cpu className="w-8 h-8 text-primary" />
          <h3 className="text-xl font-bold">Smart Algorithms</h3>
          <p className="text-gray-400 text-sm">
            From Standard LSB to Adaptive Edge-based embedding, we use algorithms that minimize 
            visual distortion and maximize data capacity.
          </p>
        </GlassCard>
        <GlassCard className="space-y-4">
          <Zap className="w-8 h-8 text-neon-green" />
          <h3 className="text-xl font-bold">Real-time Metrics</h3>
          <p className="text-gray-400 text-sm">
            Monitor the quality of your stego-images with industry-standard metrics like PSNR 
            (Peak Signal-to-Noise Ratio) and SSIM (Structural Similarity Index).
          </p>
        </GlassCard>
      </div>

      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Technical Specifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Database className="w-5 h-5 text-primary" /></div>
              <div>
                <h4 className="font-bold">Lossless Carriers</h4>
                <p className="text-sm text-gray-400">We primarily use PNG and BMP formats to avoid the "stego-killing" compression artifacts of JPEG.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Globe className="w-5 h-5 text-secondary" /></div>
              <div>
                <h4 className="font-bold">Global Accessibility</h4>
                <p className="text-sm text-gray-400">Our platform is built on FastAPI and React, providing a seamless experience across all modern devices.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 font-mono text-sm">
            <div className="text-primary mb-2">// LSB Embedding Logic</div>
            <div className="text-gray-500">
              pixel[channel] = (pixel[channel] & ~1) | bit;<br/>
              // Randomized Position<br/>
              seed = hash(password);<br/>
              shuffle(pixel_indices, seed);
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
