import { supabase } from '../lib/supabaseClient.js';

export async function getDomains({ signal } = {}) {
    const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(signal);

    if (error) {
        throw new Error(`Ошибка загрузки доменов: ${error.message}`);
    }

    if (signal?.aborted) {
        return [];
    }

    return data;
}

export async function addDomain(domain) {
    const { data, error } = await supabase
        .from('domains')
        .insert([{ domain }]);

    if (error) {
        throw new Error(`Ошибка при добавлении домена: ${error.message}`);
    }

    return data;
}