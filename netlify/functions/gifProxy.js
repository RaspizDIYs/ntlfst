import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';

const key = process.env.VITE_TENOR_API_KEY;
const clientKey = 'raspizDIY_app_gif';

const limiter = new Bottleneck({ minTime: 1000 });

const cache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 сек

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET',
};

async function fetchWithLimiter(url) {
    return limiter.schedule(() => fetch(url));
}

export async function handler(event) {
    if (!key) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'TENOR_API_KEY не настроен' }),
            headers: corsHeaders,
        };
    }

    const { q = '', limit = 20, pos = '' } = event.queryStringParameters || {};
    const safeQuery = q.trim() || 'funny';
    const safeLimit = Math.min(parseInt(limit, 10) || 20, 50); // ограничение Tenor
    const safePos = encodeURIComponent(pos);

    const url = `https://tenor.googleapis.com/v2/search?key=${key}&client_key=${clientKey}&q=${encodeURIComponent(safeQuery)}&limit=${safeLimit}${pos ? `&pos=${safePos}` : ''}`;

    const now = Date.now();
    const cacheKey = `${safeQuery}|${safeLimit}|${safePos}`;
    const cached = cache.get(cacheKey);

    if (cached && cached.expires > now) {
        return {
            statusCode: 200,
            body: JSON.stringify(cached.data),
            headers: corsHeaders,
        };
    }

    try {
        const response = await fetchWithLimiter(url);

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Ошибка от Tenor API: ${response.status}` }),
                headers: corsHeaders,
            };
        }

        const data = await response.json();
        cache.set(cacheKey, { data, expires: now + CACHE_TTL_MS });

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: corsHeaders,
        };
    } catch (error) {
        console.error('gifProxy error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: corsHeaders,
        };
    }
}
