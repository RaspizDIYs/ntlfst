import { useState } from 'react';
import { useSignIn } from '../../hooks/useSignIn';
import { OAuthButtons } from '../providers/OAuthButtons';

export const AuthPage = () => {
    const { signInWithEmail, error, loading } = useSignIn();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login'); // login | register

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signInWithEmail({ email, password, mode });
    };

    return (
        <div className="max-w-sm mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
                {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>

            <OAuthButtons />

            <div className="my-4 text-center text-sm text-gray-500">или с Email</div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded-xl hover:opacity-90"
                >
                    {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                </button>
            </form>

            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

            <p className="mt-6 text-center text-sm">
                {mode === 'login' ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
                <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-blue-600 hover:underline"
                >
                    {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                </button>
            </p>
        </div>
    );
};
