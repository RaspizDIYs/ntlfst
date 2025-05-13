import { supabase } from './client';

// Вход по email и паролю
export const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

// Регистрация
export const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
};

// Отправить magic link (если используется)
export const signInWithMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data;
};

// Получить текущего пользователя
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

// Выйти
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Подписка на события сессии
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};
