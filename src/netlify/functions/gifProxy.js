import fetch from 'node-fetch';

export async function handler(event) {
    const API_KEY = process.env.TENOR_API_KEY;
    const { q = '', limit = 20 } = event.queryStringParameters || {};

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'TENOR_API_KEY не настроен' }),
        };
    }

    const baseUrl = q
        ? `https://tenor.googleapis.com/v2/search?key=${API_KEY}&q=${encodeURIComponent(q)}&limit=${limit}`
        : `https://tenor.googleapis.com/v2/trending?key=${API_KEY}&limit=${limit}`;

    try {
        const response = await fetch(baseUrl);

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET',
                },
                body: JSON.stringify({ error: `Ошибка от Tenor API: ${response.status}` }),
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET',
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
}
