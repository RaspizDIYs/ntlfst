import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { supabase } from '../api/supabaseClient';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

       void getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithProvider = async (provider) => {
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null); // null — гость
    };

    return (
        <AuthContext.Provider value={{ user, signInWithProvider, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
