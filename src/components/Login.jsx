import { supabase } from '../api/supabaseClient';

const providers = ['github', 'google', 'discord'];

const Login = () => {
    const signIn = async (provider) => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin },
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Login</h1>
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
