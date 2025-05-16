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
        <div className={`main-container relative min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <div className="flex flex-col md:flex-row h-full relative z-10">
                <div className="w-full md:w-1/6 flex-shrink-0">
                    <Sidebar members={members} onSelectMember={handleSelectMember} orgInfo={orgInfo} />
                </div>

                <div className="flex-grow flex items-center justify-center overflow-auto p-4">
                    {selectedMember ? (
                        <MemberCard member={selectedMember} onClose={handleCloseCard} />
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">Mem</p>
                    )}
                </div>

                <aside className="w-full md:w-80 flex-shrink-0">
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
