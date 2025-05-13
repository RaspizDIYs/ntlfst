// auth/routes/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ProtectedRoute = ({ children }) => {
    const { session, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !session) {
            navigate('/auth/signin', { replace: true });
        }
    }, [session, loading, navigate]);

    if (loading) return null;
    return session ? children : null;
};
