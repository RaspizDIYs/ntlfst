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

import languageColorsData from "../utils/languageColors";

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
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [languages, setLanguages] = useState([]);
    const [repoCount, setRepoCount] = useState(0);

    useEffect(() => {
        const fetchLanguages = async () => {
            setLoading(true);
            const cacheKey = `languages_${member.login}`;

            const { data: cachedData, isStale } = await staleWhileRevalidate(
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

    const fetchLanguagesFromAPI = async (login) => {
        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: GRAPHQL_QUERY,
                variables: { username: login },
            }),
        });

        if (!response.ok) {
            console.error("Network Error:", response.statusText);
            return { languages: [], repoCount: 0 };
        }

        const { data, errors } = await response.json();
        if (errors) {
            console.error("GraphQL Errors:", errors);
            return { languages: [], repoCount: 0 };
        }

        const repositories = data.user.repositories;
        const aggregatedLanguages = {};
        repositories.nodes
            .filter((repo) => !repo.isArchived && repo.languages.edges.length > 0)
            .forEach((repo) => {
                repo.languages.edges.forEach(({ node, size }) => {
                    aggregatedLanguages[node.name] =
                        (aggregatedLanguages[node.name] || 0) + size;
                });
            });

        return {
            languages: Object.keys(aggregatedLanguages),
            repoCount: repositories.totalCount,
        };
    };

    const handleCardFlip = () => setIsFlipped(!isFlipped);

    const cardBackImage = cardBackImages[member.login] || cardBackImages.default;

    return (
        <div className="card-container relative max-w-screen-lg mx-auto">
            <div className={`card ${isFlipped ? "flipped" : ""}`}>
                <div className="card-front bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
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
                            <h2 className="text-2xl text-gray-700 font-bold text-center">
                                {member.name || member.login}
                            </h2>
                            <p className="text-center text-gray-500">@{member.login}</p>
                            <div className="languages mt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">
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
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <FontAwesomeIcon icon={faGithub} size="2x" />
                                </a>
                                <span className="text-sm text-gray-700 font-semibold">
                                    {repoCount} репозиториев
                                </span>
                                <button
                                    onClick={handleCardFlip}
                                    className="text-white hover:text-gray-300 border border-white rounded-full p-2 bg-black bg-opacity-50"
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
                    }}
                >
                    <button
                        onClick={handleCardFlip}
                        className="absolute bottom-6 right-6 text-white hover:text-gray-300 border border-white rounded-full p-2 bg-black bg-opacity-50"
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