import { supabase } from "../lib/supabaseClient";

export default function SignIn() {
    const handleOAuthSignIn = async (provider) => {
        await supabase.auth.signInWithOAuth({ provider });
        // redirectTo — не нужен, если правильно настроено в Supabase
    };

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) alert(error.message);
        else alert("Проверьте почту.");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <form onSubmit={handleEmailSignIn}>
                <input type="email" name="email" placeholder="Email" required />
                <button type="submit">Войти по Email</button>
            </form>
            <button onClick={() => handleOAuthSignIn("github")}>GitHub</button>
            <button onClick={() => handleOAuthSignIn("google")}>Google</button>
            <button onClick={() => handleOAuthSignIn("discord")}>Discord</button>
        </div>
    );
}
