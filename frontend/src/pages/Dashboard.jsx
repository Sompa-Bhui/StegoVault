import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, History, BarChart3, FileImage, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService, BASE_URL } from '../services/api';
import { GlassCard, Button } from '../components/UI';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <GlassCard className="flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </GlassCard>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Scanning Vault...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vanguard Terminal</h1>
          <p className="text-gray-400">Welcome back, Agent. Your vault is secure.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/encode">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Encode Image</span>
            </Button>
          </Link>
          <Link to="/decode">
            <Button variant="secondary" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Extract Secret</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FileImage} 
          title="Total Encoded" 
          value={stats?.total_encoded || 0} 
          color="bg-primary/20 text-primary"
        />
        <StatCard 
          icon={ShieldCheck} 
          title="Extractions" 
          value={stats?.total_decoded || 0} 
          color="bg-secondary/20 text-secondary"
        />
        <StatCard 
          icon={Activity} 
          title="Health Score" 
          value="98%" 
          color="bg-green-500/20 text-green-500"
        />
        <StatCard 
          icon={History} 
          title="Last Active" 
          value={stats?.last_activity ? new Date(stats.last_activity).toLocaleDateString() : 'N/A'} 
          color="bg-orange-500/20 text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Images */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <FileImage className="w-5 h-5 text-primary" />
              <span>Recent Vault Entries</span>
            </h3>
            <Link to="/images" className="text-primary hover:underline text-sm">View all</Link>
          </div>
          
          <div className="space-y-4">
            {stats?.recent_images?.length > 0 ? (
              stats.recent_images.map((img) => (
                <div key={img.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border border-white/10 overflow-hidden">
                      <img 
                        src={`${BASE_URL}/encoded_images/${img.filename}`} 
                        alt="Encoded" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{img.original_name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{img.algorithm} • {new Date(img.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-500 font-mono">PSNR: {img.psnr}dB</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">No entries found. Start by encoding an image.</div>
            )}
          </div>
        </GlassCard>

        {/* Quick Actions / Activity */}
        <div className="space-y-8">
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-secondary" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-3 items-start border-l-2 border-primary/30 pl-4 py-1">
                  <div>
                    <p className="text-sm font-medium">Encoded "secret_plan.png"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <h3 className="text-lg font-bold mb-2">Upgrade Security</h3>
            <p className="text-sm text-gray-400 mb-4">Enable biometric 2FA for enhanced vault protection.</p>
            <Button variant="outline" size="sm" className="w-full">Enable Now</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
