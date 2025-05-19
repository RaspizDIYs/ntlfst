import React from 'react';
import { FiSend, FiSmile } from 'react-icons/fi';

const CommentForm = ({
                         text,
                         setText,
                         gifUrl,
                         setGifUrl,
                         submit,
                         loading,
                         textareaRef,
                         showGifPicker,
                         setShowGifPicker,
                     }) => {
    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit(e);
        }
    };

    return (
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
        </form>
    );
};

export default CommentForm;
