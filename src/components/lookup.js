// lookup.js — функция для получения доменов
import { supabase } from './supabaseClient.js';

export async function getDomains() {
    const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Ошибка при получении данных:', error);
        return [];
    }

    return data;
}
