<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";
import MainContent from "./components/MainContent.vue";

// 侧边栏展开状态
const sidebarExpanded = ref(true);

// 切换侧边栏展开状态
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
};
</script>

<template>
  <t-layout class="app-layout">
    <!-- 侧边栏 -->
    <Sidebar :expanded="sidebarExpanded" />
    
    <!-- 主内容区域 -->
    <t-layout>
      <!-- 顶部Header -->
      <Header :expanded="sidebarExpanded" @toggle="toggleSidebar" />
      
      <!-- 主要内容容器和页脚 -->
      <MainContent :sidebar-expanded="sidebarExpanded">
        <slot></slot>
      </MainContent>
    </t-layout>
  </t-layout>
</template>

<style scoped lang="scss">
.app-layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background-color: var(--bg-primary);
  transition: var(--transition-base);
}

// 主内容区域的容器
:deep(.t-layout:last-child) {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

// 确保所有子组件都应用过渡动画
:deep(.t-layout),
:deep(.t-sider),
:deep(.t-header),
:deep(.t-content),
:deep(.t-footer) {
  transition: var(--transition-base);
}
</style>
