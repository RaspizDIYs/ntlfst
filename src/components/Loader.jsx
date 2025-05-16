import React from 'react';

const Loader = () => (
    <div className="loader">
        <div className="spinner animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
        <span className="ml-2">Загрузка...</span>
    </div>
);

export default Loader;