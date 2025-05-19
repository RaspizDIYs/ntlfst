import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import AuthContext from '@/context/AuthContext';
import { FiSend, FiSmile, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaQuoteRight } from 'react-icons/fa';
import useThemeStore from '@/store/useThemeStore';
import GifPicker from '@/utils/GifPicker';
import { ValidationError, validateComment } from '@/utils/validateComment.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Comments = () => {
    const { user } = useContext(AuthContext);
    const { isDark } = useThemeStore();

    // Инвертируем тему для панели комментариев
    const isPanelDark = !isDark;

    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [gifUrl, setGifUrl] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showGifPicker, setShowGifPicker] = useState(false);

    const textareaRef = useRef(null);
    const containerRef = useRef(null);

    const fetchComments = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('comments_with_user')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.error('Ошибка загрузки комментариев:', err);
            setError('Не удалось загрузить комментарии');
        }
    }, []);

    useEffect(() => {
        void fetchComments();
        const channel = supabase
            .channel('comments-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'comments',
            }, () => fetchComments())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchComments]);

    const submit = async (e) => {
        e.preventDefault();

        try {
            const { text: validText, gifUrl: validGifUrl } = validateComment(text, gifUrl);
            setText(validText);
            setGifUrl(validGifUrl);

            setLoading(true);
            setError(null);

            if (editId) {
                const { error } = await supabase
                    .from('comments')
                    .update({ content: validText, gif_url: validGifUrl })
                    .eq('id', editId);
                if (error) throw error;
                setEditId(null);
            } else {
                const { error } = await supabase.from('comments').insert({
                    content: validText,
                    gif_url: validGifUrl,
                    user_id: user.id,
                });
                if (error) throw error;
            }

            setText('');
            setGifUrl('');
        } catch (validationError) {
            if (validationError instanceof ValidationError) {
                setError(validationError.message);
                textareaRef.current?.focus();
                return;
            }

            console.error('Ошибка отправки комментария:', validationError);
            setError('Не удалось отправить комментарий');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить комментарий?')) return;

        try {
            const { error } = await supabase.from('comments').delete().eq('id', id);
            if (error) throw error;
            if (editId === id) setEditId(null);
        } catch (err) {
            console.error('Ошибка удаления:', err);
            setError('Не удалось удалить комментарий');
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void submit(e);
        }
    };

    // Классы для панели и комментариев с инверсией темы
    const containerClasses = isPanelDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';
    const commentBgClass = isPanelDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800';

    return (
        <div
            ref={containerRef}
            className={`p-2 rounded-lg shadow-2xl flex flex-col justify-between w-[600px] my-6 ${containerClasses}`}
            style={{ height: 'calc(100vh - 50px)', overflowY: 'auto', margin: '0 auto' }}
        >
            <div className="flex flex-col space-y-2 w-full overflow-y-auto mb-2 items-center">
                {error && <p className="text-red-500 text-center">{error}</p>}
                {comments.length === 0 ? (
                    <p className={`text-center text-sm ${isPanelDark ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
                        Комментариев пока нет
                    </p>
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
                                    <strong>{c.username}</strong>
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
                                    <button type="button" className="hover:text-red-500">❤️</button>
                                    <button
                                        type="button"
                                        onClick={() => setText(`> ${c.content}\n`)}
                                        className="hover:text-blue-500"
                                    >
                                        <FaQuoteRight size={14} />
                                    </button>
                                    {isOwner && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setText(c.content);
                                                    setGifUrl(c.gif_url);
                                                    setEditId(c.id);
                                                    textareaRef.current?.focus();
                                                }}
                                                className="hover:text-yellow-500"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(c.id)}
                                                className="hover:text-red-500"
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

            <form onSubmit={submit} className="mt-auto flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowGifPicker(!showGifPicker)}
                        aria-label="GIF"
                        className="hover:text-purple-500"
                    >
                        <FiSmile size={20} />
                    </button>
                    <textarea
                        ref={textareaRef}
                        rows={3}
                        placeholder="Напишите комментарий..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="w-full p-2 border rounded resize-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                        <FiSend size={20} />
                    </button>
                </div>
                {gifUrl && (
                    <div className="relative">
                        <img src={gifUrl} alt="Выбранный GIF" className="max-h-32 object-contain rounded" />
                        <button
                            type="button"
                            onClick={() => setGifUrl('')}
                            className="absolute top-0 right-0 text-red-600 hover:text-red-800"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {showGifPicker && <GifPicker onSelect={(url) => { setGifUrl(url); setShowGifPicker(false); }} />}
            </form>
        </div>
    );
};

export default Comments;
