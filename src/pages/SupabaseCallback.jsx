import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function SupabaseCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error during auth callback:', error);
                navigate('/Login?error=' + encodeURIComponent(error.message));
            } else {
                navigate('/');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-800">Completing sign in...</h2>
                <p className="text-slate-500 mt-2">Please wait a moment.</p>
            </motion.div>
        </div>
    );
}
