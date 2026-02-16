import React, { useState, useEffect } from 'react';
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import profileService from './profileService';
import ProfileView from './ProfileView';
import ProfileForm from './ProfileForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const { user: authUser } = useAuth();
    const { socket } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, []);

    // Sync profile user data with auth user for real-time verification/status updates
    useEffect(() => {
        if (profile && authUser) {
            setProfile(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    status: authUser.status,
                    isVerified: authUser.isVerified
                }
            }));
        }
    }, [authUser?.status, authUser?.isVerified]);

    // Handle real-time profile completion updates (calculated on backend)
    useEffect(() => {
        if (!socket) return;

        socket.on('profile:updated', (updatedProfile) => {
            if (updatedProfile.user === authUser?._id) {
                setProfile(prev => ({ ...prev, ...updatedProfile }));
            }
        });

        return () => socket.off('profile:updated');
    }, [socket, authUser?._id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getMyProfile();
            setProfile(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch profile', err);
            if (err.response?.status === 404) {
                setProfile(null);
            } else {
                setError("SYSTEM ERROR: UNABLE TO RETRIEVE PROFILE PROTOCOL");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (profileData) => {
        try {
            const updated = await profileService.upsertProfile(profileData);
            setProfile(updated);
            setIsEditing(false);
        } catch (err) {
            const backendError = err.response?.data?.errors?.join('\n') || err.response?.data?.message || 'Failed to update profile protocol.';
            alert(`PROTOCOL REJECTION:\n${backendError}`);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">Syncing Profile Data</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 glass-card border-red-500/20 bg-red-500/5">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
            <h3 className="text-xl font-black text-white uppercase">{error}</h3>
            <button onClick={fetchProfile} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs">Retry Uplink</button>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-700">
            <AnimatePresence mode="wait">
                {isEditing || !profile ? (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {!profile && (
                            <div className="max-w-5xl mx-auto mb-12 p-10 glass-card border-amber-500/20 bg-amber-500/5">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Initialize Career Node</h2>
                                <p className="text-slate-400 font-medium italic">Welcome to the grid. Your student profile is the core of your professional identity. Complete the protocol below to enable internship matching and project recruitment.</p>
                            </div>
                        )}
                        <ProfileForm
                            initialData={profile || { user: authUser }}
                            onSave={handleSaveProfile}
                            onCancel={() => profile ? setIsEditing(false) : null}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
