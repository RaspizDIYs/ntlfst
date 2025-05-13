// auth/routes/AuthRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../components/AuthForm/AuthPage';
import { MfaForm } from '../components/MfaForm/MfaForm';

export const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="/signin" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/mfa" element={<MfaForm />} />

            {/* Redirect any unknown /auth/* to /auth/signin */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
    );
};
