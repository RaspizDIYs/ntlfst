import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [linkedAccounts, setLinkedAccounts] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        const fetchLinkedAccounts = async () => {
            const { data, error } = await supabase.auth.getUserIdentities();
            if (error) console.error("Ошибка при загрузке аккаунтов:", error);
            else setLinkedAccounts(data.identities);
        };

        void  fetchUser();
        void fetchLinkedAccounts();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">👤 Профиль</h1>

            {user && (
                <div className="mb-6">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-2">🔗 Связанные аккаунты</h2>
                {linkedAccounts.length === 0 ? (
                    <p className="text-gray-500">Нет связанных аккаунтов</p>
                ) : (
                    <ul className="list-disc list-inside space-y-1">
                        {linkedAccounts.map((account) => (
                            <li key={account.provider}>
                                {account.provider} — {account.identity_data?.email || account.identity_data?.user_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
