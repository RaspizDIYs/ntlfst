import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import AuthContext from '../context/AuthContext';
import { FiSend, FiSmile, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaQuoteRight } from 'react-icons/fa';
import useThemeStore from '../store/useThemeStore';
import GifPicker from '../utils/GifPicker';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Comments = () => {
    const { user } = useContext(AuthContext);
    const { isDark } = useThemeStore();

    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [gifUrl, setGifUrl] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showGifPicker, setShowGifPicker] = useState(false);

    const textareaRef = useRef(null);
    const containerRef = useRef(null);

    // Функция загрузки комментариев (с useCallback для оптимизации)
    const fetchComments = useCallback(async () => {
        try {
            setError(null);
            const { data, error } = await supabase
                .from('comments')
                .select('id, content, created_at, user_id, profiles(username), gif_url')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.error('Ошибка загрузки комментариев:', err);
            setError('Ошибка загрузки комментариев');
        }
    }, []);

    // Подписка на realtime обновления комментариев
    useEffect(() => {
        void fetchComments();

        const channel = supabase.channel('comments-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'comments' },
                () => void fetchComments()
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [fetchComments]);

    // Отправка нового или редактирование существующего комментария
    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !gifUrl) return;

        setLoading(true);
        setError(null);

        try {
            if (editId) {
                const { error } = await supabase
                    .from('comments')
                    .update({ content: text.trim(), gif_url: gifUrl })
                    .eq('id', editId);
                if (error) throw error;
                setEditId(null);
            } else {
                const { error } = await supabase.from('comments').insert({
                    content: text.trim(),
                    gif_url: gifUrl,
                    user_id: user.id,
                });
                if (error) throw error;
            }

            setText('');
            setGifUrl('');
            await fetchComments();

            // Скролл вверх (последний коммент сверху)
            if (containerRef.current) {
                containerRef.current.scrollTop = 0;
            }
        } catch (err) {
            console.error('Ошибка при отправке комментария:', err);
            setError('Не удалось отправить комментарий');
        } finally {
            setLoading(false);
        }
    };

    // Обработка Enter без Shift для сабмита
    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void submit(e);
        }
    };

    // Удаление комментария с подтверждением
    const handleDelete = async (id) => {
        if (!confirm('Удалить комментарий?')) return;

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.from('comments').delete().eq('id', id);
            if (error) throw error;
            if (editId === id) setEditId(null);
            await fetchComments();
        } catch (err) {
            console.error('Ошибка удаления комментария:', err);
            setError('Не удалось удалить комментарий');
        } finally {
            setLoading(false);
        }
    };

    // Классы для светлой/тёмной темы
    const containerClasses = isDark
        ? 'bg-gray-900 text-white'
        : 'bg-white text-gray-900';

    const commentBgClass = isDark
        ? 'bg-gray-800 text-white'
        : 'bg-gray-100 text-gray-800';

    return (
        <div
            ref={containerRef}
            className={`p-2 rounded-lg shadow-2xl flex flex-col justify-between w-[600px] my-6 transition-all duration-300 ${containerClasses}`}
            style={{ height: 'calc(100vh - 50px)', overflowY: 'auto', margin: '0 auto' }}
        >
            <div className="flex flex-col space-y-2 w-full overflow-y-auto mb-2 items-center">
                {error && <p className="text-red-500 text-center">{error}</p>}

                {comments.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 mt-4">Комментариев пока нет</p>
                ) : (
                    comments.map((c) => {
                        const isOwner = c.user_id === user?.id;
                        return (
                            <div
                                key={c.id}
                                className={`relative p-2 rounded text-sm max-w-xl w-full break-words shadow-sm ${commentBgClass}`}
                                style={{ borderLeft: '4px solid #3b82f6' }}
                            >
                                <div className="flex justify-between items-center">
                                    <strong>{c.profiles?.username || 'Anonymous'}</strong>
                                    <span className="text-xs text-gray-400 ml-2">{dayjs(c.created_at).fromNow()}</span>
                                </div>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{c.content}</p>
                                {c.gif_url && (
                                    <img
                                        src={c.gif_url}
                                        alt="gif"
                                        className="mt-2 w-full max-h-48 object-contain rounded"
                                        loading="lazy"
                                    />
                                )}
                                <div className="mt-2 flex space-x-3 text-xs text-gray-500">
                                    <button
                                        type="button"
                                        aria-label="Лайк"
                                        className="hover:text-red-500"
                                        onClick={() => { /* Реализация лайка по желанию */ }}
                                    >
                                        ❤️
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Цитировать"
                                        onClick={() => setText(`> ${c.content}\n`)}
                                        className="hover:text-blue-500"
                                    >
                                        <FaQuoteRight size={14} />
                                    </button>
                                    {isOwner && (
                                        <>
                                            <button
                                                type="button"
                                                aria-label="Редактировать"
                                                onClick={() => {
                                                    setText(c.content);
                                                    setGifUrl(c.gif_url || '');
                                                    setEditId(c.id);
                                                    textareaRef.current?.focus();
                                                }}
                                                className="hover:text-yellow-500"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Удалить"
                                                onClick={() => handleDelete(c.id)}
                                                className="hover:text-red-600"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {user ? (
                <form onSubmit={submit} className="w-full flex flex-col gap-2" autoComplete="off">
          <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Комментарий"
              className="resize-none p-2 border rounded text-sm max-h-24 overflow-y-auto"
              rows={2}
              disabled={loading}
              spellCheck={false}
              aria-label="Текст комментария"
          />
                    {gifUrl && (
                        <div className="relative">
                            <img src={gifUrl} alt="Выбранный gif" className="w-32 rounded" loading="lazy" />
                            <button
                                type="button"
                                onClick={() => setGifUrl('')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1"
                                aria-label="Удалить gif"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowGifPicker((prev) => !prev)}
                            className="text-gray-500 hover:text-blue-500"
                            aria-label="Выбрать gif"
                            title="Выбрать gif"
                        >
                            <FiSmile size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            aria-label="Отправить комментарий"
                        >
                            <FiSend size={20} />
                        </button>
                    </div>
                    {showGifPicker && (
                        <GifPicker
                            onSelectGif={(url) => {
                                setGifUrl(url);
                                setShowGifPicker(false);
                                textareaRef.current?.focus();
                            }}
                        />
                    )}
                </form>
            ) : (
                <p className="text-center text-gray-500 py-2">Войдите, чтобы оставлять комментарии</p>
            )}
        </div>
    );
};

export default Comments;
