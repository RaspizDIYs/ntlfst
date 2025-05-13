import { useState } from 'react';
import {
    enrollMfaTotp,
    verifyMfaEnrollment,
    challengeMfa
} from '../api/supabase/mfa';

export const useMfaSetup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Начало настройки MFA (получение QR и secret)
    const startEnrollment = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await enrollMfaTotp();
            return result; // содержит QR, secret, factorId
        } catch (err) {
            setError(err.message || 'Ошибка настройки MFA');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Подтверждение настройки MFA
    const verifyEnrollment = async ({ code, factorId }) => {
        setLoading(true);
        setError(null);
        try {
            const result = await verifyMfaEnrollment(code, factorId);
            return result;
        } catch (err) {
            setError(err.message || 'Ошибка верификации MFA');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Вход с MFA
    const verifyLoginMfa = async ({ ticket, factorId, code }) => {
        setLoading(true);
        setError(null);
        try {
            const result = await challengeMfa(ticket, factorId, code);
            return result;
        } catch (err) {
            setError(err.message || 'Ошибка MFA входа');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        startEnrollment,
        verifyEnrollment,
        verifyLoginMfa,
        loading,
        error
    };
};
