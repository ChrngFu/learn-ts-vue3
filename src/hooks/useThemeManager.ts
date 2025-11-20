import { ref, onMounted, onUnmounted } from 'vue';
import themeManager from '../utils/themeManager';
import type { ThemeType } from '../utils/themeManager';

export function useThemeManager() {
  const isDarkMode = ref(themeManager.isDarkMode());
  const currentTheme = ref(themeManager.getTheme());

  const updateThemeState = (theme: ThemeType, dark: boolean) => {
    isDarkMode.value = dark;
    currentTheme.value = theme;
  };

  onMounted(() => {
    // 获取取消注册函数
    const unsubscribe = themeManager.onThemeChange(updateThemeState);
    
    // 在组件卸载时取消注册
    onUnmounted(() => {
      unsubscribe();
    });
  });

  // 提供额外的方法来切换主题
  const setTheme = (theme: ThemeType) => {
    themeManager.setTheme(theme);
  };

  const cycleTheme = () => {
    themeManager.cycleTheme();
  };

  return {
    isDarkMode,
    currentTheme,
    setTheme,
    cycleTheme
  };
}