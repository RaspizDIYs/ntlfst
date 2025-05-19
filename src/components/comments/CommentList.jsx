import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaQuoteRight } from 'react-icons/fa';

dayjs.extend(relativeTime);

const CommentList = ({ comments, userId, handleDelete, setText, setGifUrl, setEditId }) => {
    const commentBgClass = 'bg-gray-100 text-gray-800';

    return (
        <div className="flex flex-col space-y-2 w-full overflow-y-auto mb-2 items-center">
            {comments.length === 0 ? (
                <p className="text-center text-sm text-gray-500 mt-4">Комментариев пока нет</p>
            ) : (
                comments.map((c) => {
                    const isOwner = c.user_id === userId;
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
    );
};

export default CommentList;
