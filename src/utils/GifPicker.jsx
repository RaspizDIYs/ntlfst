import React, { useState, useEffect, useCallback } from 'react';

const LIMIT = 20;
const DEBOUNCE_DELAY = 300;

const GifPicker = ({ onSelectGif }) => {
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(null);

    const fetchGifs = useCallback(
        async (searchTerm = '', offsetValue = 0) => {
            setLoading(true);
            setError(null);

            try {
                const query = searchTerm || 'funny';
                const url = `/.netlify/functions/gifProxy?q=${encodeURIComponent(query)}&limit=${LIMIT}&offset=${offsetValue}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);

                const data = await response.json();

                if (!data?.results || !Array.isArray(data.results)) {
                    throw new Error('Неверный формат ответа API');
                }

                const gifsData = data.results
                    .map((gif) => {
                        const url =
                            gif.media_formats?.gif?.url ||
                            gif.media_formats?.mediumgif?.url ||
                            '';

                        return {
                            id: gif.id,
                            url,
                            title: gif.content_description || '',
                        };
                    })
                    .filter((gif) => gif.url);

                setGifs(gifsData);
                setTotalCount(data.results.length < LIMIT ? offsetValue + gifsData.length : null);
            } catch (err) {
                console.error('Ошибка загрузки гифок:', err);
                setError(err.message);
                setGifs([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchGifs(search.trim(), offset);
    }, [fetchGifs, search, offset]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setOffset(0); // сброс при новом запросе
    };

    return (
        <div className="p-2 border rounded bg-white dark:bg-gray-800">
            <input
                type="text"
                placeholder="Поиск гифок..."
                value={search}
                onChange={handleSearch}
                className="w-full p-2 mb-3 border rounded"
                aria-label="Поиск гифок"
                autoComplete="off"
            />

            {loading && <p className="text-sm text-gray-500">Загрузка гифок...</p>}
            {error && <p className="text-red-500 text-sm">Ошибка: {error}</p>}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {gifs.map(({ id, url, title }) => (
                    <img
                        key={id}
                        src={url}
                        alt={title || 'GIF'}
                        className="w-full h-24 object-cover cursor-pointer hover:opacity-80"
                        onClick={() => onSelectGif?.(url)}
                        title="Выбрать гифку"
                        loading="lazy"
                    />
                ))}
            </div>

            <div className="flex justify-between items-center mt-3 text-sm">
                <button
                    onClick={() => setOffset((prev) => Math.max(0, prev - LIMIT))}
                    disabled={offset === 0}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                    ← Назад
                </button>
                <span className="text-gray-500">
          Страница {Math.floor(offset / LIMIT) + 1}
        </span>
                <button
                    onClick={() => setOffset((prev) => prev + LIMIT)}
                    disabled={totalCount !== null && offset + LIMIT >= totalCount}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                    Вперёд →
                </button>
            </div>
        </div>
    );
};

export default GifPicker;
