import React from "react";

const Sidebar = ({ members, onSelectMember, orgInfo }) => {
    return (
        <div className="sidebar w-20 bg-gray-800 text-white flex flex-col items-center py-6 space-y-6">
            {/* Логотип организации */}
            {orgInfo && (
                <a
                    href={orgInfo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group"
                >
                    <img
                        src={orgInfo.avatar_url}
                        alt={orgInfo.name}
                        className="w-16 h-16 rounded-lg border-2 border-gray-700 shadow-md group-hover:opacity-80 transition"
                    />
                </a>
            )}

            {/* Участники */}
            {members.map((member) => (
                <div
                    key={member.login}
                    className="avatar-item relative cursor-pointer group"
                    onClick={() => onSelectMember(member)}
                >
                    <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover shadow group-hover:opacity-80 transition"
                    />
                </div>
            ))}
        </div>
    );
};

export default Sidebar;