import { useState, useEffect, useContext } from 'react';
import { supabase } from '../api/supabaseClient';
import AuthContext from '../context/AuthContext';
import { FiSend, FiImage } from 'react-icons/fi';
import useThemeStore from '../store/useThemeStore';
import GifPicker from '../utils/GifPicker'; // путь подкорректировать

const Comments = () => {
    const { user } = useContext(AuthContext);
    const { isDark } = useThemeStore();

    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [gifUrl, setGifUrl] = useState('');
    const [showGifPicker, setShowGifPicker] = useState(false);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, gif_url, created_at, user_id, profiles(username)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Ошибка при загрузке комментариев:', error.message);
            return;
        }
        setComments(data);
    };

    useEffect(() => {
        void fetchComments();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        if ((!text.trim() && !gifUrl) || !user) return;

        const { error } = await supabase.from('comments').insert({
            content: text.trim() || null,
            gif_url: gifUrl || null,
            user_id: user.id,
        });

        if (error) {
            console.error('Ошибка при добавлении комментария:', error.message);
            return;
        }

        setText('');
        setGifUrl('');
        setShowGifPicker(false);
        void fetchComments();
    };

    const containerClasses = isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white';
    const commentBgClass = isDark ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white';

    return (
        <div
            className={`sidebar p-2 rounded-lg shadow-2xl flex flex-col justify-between max-w-[300px] my-6 transition-all duration-300 ${containerClasses}`}
            style={{
                height: 'calc(100vh - 50px)',
                overflowY: 'auto',
                margin: '0 auto',
                maxWidth: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* Список комментариев */}
            <div className="flex flex-col space-y-2 w-full overflow-y-auto mb-2 items-center" style={{ minHeight: '200px' }}>
                {comments.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 mt-4">Комментариев пока нет</p>
                ) : (
                    comments.map((c) => (
                        <div
                            key={c.id}
                            title={c.content}
                            className={`cursor-default p-2 rounded text-sm max-w-xs break-words shadow-sm ${commentBgClass}`}
                            style={{ borderLeft: '4px solid #3b82f6', width: '100%' }}
                        >
                            <strong>{c.profiles?.username || 'Anonymous'}:</strong>{' '}
                            {c.content && <span>{c.content}</span>}
                            {c.gif_url && (
                                <div className="mt-2">
                                    <img
                                        src={c.gif_url}
                                        alt="gif"
                                        className="max-w-full rounded"
                                        loading="lazy"
                                        draggable={false}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Форма комментария */}
            {user ? (
                <form onSubmit={submit} className="w-full flex flex-col space-y-1" style={{ minWidth: 0 }}>
                    {gifUrl && (
                        <div className="mb-1 relative">
                            <img src={gifUrl} alt="Selected GIF" className="max-w-full rounded" draggable={false} />
                            <button
                                type="button"
                                onClick={() => setGifUrl('')}
                                className="absolute top-0 right-0 text-red-500 bg-white rounded-full p-0.5 hover:bg-red-100 transition"
                                aria-label="Удалить выбранный GIF"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="flex items-center space-x-1">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="resize-none flex-grow p-2 border rounded text-sm max-h-24 overflow-y-auto"
                placeholder="Комментарий"
                rows={2}
                style={{ minWidth: 0, maxWidth: '100%' }}
            />

                        <button
                            type="button"
                            onClick={() => setShowGifPicker((show) => !show)}
                            className="flex items-center justify-center p-2 bg-gray-900 rounded hover:bg-blue-500 transition text-white"
                            aria-label="Открыть выбор GIF"
                            type="button"
                        >
                            <FiImage size={20} />
                        </button>

                        <button
                            type="submit"
                            className="flex items-center justify-center p-2 bg-gray-900 rounded hover:bg-blue-500 transition text-white"
                            aria-label="Отправить комментарий"
                        >
                            <FiSend size={20} />
                        </button>
                    </div>

                    {showGifPicker && (
                        <div className="mt-2">
                            <GifPicker
                                onSelectGif={(url) => {
                                    setGifUrl(url);
                                    setShowGifPicker(false);
                                }}
                            />
                        </div>
                    )}
                </form>
            ) : (
                <p className="text-center text-xs mt-auto px-2">Войдите для комментариев</p>
            )}
        </div>
    );
};

export default Comments;
