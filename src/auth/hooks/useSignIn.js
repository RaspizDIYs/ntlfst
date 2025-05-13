import { useState } from 'react';
import { signInWithEmail, signInWithOAuth } from '../api/supabase/sessions';

export const useSignIn = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const signInEmail = async ({ email, password }) => {
        setLoading(true);
        setError(null);
        try {
            const data = await signInWithEmail(email, password);
            return data;
        } catch (err) {
            setError(err.message || 'Ошибка входа по email');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const signInOAuth = async (provider) => {
        setLoading(true);
        setError(null);
        try {
            const data = await signInWithOAuth(provider);
            return data;
        } catch (err) {
            setError(err.message || 'Ошибка OAuth входа');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        signInEmail,
        signInOAuth,
        loading,
        error,
    };
};
