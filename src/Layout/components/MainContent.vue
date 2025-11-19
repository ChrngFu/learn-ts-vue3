<script setup lang="ts">
// Props
const props = defineProps<{
  sidebarExpanded: boolean;
}>();
</script>

<template>
  <t-layout>
    <!-- 主要内容容器 -->
    <t-content :class="['container', { 'sidebar-collapsed': !sidebarExpanded }]">
      <slot></slot>
    </t-content>

    <!-- 底部Footer -->
    <t-footer class="footer">
      <p>© 2025 Learn-TRAE - 版权所有</p>
    </t-footer>
  </t-layout>
</template>

<style scoped lang="scss">
// 让内部布局使用flex垂直排列
:deep(.t-layout) {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.container {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background-color: var(--content-bg);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  // 移除固定宽度和高度计算，由父布局自动适应
}

.footer {
  background-color: var(--footer-bg);
  border-top: 1px solid var(--footer-border);
  padding: 16px 24px;
  text-align: center;
  color: var(--footer-text);
  font-size: 14px;
  height: auto;
  flex-shrink: 0;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>