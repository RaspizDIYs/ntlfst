import React from "react";

const Sidebar = ({ members, onSelectMember, orgInfo }) => {
    return (
        <div className="sidebar bg-gray-100 p-2 rounded-lg shadow-2xl flex flex-col items-center space-y-4 max-w-[80px] mx-4 my-6">
            {/* Логотип организации */}
            {orgInfo && (
                <a
                    href={orgInfo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center"
                >
                    <img
                        src={orgInfo.avatar_url}
                        alt={orgInfo.name}
                        className="w-16 h-16 rounded-[10%] border-4 border-gray-300 shadow-md group-hover:opacity-80 transition duration-300"
                    />
                </a>
            )}

            {/* Разделитель */}
            <div className="w-full h-[1px] bg-gray-300"></div>

            {/* Участники */}
            <div className="flex flex-col items-center space-y-4">
                {members.map((member) => (
                    <div
                        key={member.login}
                        className="relative cursor-pointer group flex flex-col items-center"
                        onClick={() => onSelectMember(member)}
                    >
                        {/* Аватарка участника */}
                        <img
                            src={member.avatar_url}
                            alt={member.login}
                            className="w-14 h-14 rounded-full border-4 border-gray-300 shadow-md group-hover:opacity-80 transition duration-300"
                        />
                        {/* Всплывающая подсказка */}
                        <div className="absolute left-[60px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg">
                            {member.login}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;