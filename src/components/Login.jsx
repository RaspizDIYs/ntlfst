import { useState } from 'react';
import { supabase } from '../api/supabaseClient';

const providers = ['github', 'google', 'discord'];

const Login = () => {
    const [error, setError] = useState(null);

    const signIn = async (provider) => {
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: window.location.origin },
            });
            if (error) throw error;
        } catch (err) {
            console.error('Ошибка входа:', err.message);
            setError('Не удалось войти. Попробуйте ещё раз.');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Login</h1>
            {error && (
                <p className="text-red-500 mb-4" role="alert">
                    {error}
                </p>
            )}
            {providers.map((provider) => (
                <button
                    key={provider}
                    onClick={() => signIn(provider)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md mr-2"
                >
                    Sign in with {provider}
                </button>
            ))}
        </div>
    );
};

export default Login;
