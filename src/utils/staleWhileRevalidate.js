export const staleWhileRevalidate = async (key, fetchData) => {
    // 1. Получить данные из локального кэша
    const cached = localStorage.getItem(key);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // 2. Проверить, если данные устарели
        if (Date.now() - timestamp < 3600000) { // 1 час
            // Возвращаем данные из кэша
            return { data, isStale: false };
        }
        // Данные устарели, возвращаем их, но продолжаем загрузку
        return { data, isStale: true };
    }

    // 3. Если данных нет, возвращаем null, чтобы вызвать загрузку
    return { data: null, isStale: true };
};

export const saveToCache = (key, data) => {
    localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
    );
};