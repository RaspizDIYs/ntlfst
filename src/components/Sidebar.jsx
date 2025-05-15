import React, {useState} from "react";
import {SunIcon, MoonIcon, UsersIcon} from "@heroicons/react/24/solid";
import {FaUserCircle} from "react-icons/fa";
import useThemeStore from "../store/useThemeStore";

const Sidebar = ({ members, onSelectMember, orgInfo }) => {
    const {isDark, toggleTheme} = useThemeStore();
    const [showMembers, setShowMembers] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <div
            className={`sidebar p-2 rounded-lg shadow-2xl flex flex-col items-center space-y-4 max-w-[80px] mx-4 my-6 transition-colors duration-300 ${
                isDark ? "bg-white text-gray-800" : "bg-gray-800 text-white"
            }`}
        >
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

            <button
                onClick={toggleTheme}
                className={`hover:text-gray-600 transition ${
                    isDark ? "text-gray-800" : "text-white"
                }`}
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <SunIcon className="w-6 h-6"/>
                ) : (
                    <MoonIcon className="w-6 h-6"/>
                )}
            </button>

            <div className="relative">
                <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="hover:text-gray-400 transition"
                >
                    <FaUserCircle className="w-7 h-7"/>
                </button>
                {showProfile && (
                    <div
                        className={`absolute left-[80px] top-0 w-40 p-3 rounded-lg shadow-xl z-10 transition-colors duration-300 ${
                            isDark ? "bg-white text-black" : "bg-gray-900 text-white"
                        }`}
                    >
                        <button className="w-full py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            Log In
                        </button>
                        <button className="w-full py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            Log Out
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={() => setShowMembers(!showMembers)}
                className="hover:text-gray-400 transition"
            >
                <UsersIcon className="w-6 h-6"/>
            </button>

            {showMembers && (
                <div className="flex flex-col items-center space-y-4">
                    {members.map((member) => (
                        <div
                            key={member.login}
                            className="relative cursor-pointer group flex flex-col items-center"
                            onClick={() => onSelectMember(member)}
                        >
                            <img
                                src={member.avatar_url}
                                alt={member.login}
                                className="w-14 h-14 rounded-full border-4 border-gray-300 shadow-md group-hover:opacity-80 transition duration-300"
                            />
                            <div
                                className="absolute left-[60px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg">
                                {member.login}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
