import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/rest";
import { FaSyncAlt, FaTimes } from "react-icons/fa"; // Кнопки обновления и закрытия
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons"; // Иконка GitHub
import "../styles/card.css"; // Стили для карточки

// Импортируем пути к изображениям для рубашек карточек
import alexxxxxanderBack from "../assets/cardface/alexxxxxander-back.png";
import jab04kinBack from "../assets/cardface/jab04kin-back.png";
import butk1chBack from "../assets/cardface/butk1ch-back.png";
import spelloveBack from "../assets/cardface/spellove-back.png";
import defaultBack from "../assets/cardface/default-back.png";

// Импорт цветов для языков
import languageColorsData from "../utils/languageColors";

// Рубашки для участников
const cardBackImages = {
    Alexxxxxander: alexxxxxanderBack,
    Jab04kin: jab04kinBack,
    butk1ch: butk1chBack,
    SpelLOVE: spelloveBack,
    default: defaultBack,
};

// Octokit для GitHub API
const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
});

// Константы для кеширования
const CACHE_TTL = 3600000; // 1 час в миллисекундах

// Функция для получения данных из кеша
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
    }

    return data;
}

// Функция для сохранения данных в кеш
function setCachedData(key, data) {
    localStorage.setItem(
        key,
        JSON.stringify({
            data,
            timestamp: Date.now(),
        })
    );
}

const MemberCard = ({ member, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [languages, setLanguages] = useState([]); // Для хранения языков
    const [repoCount, setRepoCount] = useState(0); // Кол-во репозиториев

    // Загрузка данных о репозиториях и языках
    useEffect(() => {
        const fetchData = async () => {
            const cacheKey = `member_${member.login}_data`;
            const cachedData = getCachedData(cacheKey);

            if (cachedData) {
                setRepoCount(cachedData.repoCount);
                setLanguages(cachedData.languages);
                setLoading(false);
                return;
            }

            try {
                const { data: repos } = await octokit.repos.listForUser({
                    username: member.login,
                    per_page: 100,
                });

                const repoCount = repos.length;

                const aggregatedLanguages = {};
                for (const repo of repos) {
                    const { data: repoLanguages } = await octokit.repos.listLanguages({
                        owner: member.login,
                        repo: repo.name,
                    });
                    for (const [language, bytes] of Object.entries(repoLanguages)) {
                        aggregatedLanguages[language] =
                            (aggregatedLanguages[language] || 0) + bytes;
                    }
                }

                const sortedLanguages = Object.entries(aggregatedLanguages)
                    .sort(([, a], [, b]) => b - a)
                    .map(([language]) => language);

                setRepoCount(repoCount);
                setLanguages(sortedLanguages);

                // Сохранение в кеш
                setCachedData(cacheKey, { repoCount, languages: sortedLanguages });
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [member.login]);

    // Переключение переворота карточки
    const handleCardFlip = () => setIsFlipped(!isFlipped);

    // Получение рубашки карточки
    const cardBackImage = cardBackImages[member.login] || cardBackImages.default;

    return (
        <div className="card-container relative max-w-screen-lg mx-auto">
            <div className={`card ${isFlipped ? "flipped" : ""}`}>
                {/* Лицевая сторона */}
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
                            <h2 className="text-2xl font-bold text-center">
                                {member.name || member.login}
                            </h2>
                            <p className="text-center text-gray-500">@{member.login}</p>

                            {/* Список языков */}
                            <div className="languages mt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                    Используемые языки:
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {languages.length > 0 ? (
                                        languages.map((lang) => (
                                            <span
                                                key={lang}
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor:
                                                        languageColorsData[lang] || languageColorsData.Other,
                                                    color: "#fff",
                                                }}
                                            >
                        {lang}
                      </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Нет данных о языках.</p>
                                    )}
                                </div>
                            </div>

                            {/* Нижняя часть карточки */}
                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                {/* Иконка GitHub */}
                                <a
                                    href={member.html_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <FontAwesomeIcon icon={faGithub} size="2x" />
                                </a>

                                {/* Количество репозиториев */}
                                <span className="text-sm text-gray-700 font-semibold">
                  {repoCount} репозиториев
                </span>

                                {/* Кнопка поворота карточки */}
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

                {/* Обратная сторона */}
                <div
                    className="card-back bg-cover bg-center rounded-lg shadow-lg max-h-[90vh] overflow-hidden relative"
                    style={{
                        backgroundImage: `url(${cardBackImage})`,
                    }}
                >
                    {/* Кнопка поворота карточки */}
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
};

export default MemberCard;