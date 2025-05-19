import React, { useState, useEffect, lazy, Suspense } from "react";
import { FaSyncAlt, FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import "../styles/card.css";

import alexxxxxanderBack from "../assets/cardface/alexxxxxander-back.png";
import jab04kinBack from "../assets/cardface/jab04kin-back.png";
import butk1chBack from "../assets/cardface/butk1ch-back.png";
import spelloveBack from "../assets/cardface/spellove-back.png";
import defaultBack from "../assets/cardface/default-back.png";

import { staleWhileRevalidate, saveToCache } from "../utils/staleWhileRevalidate";
const LanguagesList = lazy(() => import("./LanguagesList"));

import useThemeStore from "../store/useThemeStore"; // импорт темы

const cardBackImages = {
    Alexxxxxander: alexxxxxanderBack,
    Jab04kin: jab04kinBack,
    butk1ch: butk1chBack,
    SpelLOVE: spelloveBack,
    default: defaultBack,
};

const GRAPHQL_QUERY = `
query($username: String!) {
  user(login: $username) {
    repositories(first: 100, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        isArchived
        languages(first: 10) {
          edges {
            size
            node {
              name
            }
          }
        }
      }
    }
  }
}
`;

const MemberCard = React.memo(({ member, onClose }) => {
    const {isDark} = useThemeStore(); // получение темы

    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [languages, setLanguages] = useState([]);
    const [repoCount, setRepoCount] = useState(0);

    useEffect(() => {
        const fetchLanguagesFromAPI = async (login) => {
            const response = await fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: GRAPHQL_QUERY,
                    variables: {username: login},
                }),
            });

            if (!response.ok) {
                console.error("Network Error:", response.statusText);
                return {languages: [], repoCount: 0};
            }

            const {data, errors} = await response.json();
            if (errors) {
                console.error("GraphQL Errors:", errors);
                return {languages: [], repoCount: 0};
            }

            const repositories = data.user.repositories;
            const aggregatedLanguages = {};
            repositories.nodes
                .filter((repo) => !repo.isArchived && repo.languages.edges.length > 0)
                .forEach((repo) => {
                    repo.languages.edges.forEach(({node, size}) => {
                        aggregatedLanguages[node.name] =
                            (aggregatedLanguages[node.name] || 0) + size;
                    });
                });

            return {
                languages: Object.keys(aggregatedLanguages),
                repoCount: repositories.totalCount,
            };
        };

        const fetchLanguages = async () => {
            setLoading(true);
            const cacheKey = `languages_${member.login}`;

            const {data: cachedData, isStale} = await staleWhileRevalidate(
                cacheKey,
                () => fetchLanguagesFromAPI(member.login)
            );

            if (cachedData) {
                setLanguages(cachedData.languages);
                setRepoCount(cachedData.repoCount);
            }

            if (isStale) {
                const freshData = await fetchLanguagesFromAPI(member.login);
                setLanguages(freshData.languages);
                setRepoCount(freshData.repoCount);
                saveToCache(cacheKey, freshData);
            }
            setLoading(false);
        };

        fetchLanguages();
    }, [member.login]);

    const handleCardFlip = () => setIsFlipped(!isFlipped);

    const cardBackImage = cardBackImages[member.login] || cardBackImages.default;

    return (
        <div className="card-container relative max-w-screen-lg mx-auto">
            <div className={`card ${isFlipped ? "flipped" : ""}`}>
                <div
                    className={`card-front rounded-lg shadow-lg overflow-auto max-h-[90vh] p-8 relative transition-colors duration-300
                    ${isDark ? "bg-white text-gray-800" : "bg-[#1a1a1a] text-gray-200"}`}
                >
                    <button
                        onClick={onClose}
                        className={`absolute top-2 right-2 transition-colors duration-300 ${
                            isDark ? "text-gray-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
                        }`}
                        aria-label="Close card"
                    >
                        <FaTimes size={20} />
                    </button>

                    {loading ? (
                        <div className="loading-placeholder">Загрузка...</div>
                    ) : (
                        <>
                            <img
                                src={member.avatar_url}
                                alt={member.name}
                                className="avatar w-28 h-28 rounded-full mx-auto mb-6 shadow"
                            />
                            <h2
                                className={`text-2xl font-bold text-center ${
                                    isDark ? "text-gray-800" : "text-gray-200"
                                }`}
                            >
                                {member.name || member.login}
                            </h2>
                            <p className={`text-center ${isDark ? "text-gray-700" : "text-gray-400"}`}>
                                @{member.login}
                            </p>

                            <div className="languages mt-6">
                                <h3
                                    className={`text-sm font-semibold mb-4 ${
                                        isDark ? "text-gray-700" : "text-gray-300"
                                    }`}
                                >
                                    Используемые языки:
                                </h3>
                                <Suspense fallback={<div>Loading languages...</div>}>
                                    <LanguagesList languages={languages} />
                                </Suspense>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                <a
                                    href={member.html_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`transition-colors duration-300 ${
                                        isDark ? "text-gray-700 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
                                    }`}
                                    aria-label="GitHub profile"
                                >
                                    <FontAwesomeIcon icon={faGithub} size="2x" />
                                </a>
                                <span
                                    className={`text-sm font-semibold ${
                                        isDark ? "text-gray-700" : "text-gray-200"
                                    }`}
                                >
                                    {repoCount} репозиториев
                                </span>
                                <button
                                    onClick={handleCardFlip}
                                    className="text-white hover:text-gray-300 border border-white rounded-full p-2 bg-black bg-opacity-50"
                                    aria-label="Flip card"
                                >
                                    <FaSyncAlt size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div
                    className="card-back bg-cover bg-center rounded-lg shadow-lg max-h-[90vh] overflow-hidden relative"
                    style={{
                        backgroundImage: `url(${cardBackImage})`,
                        filter: isDark ? "brightness(0.7)" : "none",
                    }}
                >
                    <button
                        onClick={handleCardFlip}
                        className="absolute bottom-6 right-6 text-white hover:text-gray-300 border border-white rounded-full p-2 bg-black bg-opacity-50"
                        aria-label="Flip back"
                    >
                        <FaSyncAlt size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
});

MemberCard.displayName = "MemberCard";

export default MemberCard;
