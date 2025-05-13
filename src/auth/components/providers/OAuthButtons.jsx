// auth/components/providers/OAuthButtons.jsx
import { useSignIn } from '../../hooks/useSignIn';

export const OAuthButtons = () => {
    const { signInWithProvider, loading } = useSignIn();

    const providers = [
        { name: 'Google', key: 'google', color: 'bg-red-500' },
        { name: 'GitHub', key: 'github', color: 'bg-gray-800' },
        { name: 'Discord', key: 'discord', color: 'bg-indigo-600' },
    ];

    return (
        <div className="space-y-2">
            {providers.map(({ name, key, color }) => (
                <button
                    key={key}
                    onClick={() => signInWithProvider(key)}
                    disabled={loading}
                    className={`w-full ${color} text-white py-2 rounded-xl hover:opacity-90`}
                >
                    Войти через {name}
                </button>
            ))}
        </div>
    );
};
