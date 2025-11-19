import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// 🔥 GitHub 仓库名（
const repoName = "learn-ts-vue3";

// 插件按需引用
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { TDesignResolver } from "@tdesign-vue-next/auto-import-resolver";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        TDesignResolver({
          library: "vue-next",
        }),
      ],
      // 优化自动导入，减少重复导入
      dts: true,
    }),
    Components({
      resolvers: [
        TDesignResolver({
          library: "vue-next",
        }),
      ],
      // 优化组件注册
      dts: true,
    }),
  ],
  base: `/${repoName}/`, // ⚠️ 关键！否则 JS/CSS 404
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 7880,
  },
  // 添加构建优化配置
  build: {
    // 启用rollup的tree-shaking
    rollupOptions: {
      output: {
        // 代码分割配置 - 使用更精确的函数形式
        manualChunks(id) {
          // 优先分割大型第三方库
          // 将TDesign组件库分割到单独的chunk
          if (id.includes("tdesign-vue-next")) {
            return "tdesign";
          }
          // 将vue-router分割到单独的chunk
          if (id.includes("vue-router")) {
            return "vue-router";
          }
          // 分割node_modules中的其他依赖
          if (id.includes("node_modules")) {
            // 提取包名
            const match = id.match(/node_modules\/([^\/]+)/);
            if (match) {
              const packageName = match[1];
              // 对于常见的大型库单独分割
              const largeLibs = ["lodash", "axios", "dayjs", "echarts"];
              if (largeLibs.some(lib => packageName.includes(lib))) {
                return packageName;
              }
              // 其他依赖合并到vendor chunk
              return "vendor";
            }
          }
          // 分割src/views下的页面组件，实现路由级别的代码分割
          if (id.includes("src/views/")) {
            const viewMatch = id.match(/src\/views\/(\w+)/);
            if (viewMatch) {
              return `view-${viewMatch[1]}`;
            }
          }
        },
      },
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 设置chunk大小警告限制为更大的值
    chunkSizeWarningLimit: 1000,
  },
});
