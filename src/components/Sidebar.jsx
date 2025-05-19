import React, { useState, useEffect, useRef, useContext } from "react";
import { SunIcon, MoonIcon, UsersIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { FaUserCircle } from "react-icons/fa";
import useThemeStore from "../store/useThemeStore";
import { FaGithub, FaGoogle, FaDiscord } from "react-icons/fa";
import AuthContext from "../context/AuthContext";

const Sidebar = ({ members, onSelectMember, orgInfo }) => {
    const { isDark, toggleTheme } = useThemeStore();
    const [showMembers, setShowMembers] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [sidebarState, setSidebarState] = useState(0);
    const membersRef = useRef(null);

    const { user, signInWithProvider, signOut } = useContext(AuthContext);

    // Проверяем, есть ли валидный пользователь
    const isGuest =
        !user ||
        Object.keys(user).length === 0 ||
        (!user.email && !user.user_metadata?.full_name && !user.id);

    const toggleSidebarState = () => {
        if (sidebarState === 0) {
            setSidebarState(1);
        } else {
            setSidebarState(0);
            setShowMembers(false);
        }
    };

    useEffect(() => {
        if (membersRef.current) {
            membersRef.current.style.maxHeight = showMembers ? `${membersRef.current.scrollHeight}px` : "0px";
        }
    }, [showMembers]);

    const handleLogin = async (provider) => {
        try {
            await signInWithProvider(provider);
            setShowProfile(false);
        } catch (error) {
            console.error("Ошибка при логине:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setShowProfile(false);
        } catch (error) {
            console.error("Ошибка при логауте:", error);
        }
    };

    return (
        <div
            className={`sidebar p-2 rounded-lg shadow-2xl flex flex-col items-center space-y-4 max-w-[100px] mx-4 my-6 transition-all duration-300 ${
                isDark ? "bg-white text-gray-800" : "bg-gray-800 text-white"
            } ${
                sidebarState === 0 ? "h-24" : sidebarState === 1 ? "h-64" : "h-auto"
            }`}
        >
            {orgInfo && (
                <div className="flex flex-col items-center">
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
                    {sidebarState === 0 && (
                        <button onClick={toggleSidebarState} className="hover:text-gray-400 transition mt-1">
                            <ChevronDownIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}

            {sidebarState > 0 && (
                <>
                    <button
                        onClick={toggleTheme}
                        className={`hover:text-gray-600 transition ${isDark ? "text-gray-800" : "text-white"}`}
                        aria-label="Toggle theme"
                    >
                        {isDark ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </button>

                    <div className="relative">
                        <button onClick={() => setShowProfile(!showProfile)} className="hover:text-gray-400 transition">
                            <FaUserCircle className="w-7 h-7" />
                        </button>

                        {showProfile && (
                            <div
                                className={`absolute left-[80px] top-0 w-44 p-3 rounded-lg shadow-xl z-10 transition-colors duration-300 ${
                                    isDark ? "bg-white text-black" : "bg-gray-800 text-white"
                                }`}
                            >
                                {isGuest ? (
                                    <>
                                        <button onClick={() => handleLogin("github")} className="icon-btn">
                                            <FaGithub className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleLogin("google")} className="icon-btn">
                                            <FaGoogle className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleLogin("discord")} className="icon-btn">
                                            <FaDiscord className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                    <div className="mb-2 flex items-center space-x-2">
                                        <img
                                            src={user.user_metadata?.avatar_url}
                                            alt="avatar"
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="font-semibold truncate max-w-[100px]">
                                                {user.user_metadata?.full_name || user.email || user.id}
                                            </span>
                                    </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Log Out
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setShowMembers(!showMembers);
                            if (!showMembers) setSidebarState(2);
                        }}
                        className="hover:text-gray-400 transition"
                    >
                        <UsersIcon className="w-6 h-6" />
                    </button>
                </>
            )}

            <div
                ref={membersRef}
                className={`flex flex-col items-center space-y-4 overflow-hidden transition-all duration-300 ${
                    showMembers ? "" : "max-h-0"
                }`}
            >
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
                            className="absolute left-[60px] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg"
                        >
                            {member.login}
                        </div>
                    </div>
                ))}
            </div>

            {sidebarState > 0 && (
                <button onClick={toggleSidebarState} className="hover:text-gray-400 transition mt-auto">
                    <ChevronUpIcon className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default Sidebar;