// auth/components/MfaForm/MfaForm.jsx
import { useState } from 'react';
import { useMfaSetup } from '../../hooks/useMfaSetup';

export const MfaForm = ({ onSuccess }) => {
    const { verifyMfa, loading, error } = useMfaSetup();
    const [code, setCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ok = await verifyMfa(code);
        if (ok && onSuccess) {
            onSuccess();
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Подтверждение MFA</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Код из приложения"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded-xl hover:opacity-90"
                >
                    Подтвердить
                </button>
            </form>

            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </div>
    );
};
