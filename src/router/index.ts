import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import type { Menu } from "tdesign-vue-next";

// 定义路由类型，扩展RouteRecordRaw以包含meta信息
export interface AppRouteRecordRaw extends RouteRecordRaw {
  path: string;
  name?: string;
  component?: any;
  redirect?: string;
  meta?: {
    title?: string;
    icon?: string;
    hidden?: boolean;
  };
  children?: AppRouteRecordRaw[];
}

// 路由配置
export const routes: AppRouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: {
      title: "首页",
      icon: "home",
    },
  },
  {
    path: "/user",
    name: "user",
    meta: {
      title: "用户管理",
      icon: "user",
    },
    children: [
      {
        path: "list",
        name: "user-list",
        component: () => import("@/views/UserList.vue"),
        meta: {
          title: "用户列表",
        },
      },
      {
        path: "detail",
        name: "user-detail",
        component: () => import("@/views/UserDetail.vue"),
        meta: {
          title: "用户详情",
        },
      },
    ],
  },
  {
    path: "/gallery",
    name: "gallery",
    component: () => import("@/views/ImageGallery.vue"),
    meta: {
      title: "图片管理",
      icon: "image",
    },
  },
  {
    path: "/virtual-list",
    name: "virtual-list",
    component: () => import("@/views/VirtualListDemo.vue"),
    meta: {
      title: "虚拟列表",
      icon: "list",
    },
  },
];

// 路由菜单转换函数 - 生成符合 TDesign 菜单结构的菜单项
export function generateMenuFromRoutes(routes: AppRouteRecordRaw[], parentPath: string = ""): Menu.Item[] {
  const menuItems: Menu.Item[] = [];

  routes.forEach(route => {
    // 跳过重定向和隐藏的路由
    if (route.redirect || (route.meta && route.meta.hidden)) return;

    // 只有当路由有 name 属性时才生成菜单项
    if (!route.name) return;

    // 构建完整的路由路径，确保格式正确
    let fullPath = "";
    if (parentPath) {
      if (route.path.startsWith("/")) {
        // 如果子路由是绝对路径，则直接使用
        fullPath = route.path;
      } else {
        // 确保父路径和子路径之间有且只有一个斜杠
        const normalizedParent = parentPath.endsWith("/") ? parentPath.slice(0, -1) : parentPath;
        const normalizedChild = route.path.startsWith("/") ? route.path.slice(1) : route.path;
        fullPath = normalizedParent ? `${normalizedParent}/${normalizedChild}` : normalizedChild;
      }
    } else {
      fullPath = route.path;
    }

    // 确保路径以斜杠开头
    if (!fullPath.startsWith("/")) {
      fullPath = "/" + fullPath;
    }

    // 创建菜单项对象
    const menuItem: Menu.Item = {
      label: route.meta?.title || String(route.name),
      key: String(route.name),
      value: fullPath, // 存储完整的路径信息
      icon: route.meta?.icon,
      disabled: false,
    };

    // 处理子路由 - 确保生成正确的子菜单结构
    if (route.children && route.children.length > 0) {
      // 递归生成子菜单，传入当前路由路径作为父路径
      const childMenuItems = generateMenuFromRoutes(route.children, fullPath);
      if (childMenuItems.length > 0) {
        menuItem.children = childMenuItems;
        // 对于有子菜单的父菜单项，如果没有指定组件，则设置为不可点击
        if (!route.component) {
          menuItem.disabled = false; // TDesign 默认支持展开/折叠操作
        }
      }
    }

    // 只有当有子菜单或有组件时才添加到菜单中
    if (route.component || (route.children && route.children.length > 0)) {
      menuItems.push(menuItem);
    }
  });

  return menuItems;
}

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
