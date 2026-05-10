import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, BarChart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, GlassCard } from '../components/UI';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="relative group"
  >
    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
    <GlassCard className="relative h-full">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </GlassCard>
  </motion.div>
);

const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-52">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6">
              SECURE <span className="text-primary glow-text">HIDDEN</span> <br />
              COMMUNICATION
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
              StegoVault uses state-of-the-art steganography and AES-256 encryption 
              to hide your sensitive data inside regular images. Secure, undetectable, and powerful.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">How it Works</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles/Elements background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-primary rounded-full blur-xl"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Unbreakable Security</h2>
            <p className="text-gray-400">Multiple layers of protection for your secrets.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Lock}
              title="AES-256 Encryption"
              description="All data is encrypted with military-grade AES-256 before being embedded in images."
            />
            <FeatureCard 
              icon={Eye}
              title="Undetectable"
              description="Advanced LSB algorithms ensure that hidden data causes no visible change to the image."
            />
            <FeatureCard 
              icon={BarChart}
              title="AI Analysis"
              description="Real-time quality metrics (PSNR, SSIM) and steganalysis to ensure your data stays hidden."
            />
            <FeatureCard 
              icon={Shield}
              title="Self-Custody"
              description="Your passwords never leave your browser. Decryption happens only when you provide the key."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="flex flex-col md:flex-row items-center justify-between p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your data?</h2>
              <p className="text-gray-400 mb-8 md:mb-0">Join thousands of users communicating securely across the globe.</p>
            </div>
            <Link to="/register" className="relative z-10">
              <Button size="lg" variant="secondary">Create Account Now</Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-tighter">STEGOVAULT</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 StegoVault. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
