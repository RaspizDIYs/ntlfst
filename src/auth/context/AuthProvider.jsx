import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrCreateProfile = async (user) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error?.code === 'PGRST116') {
            const { user_metadata } = user;
            const username = user_metadata?.user_name || user.email;
            const full_name = user_metadata?.full_name || user_metadata?.name || '';

            const { error: insertError } = await supabase.from('profiles').insert({
                id: user.id,
                username,
                avatar_url: user_metadata?.avatar_url,
                full_name,
            });

            if (insertError) {
                console.error('Ошибка создания профиля:', insertError.message);
                return null;
            }

            const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            return newProfile;
        }

        return profile;
    };

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const currentSession = data.session;
                setSession(currentSession);

                if (currentSession?.user) {
                    setUser(currentSession.user);
                    const userProfile = await fetchOrCreateProfile(currentSession.user);
                    setProfile(userProfile);
                }
            } catch (err) {
                console.error('Ошибка при инициализации сессии:', err);
            } finally {
                setLoading(false);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setSession(newSession);

                if (newSession?.user) {
                    setUser(newSession.user);
                    const userProfile = await fetchOrCreateProfile(newSession.user);
                    setProfile(userProfile);
                } else {
                    setUser(null);
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        void init();
        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
