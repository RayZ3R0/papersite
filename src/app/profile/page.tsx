'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text mb-4">Loading profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-alt rounded-xl p-6 border border-border mb-8"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {user.username[0].toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text">{user.username}</h1>
              <p className="text-text-muted">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              
              {/* Basic Stats */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-surface p-3 rounded-lg border border-border">
                  <div className="text-sm text-text-muted">Subjects</div>
                  <div className="text-lg font-semibold text-text">
                    {user.subjects?.length || 0}
                  </div>
                </div>

                <div className="bg-surface p-3 rounded-lg border border-border">
                  <div className="text-sm text-text-muted">Study Schedule</div>
                  <div className="text-lg font-semibold text-text">
                    {user.studyPreferences ? 'Set' : 'Not Set'}
                  </div>
                </div>

                <div className="bg-surface p-3 rounded-lg border border-border">
                  <div className="text-sm text-text-muted">Profile</div>
                  <div className="text-lg font-semibold text-text">
                    {user.subjects?.length ? 'Active' : 'New'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Placeholder */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-alt rounded-xl p-6 border border-border"
        >
          <h2 className="text-xl font-semibold text-text mb-4">Coming Soon</h2>
          <p className="text-text-muted">
            We&apos;re working on bringing you a comprehensive profile dashboard. Stay tuned!
          </p>
        </motion.div>
      </div>
    </div>
  );
}