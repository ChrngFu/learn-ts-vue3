import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'

// 引入TDesign组件库和样式
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

// 引入主题样式
import './assets/styles/theme.scss';

// 引入路由
import router from './router';

// 引入主题管理器
import themeManager from './utils/themeManager';

const app = createApp(App);

// 注册TDesign组件库
app.use(TDesign);

// 注册路由
app.use(router);

// 挂载主题管理器到Vue实例
app.config.globalProperties.$themeManager = themeManager;

// 设置当前主题到全局属性，确保它是响应式的
app.config.globalProperties.$theme = themeManager.isDarkMode() ? 'dark' : 'light';

// 监听主题变化，实时更新全局主题属性
themeManager.onThemeChange((_theme, isDark) => {
  app.config.globalProperties.$theme = isDark ? 'dark' : 'light';
});

app.mount('#app')
