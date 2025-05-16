import React, { useState, useEffect, useCallback } from 'react';

const LIMIT = 20;
const DEBOUNCE_DELAY = 300;

const GifPicker = ({ onSelectGif }) => {
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    // Дебаунс для поиска
    const fetchGifs = useCallback(
        async (searchTerm = '') => {
            setLoading(true);
            setError(null);

            try {
                const url = searchTerm
                    ? `/.netlify/functions/gifProxy?q=${encodeURIComponent(searchTerm)}&limit=${LIMIT}`
                    : `/.netlify/functions/gifProxy?limit=${LIMIT}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);

                const data = await response.json();

                if (!data?.results || !Array.isArray(data.results)) {
                    throw new Error('Неверный формат ответа API');
                }

                // Tenor v2 возвращает media_formats внутри results[].media_formats
                const gifsData = data.results
                    .map((gif) => {
                        // Приоритет выбора gif.url по media_formats (gif, mediumgif)
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

    // useEffect для начальной загрузки трендов
    useEffect(() => {
        fetchGifs();
    }, [fetchGifs]);

    // Дебаунс хук
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchGifs(search.trim());
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [search, fetchGifs]);

    return (
        <div>
            <input
                type="text"
                placeholder="Поиск гифок..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 10, padding: 6, width: '100%' }}
                aria-label="Поиск гифок"
                autoComplete="off"
            />

            {loading && <p>Загрузка гифок...</p>}
            {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {gifs.map(({ id, url, title }) => (
                    <img
                        key={id}
                        src={url}
                        alt={title || 'GIF'}
                        style={{ width: 100, height: 100, objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => onSelectGif && onSelectGif(url)}
                        title="Выбрать гифку"
                        loading="lazy"
                    />
                ))}
            </div>
        </div>
    );
};

export default GifPicker;
