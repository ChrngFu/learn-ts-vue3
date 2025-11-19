<script setup lang="ts">
  import ThemeSwitch from "@/components/ThemeSwitch.vue";

  // Props
  const props = defineProps<{
    expanded: boolean;
  }>();

  // Emits
  const emit = defineEmits<{
    toggle: [];
  }>();

  // 切换侧边栏展开状态
  const toggleSidebar = () => {
    // emit('toggle');
  };

  // 主题变化处理函数
  const handleThemeChange = (theme: string) => {
    console.log("主题已切换为:", theme);
  };
</script>

<template>
  <t-header class="header">
    <div class="header-content">
      <div class="header-left">
        <t-button variant="text" size="small" @click="toggleSidebar">
          <template #icon>
            <t-icon :name="expanded ? 'menu-fold' : 'menu-unfold'" />
          </template>
        </t-button>
      </div>
      <div class="header-right">
        <ThemeSwitch @theme-change="handleThemeChange" />
        <t-avatar class="user-avatar">用户</t-avatar>
      </div>
    </div>
  </t-header>
</template>

<style scoped lang="scss">
  .header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    height: 64px;
    padding: 0;
    transition: var(--transition-base);

    .header-content {
      height: 100%;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-avatar {
      cursor: pointer;
    }
  }
</style>
