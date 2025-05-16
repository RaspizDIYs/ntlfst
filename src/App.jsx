import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MemberCard from "./components/MemberCard";
import { Octokit } from "@octokit/rest";
import SplashScreen from "./splashscreen/SplashScreen";
import useThemeStore from "./store/useThemeStore";

// Инициализация Octokit с токеном
const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

function App() {
    const [orgInfo, setOrgInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [splashCompleted, setSplashCompleted] = useState(false);

    const { isDark } = useThemeStore();

    useEffect(() => {
        const fetchOrgInfo = async () => {
            try {
                const { data } = await octokit.orgs.get({
                    org: "RaspizDIYs",
                });
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
                const { data } = await octokit.orgs.listMembers({
                    org: "RaspizDIYs",
                });
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

    const handleSplashComplete = () => {
        setSplashCompleted(true);
    };

    const handleSelectMember = (member) => {
        setSelectedMember(member);
    };

    const handleCloseCard = () => {
        setSelectedMember(null);
    };

    if (!splashCompleted || loading) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return (
        <div className={`main-container relative ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <div className="flex flex-col md:flex-row h-screen relative z-10">
                <div className="md:w-1/6 w-full">
                    <Sidebar
                        members={members}
                        onSelectMember={handleSelectMember}
                        orgInfo={orgInfo}
                    />
                </div>
                {selectedMember && (
                    <div className="flex-grow flex items-center justify-center md:w-5/6 w-full">
                        <MemberCard member={selectedMember} onClose={handleCloseCard} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
