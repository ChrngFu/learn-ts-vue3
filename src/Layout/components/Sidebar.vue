<script setup lang="ts">
  import { ref, onMounted, getCurrentInstance } from "vue";
  import { useRouter } from "vue-router";
  import type { Menu } from "tdesign-vue-next";
  import { MenuProps } from "tdesign-vue-next";
  import { routes, generateMenuFromRoutes } from "@/router/index";
  import themeManager from "@/utils/themeManager";

  // 获取当前组件实例以访问全局属性
  const instance = getCurrentInstance();
  const globalProperties = instance?.appContext.config.globalProperties;

  // 调试函数，检查主题值
  const debugTheme = () => {
    console.log("Theme Manager Dark Mode:", themeManager.isDarkMode());
    console.log("Global Properties Theme:", globalProperties?.$theme);
    console.log("Root Theme:", instance?.proxy?.$root?.$theme);
  };

  onMounted(() => {
    // 初始化时执行一次调试
    debugTheme();

    // 监听主题变化
    themeManager.onThemeChange((_theme, isDark) => {
      currentTheme.value = isDark ? "dark" : "light";
      console.log("Theme changed to:", currentTheme.value);
    });
  });

  // 其他初始化代码...

  const router = useRouter();

  // Props
  const props = defineProps<{
    expanded: boolean;
  }>();

  // 响应式主题变量
  const currentTheme = ref(themeManager.isDarkMode() ? "dark" : "light");

  // 菜单数据
  const menuItems = ref<Menu.Item[]>([]);

  // 当前选中的菜单项
  const currentSelectedKeys = ref<string[]>([]);

  // 当前选中的菜单项
  const activeMenu = ref<string>("");

  // 初始化菜单数据
  onMounted(() => {
    // 从路由生成菜单，传入空字符串作为父路径
    const generatedMenu = generateMenuFromRoutes(routes, "");
    menuItems.value = generatedMenu;
    // 设置当前选中项
    updateSelectedKeys();
    // 更新活动菜单（用于页面刷新时）
    updateActiveMenu();

    // 监听路由变化，更新选中状态和活动菜单
    router.afterEach(() => {
      updateSelectedKeys();
      updateActiveMenu();
    });
  });

  // 更新选中的菜单项
  const updateSelectedKeys = () => {
    const currentRoute = router.currentRoute.value;
    // 使用路由路径设置选中项，与菜单的 value 属性对应
    currentSelectedKeys.value = [currentRoute.path];
  };

  // 根据当前路由设置活动菜单
  const updateActiveMenu = () => {
    const currentRoute = router.currentRoute.value;
    activeMenu.value = currentRoute.path;
    console.log("Updated active menu to:", activeMenu.value);
  };

  // 处理菜单点击事件
  const changeHandler: MenuProps["onChange"] = active => {
    activeMenu.value = active as string;
    router.push(active as string);
  };
</script>

<template>
  <t-aside :width="expanded ? '250px' : '64px'" class="sidebar" :collapsed="!expanded">
    <div class="sidebar-header">
      <div class="logo-container">
        <img v-if="!expanded" src="@/assets/logo.png" alt="Logo" class="logo-icon" />
        <h2 v-else class="logo-text">Learn-TRAE</h2>
      </div>
    </div>
    <!-- 使用模板方式渲染菜单，确保正确包含 t-menu-item 组件 -->
    <t-menu
      :default-expanded="['user']"
      :default-value="activeMenu"
      :value="activeMenu"
      :selected="currentSelectedKeys"
      mode="vertical"
      :collapsed="!expanded"
      :theme="currentTheme"
      @change="changeHandler"
    >
      <!-- 通过 v-for 循环渲染菜单 -->
      <template v-for="menu in menuItems" :key="menu.key">
        <!-- 如果菜单项有子菜单 -->
        <t-submenu v-if="menu.children && menu.children.length > 0" :value="menu.key">
          <template #title>
            <span>{{ menu.label }}</span>
          </template>
          <!-- 渲染子菜单 -->
          <t-menu-item v-for="child in menu.children" :key="child.key" :value="child.value || child.key">
            {{ child.label }}
          </t-menu-item>
        </t-submenu>
        <!-- 如果是普通菜单项 -->
        <t-menu-item v-else :value="menu.value || menu.key">
          {{ menu.label }}
        </t-menu-item>
      </template>
    </t-menu>
  </t-aside>
</template>

<style scoped lang="scss">
  .sidebar {
    background-color: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    color: var(--sidebar-text);
    transition: width 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
    overflow: hidden;

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: border-color 0.3s ease;

      .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;

        .logo-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .logo-text {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          white-space: nowrap;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }
      }

      .toggle-btn {
        opacity: 0.6;
        color: var(--text-secondary);
        transition: opacity 0.3s ease, color 0.3s ease;

        &:hover {
          opacity: 1;
          color: var(--text-primary);
        }
      }
    }

    :deep(.t-menu) {
      padding: 10px;
      width: 100%;
      background-color: transparent;
      color: var(--sidebar-text);
      transition: color 0.3s ease;

      // 调整菜单项颜色
      & .t-menu__item {
        color: var(--sidebar-text);

        &:hover {
          background-color: var(--sidebar-hover-bg);
        }

        &.t-menu__item--active {
          background-color: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
        }
      }

      // 调整子菜单项颜色
      & .t-submenu__title {
        color: var(--sidebar-text);

        &:hover {
          background-color: var(--sidebar-hover-bg);
        }
      }
    }
  }
</style>
