import React, { useEffect, useState } from "react";
import { Octokit } from "@octokit/rest";
import MemberCard from "./MemberCard";
import Sidebar from "./Sidebar";

// Инициализация Octokit с токеном
const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN, // Используем Vite-специфичный способ доступа к переменным окружения
});

const Organization = ({ orgName, orgInfo }) => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Получение списка участников организации
                const { data } = await octokit.orgs.listMembers({
                    org: orgName,
                });

                setMembers(data);
                setSelectedMember(data[0]); // Выбираем первого участника по умолчанию
            } catch (error) {
                console.error("Ошибка при загрузке участников:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [orgName]);

    if (loading) {
        return <p>Загрузка данных об участниках...</p>;
    }

    return (
        <div className="flex h-screen">
            <Sidebar
                members={members}
                onSelectMember={setSelectedMember}
                orgInfo={orgInfo} // Передаём информацию об организации
            />
            <div className="flex-1 flex items-center justify-center p-8">
                {selectedMember ? (
                    <MemberCard member={selectedMember} />
                ) : (
                    <p>Выберите участника из списка.</p>
                )}
            </div>
        </div>
    );
};

export default Organization;