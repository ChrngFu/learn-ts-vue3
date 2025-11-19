// 主题管理工具类

// 主题类型定义
export type ThemeType = 'light' | 'dark' | 'system';

class ThemeManager {
  private currentTheme: ThemeType = 'system';
  private systemThemeListener: MediaQueryList | null = null;
  private themeChangeHandlers: ((theme: ThemeType, isDark: boolean) => void)[] = [];

  constructor() {
    // 初始化时从localStorage读取主题设置
    this.initTheme();
  }

  /**
   * 初始化主题设置
   */
  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
    this.setupSystemThemeListener();
  }

  /**
   * 验证主题类型是否有效
   */
  private isValidTheme(theme: string): theme is ThemeType {
    return ['light', 'dark', 'system'].includes(theme);
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeType): void {
    if (!this.isValidTheme(theme)) {
      console.error('Invalid theme type:', theme);
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  /**
   * 获取当前主题
   */
  getTheme(): ThemeType {
    return this.currentTheme;
  }

  /**
   * 判断当前是否为暗色主题
   */
  isDarkMode(): boolean {
    if (this.currentTheme === 'dark') {
      return true;
    }
    if (this.currentTheme === 'light') {
      return false;
    }
    // 系统主题模式下，检查系统设置
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(): void {
    const isDark = this.isDarkMode();
    document.documentElement.classList.toggle('dark', isDark);
    
    // 通知所有注册的处理函数
    this.notifyThemeChangeHandlers(isDark);
  }

  /**
   * 设置系统主题变化监听器
   */
  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      this.systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = () => {
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      };

      this.systemThemeListener.addEventListener('change', handleSystemThemeChange);

      // 清理函数
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          if (this.systemThemeListener) {
            this.systemThemeListener.removeEventListener('change', handleSystemThemeChange);
          }
        });
      }
    }
  }

  /**
   * 注册主题变化处理函数
   */
  onThemeChange(handler: (theme: ThemeType, isDark: boolean) => void): () => void {
    this.themeChangeHandlers.push(handler);
    
    // 返回取消注册函数
    return () => {
      this.themeChangeHandlers = this.themeChangeHandlers.filter(h => h !== handler);
    };
  }

  /**
   * 通知所有主题变化处理函数
   */
  private notifyThemeChangeHandlers(isDark: boolean): void {
    this.themeChangeHandlers.forEach(handler => {
      try {
        handler(this.currentTheme, isDark);
      } catch (error) {
        console.error('Error in theme change handler:', error);
      }
    });
  }

  /**
   * 切换到下一个主题（循环切换）
   */
  cycleTheme(): void {
    const themes: ThemeType[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }
}

// 导出单例实例
export const themeManager = new ThemeManager();

// 默认导出
export default themeManager;