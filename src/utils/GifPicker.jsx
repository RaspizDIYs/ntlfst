import { useState, useEffect } from 'react';

const TENOR_API_KEY = 'AIzaSyDop1L4TXu0HQhNUOxE4FmoA5c67-7LYxM';

const GifPicker = ({ onSelectGif }) => {
    const [gifs, setGifs] = useState([]);
    const [search, setSearch] = useState('');

    const fetchGifs = async (query = '') => {
        const url = query
            ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=12`
            : `https://tenor.googleapis.com/v2/trending?key=${TENOR_API_KEY}&limit=12`;

        try {
            const res = await fetch(url);
            const json = await res.json();

            // Защита: если json.results — не массив, поставить пустой массив
            const results = Array.isArray(json.results) ? json.results : [];
            setGifs(results);
        } catch (err) {
            console.error('Ошибка при загрузке GIF:', err);
            setGifs([]);
        }
    };

    useEffect(() => {
        void fetchGifs();
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            void fetchGifs(search);
        }
    };

    return (
        <div className="border rounded p-2 bg-gray-100 max-h-48 overflow-y-auto">
            <input
                type="text"
                placeholder="Поиск GIF"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onSearchKeyDown}
                className="w-full p-1 border rounded mb-2"
            />
            <div className="grid grid-cols-4 gap-2">
                {gifs.map((gif) => {
                    // Подстраховка на структуру объекта GIF из Tenor API
                    const gifUrl =
                        gif.media_formats?.gif?.url ||
                        (gif.media && gif.media[0]?.gif?.url) ||
                        '';
                    const description = gif.content_description || 'gif';

                    if (!gifUrl) return null;

                    return (
                        <img
                            key={gif.id}
                            src={gifUrl}
                            alt={description}
                            className="cursor-pointer rounded hover:opacity-80"
                            onClick={() => onSelectGif(gifUrl)}
                            loading="lazy"
                            draggable={false}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default GifPicker;
