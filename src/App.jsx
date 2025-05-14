import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MemberCard from "./components/MemberCard";
import { Octokit } from "@octokit/rest";
import SplashScreen from "./splashscreen/SplashScreen";

// Инициализация Octokit с токеном
const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

function App() {
    const [orgInfo, setOrgInfo] = useState(null); // Информация об организации
    const [members, setMembers] = useState([]); // Список участников
    const [selectedMember, setSelectedMember] = useState(null); // Выбранный участник
    const [loading, setLoading] = useState(true); // Состояние загрузки данных
    const [splashCompleted, setSplashCompleted] = useState(false); // Состояние завершения заставки

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
                setMembers(data); // Устанавливаем список участников
            } catch (error) {
                console.error("Ошибка при загрузке участников организации:", error);
            } finally {
                setLoading(false); // Завершаем загрузку данных
            }
        };

        fetchOrgInfo();
        fetchMembers();
    }, []);

    // Callback для завершения заставки
    const handleSplashComplete = () => {
        setSplashCompleted(true);
    };

    const handleSelectMember = (member) => {
        setSelectedMember(member); // Устанавливаем выбранного участника
    };

    const handleCloseCard = () => {
        setSelectedMember(null); // Закрываем карточку
    };

    // Если заставка ещё не завершена или данные загружаются, показываем заставку
    if (!splashCompleted || loading) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return (
        <div className="main-container relative">
            {/* Основной контент */}
            <div className="flex h-screen relative z-10">
                {/* Sidebar с участниками */}
                <Sidebar
                    members={members}
                    onSelectMember={handleSelectMember}
                    orgInfo={orgInfo}
                />

                {/* Карточка участника */}
                {selectedMember && (
                    <div className="flex-grow flex items-center justify-center">
                        <MemberCard member={selectedMember} onClose={handleCloseCard} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;