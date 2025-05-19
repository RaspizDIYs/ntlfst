export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Проверяет валидность текста и gif перед отправкой комментария.
 * @param {string} text — текст комментария
 * @param {string} gifUrl — URL выбранного gif
 * @returns {{ text: string, gifUrl: string }} — очищенные значения
 */
export function validateComment(text, gifUrl) {
    const trimmed = text?.trim() || '';
    const cleanedGifUrl = gifUrl?.trim() || '';

    const isEmpty = trimmed.length === 0 && cleanedGifUrl.length === 0;
    if (isEmpty) {
        throw new ValidationError('Комментарий не может быть пустым.');
    }

    if (trimmed.length > 1000) {
        throw new ValidationError('Комментарий слишком длинный (макс. 1000 символов).');
    }

    // Пример доп. проверки GIF (если нужно ограничить только Giphy)
    // const validGifDomain = /^https:\/\/media\.giphy\.com\//;
    // if (cleanedGifUrl && !validGifDomain.test(cleanedGifUrl)) {
    //     throw new ValidationError('GIF должен быть с сайта Giphy.');
    // }

    return { text: trimmed, gifUrl: cleanedGifUrl };
}
