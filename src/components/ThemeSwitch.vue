<template>
  <div class="theme-switch-container">
    <button class="theme-btn" :class="{ active: currentTheme === 'light' }" @click="setTheme('light')" title="浅色主题">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
        />
      </svg>
    </button>
    <button class="theme-btn" :class="{ active: currentTheme === 'dark' }" @click="setTheme('dark')" title="暗色主题">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"
        />
      </svg>
    </button>
    <button
      class="theme-btn"
      :class="{ active: currentTheme === 'system' }"
      @click="setTheme('system')"
      title="系统默认主题"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M11.37,5.51C11.19,6.15,11.1,6.82,11.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C19.45,17.19,16.93,19,14,19 c-3.86,0-7-3.14-7-7C7,9.07,8.81,6.55,11.37,5.51z M14,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C14.92,3.04,14.46,3,14,3L14,3z M2,13h2v2H2V13z M18,2v2h2V2H18z M20,22h2v-2h-2V22z M2,2v2h2V2H2z M4.22,15.66l1.42-1.42l1.42,1.42L5.64,17.08L4.22,15.66z M16.92,7.78 l1.42,1.42l-1.42,1.42L15.5,9.2l1.42-1.42z M18,16.92l1.42,1.42L19.41,18l-1.42-1.42L18,16.92z M7.78,7.08l1.42,1.42L9.2,7.08l-1.42-1.42 L7.78,7.08z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { themeManager } from "@/utils/themeManager";
  import type { ThemeType } from "@/utils/themeManager";

  // 响应式变量存储当前主题
  const currentTheme = ref<ThemeType>("system");

  // 定义事件
  const emit = defineEmits<{
    themeChange: [theme: ThemeType];
  }>();

  // 设置主题
  const setTheme = (theme: ThemeType) => {
    themeManager.setTheme(theme);
    currentTheme.value = theme;
    emit("themeChange", theme);
    // 根据实际应用的主题（考虑system模式下的系统设置）设置theme-mode属性
    const isDark = theme === "dark" || (theme === "system" && themeManager.isDarkMode());
    if (isDark) {
      // 设置深色模式
      document.documentElement.setAttribute("theme-mode", "dark");
    } else {
      // 设置浅色模式
      document.documentElement.removeAttribute("theme-mode");
    }
  };

  // 组件挂载时初始化
  onMounted(() => {
    // 从themeManager获取当前主题
    currentTheme.value = themeManager.getTheme();

    // 初始化theme-mode属性
    const isDark = themeManager.isDarkMode();
    if (isDark) {
      document.documentElement.setAttribute("theme-mode", "dark");
    } else {
      document.documentElement.removeAttribute("theme-mode");
    }

    // 注册主题变化监听器
    const unsubscribe = themeManager.onThemeChange((theme, isDark) => {
      currentTheme.value = theme;
      // 更新theme-mode属性
      if (isDark) {
        document.documentElement.setAttribute("theme-mode", "dark");
      } else {
        document.documentElement.removeAttribute("theme-mode");
      }
    });

    // 组件卸载时取消注册
    onUnmounted(() => {
      unsubscribe();
    });
  });
</script>

<style scoped lang="scss">
  .theme-switch-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.05);

    .theme-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      background-color: transparent;
      color: currentColor;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      &.active {
        background-color: rgba(64, 169, 255, 0.2);
        color: #40a9ff;
        box-shadow: 0 2px 8px rgba(64, 169, 255, 0.3);
      }

      // 暗色主题下的样式
      :global(.dark) & {
        background-color: rgba(255, 255, 255, 0.05);

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        &.active {
          background-color: rgba(64, 169, 255, 0.3);
          color: #69c0ff;
          box-shadow: 0 2px 8px rgba(64, 169, 255, 0.4);
        }
      }
    }
  }
</style>
