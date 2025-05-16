import React from 'react';

const ErrorBanner = ({ message }) => (
    <div className="error-banner bg-red-100 border border-green-700 text-black px-4 py-3 rounded mb-4">
        <span className="font-bold">Ошибка:</span> {message}
        <button
            onClick={() => window.location.reload()}
            className="ml-2 bg-green-200 text-black px-2 py-1 rounded hover:bg-green-900"
        >
            Повторить
        </button>
    </div>
);

export default ErrorBanner;