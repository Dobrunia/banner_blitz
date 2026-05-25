import { ref } from 'vue';

export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function useTheme() {
  const theme = ref<ThemeName>((localStorage.getItem(STORAGE_KEY) as ThemeName | null) ?? 'light');

  function applyTheme(nextTheme: ThemeName): void {
    theme.value = nextTheme;
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  function toggleTheme(): void {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  applyTheme(theme.value);

  return {
    theme,
    toggleTheme,
    applyTheme,
  };
}
