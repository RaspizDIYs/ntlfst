import React, { useContext, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MemberCard from "./components/MemberCard";
import SplashScreen from "./splashscreen/SplashScreen";
import useThemeStore from "./store/useThemeStore";
import { Octokit } from "@octokit/rest";

import AuthProvider from './context/AuthProvider';
import AuthContext from './context/AuthContext';
import Login from './components/Login';
import Comments from './components/Comments';

const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

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

    if (!user) {
        return <Login />;
    }

    if (!splashCompleted || loading) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return (
        <div className={`main-container relative ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <div className="flex h-screen relative z-10">
                {/* Левый сайдбар */}
                <div className="md:w-1/6 w-0 hidden md:block">
                    <Sidebar members={members} onSelectMember={handleSelectMember} orgInfo={orgInfo} />
                </div>

                {/* Основной контент */}
                <div className="flex-grow flex items-center justify-center overflow-auto">
                    {selectedMember ? (
                        <MemberCard member={selectedMember} onClose={handleCloseCard} />
                    ) : (
                        <p className="text-center text-gray-500">Выберите участника слева</p>
                    )}
                </div>

                {/* Правый сайдбар — комментарии */}
                <aside className="w-80 overflow-auto hidden md:flex flex-col">
                    <Comments />
                </aside>
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
