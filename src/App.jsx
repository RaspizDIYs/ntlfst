import React, { useContext, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MemberCard from "./components/MemberCard";
import SplashScreen from "./splashscreen/SplashScreen";
import useThemeStore from "./store/useThemeStore";
import { Octokit } from "@octokit/rest";

import AuthProvider from './context/AuthProvider';
import AuthContext from './context/AuthContext';
import Login from './components/Login';
import Comments from './components/comments/index';


const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

console.log('GitHub Token:', import.meta.env.VITE_GITHUB_TOKEN);

function AppContent() {
    const { user } = useContext(AuthContext);
    const [orgInfo, setOrgInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [splashCompleted, setSplashCompleted] = useState(false);

    const { isDark } = useThemeStore();

    useEffect(() => {
        const fetchOrgInfo = async () => {
            try {
                const { data } = await octokit.orgs.get({ org: "RaspizDIYs" });
                setOrgInfo({
                    name: data.name || "RaspizDIYs",
                    avatar_url: data.avatar_url,
                    html_url: data.html_url,
                });
            } catch (error) {
                console.error("Ошибка при загрузке информации об организации:", error);
            }
        };

        const fetchMembers = async () => {
            try {
                const { data } = await octokit.orgs.listMembers({ org: "RaspizDIYs" });
                setMembers(data);
            } catch (error) {
                console.error("Ошибка при загрузке участников организации:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchOrgInfo();
        void fetchMembers();
    }, []);

    const handleSplashComplete = () => setSplashCompleted(true);
    const handleSelectMember = (member) => setSelectedMember(member);
    const handleCloseCard = () => setSelectedMember(null);

    if (!splashCompleted || loading) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return (
        <div
            className={`min-h-screen w-full ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"}`}
            style={{ overflowX: 'hidden' }}
        >
            <div className="mx-auto px-4" style={{ maxWidth: 1280 }}>
                <div className="flex flex-col md:flex-row min-h-screen relative z-10">

                    {/* Sidebar */}
                    <div className="w-full md:w-1/6 flex-shrink-0 mb-4 md:mb-0">
                        <Sidebar members={members} onSelectMember={handleSelectMember} orgInfo={orgInfo} />
                    </div>

                    {/* Основной контент */}
                    <div className="flex-grow p-4 mb-4 md:mb-0 overflow-auto">
                        {selectedMember ? (
                            <MemberCard member={selectedMember} onClose={handleCloseCard} />
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                {user
                                    ? "Mem"
                                    : "Вы вошли как гость. Пожалуйста, войдите для расширенного доступа."}
                            </p>
                        )}
                    </div>

                    {/* Комментарии */}
                    <aside
                        className="w-full md:w-80 flex-shrink-0 md:pl-4"
                        style={{ maxWidth: 320 }}
                    >
                        <Comments user={user} />
                        {!user && (
                            <div className="mt-4 text-center">
                                <Login />
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
