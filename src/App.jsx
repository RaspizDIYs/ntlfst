import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MemberCard from "./components/MemberCard";
import SplashScreen from "./splashscreen/SplashScreen";
import Loader from "./components/Loader";
import ErrorBanner from "./components/ErrorBanner";
import PrivateSection from "./components/PrivateSection";
import AdminSection from "./components/AdminSection";
import { getDomains, addDomain } from "./components/lookup";
import { Octokit } from "@octokit/rest";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./hooks/useAuth";

const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

function App() {
    const navigate = useNavigate();
    const { session, profile, isAdmin } = useAuth();

    const [orgInfo, setOrgInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [splashCompleted, setSplashCompleted] = useState(false);
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState("");

    const [isOrgLoading, setIsOrgLoading] = useState(true);
    const [isMembersLoading, setIsMembersLoading] = useState(true);
    const [isDomainsLoading, setIsDomainsLoading] = useState(true);
    const [orgError, setOrgError] = useState(null);
    const [membersError, setMembersError] = useState(null);
    const [domainsError, setDomainsError] = useState(null);

    // 🆕 Обработка Supabase OAuth redirect
    useEffect(() => {
        const handleOAuthRedirect = async () => {
            const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
            if (error) {
                console.error("Ошибка получения сессии после OAuth редиректа:", error.message);
            } else if (data?.session) {
                window.history.replaceState({}, document.title, "/");
            }
        };

        if (window.location.hash.includes("access_token")) {
            handleOAuthRedirect();
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchAllData = async () => {
            try {
                await Promise.allSettled([
                    (async () => {
                        try {
                            setIsOrgLoading(true);
                            setOrgError(null);
                            const { data } = await octokit.orgs.get({ org: "RaspizDIYs" });
                            setOrgInfo({
                                name: "raspizdiy",
                                avatar_url: data.avatar_url,
                                html_url: data.html_url,
                            });
                        } catch (error) {
                            if (error.name !== "AbortError") setOrgError(error.message);
                        } finally {
                            setIsOrgLoading(false);
                        }
                    })(),

                    (async () => {
                        try {
                            setIsMembersLoading(true);
                            setMembersError(null);
                            const { data } = await octokit.orgs.listMembers({ org: "RaspizDIYs" });
                            setMembers(data);
                        } catch (error) {
                            if (error.name !== "AbortError") setMembersError(error.message);
                        } finally {
                            setIsMembersLoading(false);
                        }
                    })(),

                    (async () => {
                        try {
                            setIsDomainsLoading(true);
                            setDomainsError(null);
                            const domains = await getDomains({ signal });
                            setDomains(domains);
                        } catch (error) {
                            if (error.name !== "AbortError") setDomainsError(error.message);
                        } finally {
                            setIsDomainsLoading(false);
                        }
                    })()
                ]);
            } catch (error) {
                console.error("Неожиданная ошибка:", error);
            }
        };

        fetchAllData().catch(console.error);
        return () => controller.abort();
    }, []);

    const handleSplashComplete = () => setSplashCompleted(true);

    const handleSelectMember = (member) => setSelectedMember(member);
    const handleCloseCard = () => setSelectedMember(null);

    const handleAddDomain = async () => {
        if (!newDomain.trim()) return;
        try {
            await addDomain(newDomain.trim());
            const updated = await getDomains();
            setDomains(updated);
            setNewDomain("");
        } catch (error) {
            setDomainsError(error.message);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/"); // Перенаправляем на страницу входа после выхода
    };

    // Пока идет заставка, показываем SplashScreen
    if (!splashCompleted) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    // Когда загрузка завершена, проверяем сессию
    if (!session) {
        return (
            <div className="flex justify-center items-center h-screen">
                <button
                    onClick={() => navigate("/sign-in")}
                    className="bg-blue-500 text-white p-4 rounded"
                >
                    Перейти на страницу логина
                </button>
            </div>
        );
    }

    // После завершения загрузки данных показываем основной контент
    return (
        <div className="main-container relative">
            <header className="p-4 border-b flex justify-between items-center">
                <h1 className="text-xl font-bold">raspizdiy</h1>

                <div className="flex items-center gap-3">
                    {profile && (
                        <div className="flex items-center gap-3">
                            {profile?.avatar_url && (
                                <img
                                    src={profile.avatar_url}
                                    className="w-8 h-8 rounded-full cursor-pointer"
                                    alt="avatar"
                                    onClick={() => navigate("/profile")}
                                />
                            )}
                            <span>{profile?.username || "Пользователь"}</span>
                            <button
                                onClick={handleSignOut}
                                className="text-red-500 hover:underline"
                            >
                                Выйти
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex h-screen relative z-10">
                <Sidebar
                    members={members}
                    onSelectMember={handleSelectMember}
                    orgInfo={orgInfo}
                    loading={isMembersLoading}
                    error={membersError}
                />

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {orgError && <ErrorBanner message={orgError} />}
                    {membersError && <ErrorBanner message={membersError} />}
                    {domainsError && <ErrorBanner message={domainsError} />}

                    {selectedMember && (
                        <div className="mb-4">
                            <MemberCard member={selectedMember} onClose={handleCloseCard} />
                        </div>
                    )}

                    {isAdmin && (
                        <AdminSection
                            fallback={<div className="text-gray-400 italic">🔒 Только для администратора</div>}
                        >
                            <div className="bg-red-100 border border-red-300 p-4 rounded-xl">
                                <h2 className="text-lg font-bold text-red-700 mb-2">Админка</h2>
                                <p className="text-red-700">Здесь можно выполнять административные действия.</p>
                                <button
                                    onClick={() => console.warn("Очистка доменов!")}
                                    className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Очистить все домены
                                </button>
                            </div>
                        </AdminSection>
                    )}

                    <PrivateSection
                        fallback={
                            <div className="text-gray-500 italic">
                                🔒 Войдите, чтобы добавлять домены и видеть расширенный функционал.
                            </div>
                        }
                    >
                        <div className="bg-white rounded-2xl shadow p-6 max-w-md">
                            <h2 className="text-xl text-gray-700 font-bold mb-4">Добавить домен</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="text-gray-500 border px-4 py-2 rounded-lg flex-grow"
                                    placeholder="example.com"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                />
                                <button
                                    className="bg-neutral-500 text-white px-4 py-2 rounded-lg"
                                    onClick={handleAddDomain}
                                >
                                    Добавить
                                </button>
                            </div>
                        </div>
                    </PrivateSection>

                    <div className="bg-white rounded-2xl shadow p-6 max-w-md">
                        <h2 className="text-xl text-gray-700 font-bold mb-4">Список доменов</h2>
                        {isDomainsLoading ? (
                            <Loader />
                        ) : (
                            <ul>
                                {domains.length > 0 ? (
                                    domains.map((domain) => (
                                        <li key={domain.id} className="mb-2 text-gray-700">
                                            {domain.name}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500">Нет доменов.</p>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
