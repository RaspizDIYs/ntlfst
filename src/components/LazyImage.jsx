import React, { lazy, Suspense } from 'react';

// Ленивая загрузка изображения
const ImageComponent = ({ src, alt }) => (
    <img src={src} alt={alt} className="w-full h-auto rounded-lg" />
);

const LazyImage = lazy(() => Promise.resolve({ default: ImageComponent }));

const LazyImageWrapper = ({ src, alt }) => {
    return (
        <Suspense fallback={<div>Loading image...</div>}>
            <LazyImage src={src} alt={alt} />
        </Suspense>
    );
};

export default LazyImageWrapper;