import { useState, useEffect, useContext } from 'react';
import { supabase } from '../api/supabaseClient';
import AuthContext from '../context/AuthContext';
import { FiSend } from 'react-icons/fi';
import useThemeStore from '../store/useThemeStore'; // импорт темы

const Comments = () => {
    const { user } = useContext(AuthContext);
    const { isDark } = useThemeStore(); // получаем текущую тему

    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, profiles(username)')
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
        if (!text.trim() || !user) return;

        const { error } = await supabase.from('comments').insert({
            content: text,
            user_id: user.id,
        });

        if (error) {
            console.error('Ошибка при добавлении комментария:', error.message);
            return;
        }

        setText('');
        void fetchComments();
    };

    // Вычисляем классы для контейнера и комментариев в зависимости от темы
    const containerClasses = isDark
        ? "bg-white text-gray-900"
        : "bg-gray-900 text-white";

    const commentBgClass = isDark
        ? "bg-gray-100 text-gray-800"
        : "bg-gray-800 text-white";

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
            <div
                className="flex flex-col space-y-2 w-full overflow-y-auto mb-2 items-center"
                style={{ minHeight: '200px' }}
            >
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
                            <strong>{c.profiles?.username || 'Anonymous'}:</strong> {c.content}
                        </div>
                    ))
                )}
            </div>

            {/* Форма комментария */}
            {user ? (
                <form
                    onSubmit={submit}
                    className="w-full flex items-center space-x-1"
                    style={{ minWidth: 0 }}
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="resize-none flex-grow p-2 border rounded text-sm max-h-24 overflow-y-auto"
                        placeholder="Комментарий"
                        rows={2}
                        style={{ minWidth: 0, maxWidth: '100%' }}
                    />
                    <button
                        type="submit"
                        className="flex items-center justify-center p-2 bg-gray-900 rounded hover:bg-blue-500 transition text-white"
                        aria-label="Отправить комментарий"
                    >
                        <FiSend size={20} />
                    </button>
                </form>
            ) : (
                <p className="text-center text-xs mt-auto px-2">
                    Войдите для комментариев
                </p>
            )}
        </div>
    );
};

export default Comments;
