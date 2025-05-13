import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        void (async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setIsAuthed(true);
            } else {
                navigate("/signin", { replace: true }); // отправляем на страницу входа
            }

            setIsLoading(false);
        })();
    }, [navigate]);

    if (isLoading) return null;
    return isAuthed ? children : null;
}
