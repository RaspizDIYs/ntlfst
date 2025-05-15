import {create} from 'zustand';

const useThemeStore = create((set) => ({
    isDark: true,
    toggleTheme: () =>
        set((state) => {
            const newTheme = !state.isDark;
            const html = document.documentElement;

            if (newTheme) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }

            return {isDark: newTheme};
        }),
}));

export default useThemeStore;
