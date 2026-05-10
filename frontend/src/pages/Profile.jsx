import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Settings, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard, Button } from '../components/UI';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center space-x-6 mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center text-3xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-gray-400">Vault Member since {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="space-y-6">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Account Details</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-500">Username</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-500">Email Address</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-500">Account Status</span>
              <span className="text-green-500 font-medium">Verified</span>
            </div>
          </div>

          <Button variant="outline" className="w-full">Edit Profile</Button>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard className="space-y-6">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-secondary" />
              <span>Security Settings</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Off</p>
                </div>
                <Button size="sm" variant="ghost">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Hardware Security Key</p>
                  <p className="text-xs text-gray-500">Not configured</p>
                </div>
                <Button size="sm" variant="ghost">Add</Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="bg-red-500/5 border-red-500/20">
            <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">Once you delete your vault, all encoded image history and activity logs will be permanently erased.</p>
            <Button variant="danger" size="sm">Delete Account</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
