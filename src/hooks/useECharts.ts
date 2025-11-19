/**
 * @file useECharts.ts
 * @description ECharts图表管理的自定义Hook
 * @author
 * @date
 *
 * 此Hook提供了ECharts图表的初始化、更新、销毁等功能，简化了Vue组件中使用ECharts的流程。
 * 主要功能包括：
 * - 图表初始化与自动销毁
 * - 响应式更新配置和数据
 * - 处理窗口大小变化，自动调整图表大小
 * - 提供常用的图表操作方法
 * - 支持主题切换同步
 */
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { Ref } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption, EChartsType } from 'echarts';
import { themeManager } from '../utils/themeManager';

// ECharts主题映射
const echartsThemeMap = {
  light: 'light',
  dark: 'dark'
} as const;

/**
 * useECharts hook的配置选项
 */
export interface UseEChartsOptions {
  /**
   * 是否在窗口大小变化时自动调整图表大小
   * @default true
   */
  autoresize?: boolean;
  
  /**
   * 初始化时的主题
   */
  theme?: string | object;
  
  /**
   * 初始化时的附加配置
   */
  initOptions?: object;
  
  /**
   * 懒加载选项
   */
  lazy?: boolean;
}

/**
 * ECharts实例的操作方法集合
 */
export interface EChartsInstanceMethods {
  /**
   * 设置图表配置项
   * @param option ECharts配置项
   * @param notMerge 是否不与当前配置合并
   * @param lazyUpdate 是否懒更新
   */
  setOption: (option: EChartsOption, notMerge?: boolean, lazyUpdate?: boolean) => void;
  
  /**
   * 调整图表大小
   */
  resize: () => void;
  
  /**
   * 清空图表内容
   */
  clear: () => void;
  
  /**
   * 销毁图表实例
   */
  dispose: () => void;
  
  /**
   * 监听事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  
  /**
   * 解绑事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  off: (eventName: string, handler?: (...args: any[]) => void) => void;
  
  /**
   * 获取基础的ECharts实例
   */
  getInstance: () => any;
  
  /**
   * 更新图表主题
   * @param newTheme 新的主题名称或配置
   */
  updateTheme: (newTheme?: string | object) => void;
}

/**
 * ECharts图表管理的自定义Hook
 * @param elRef 图表容器元素的ref
 * @param option 图表配置项
 * @param options 额外配置选项
 * @returns 图表实例和操作方法
 */
export function useECharts(
  elRef: Ref<HTMLElement | null>,
  option?: Ref<EChartsOption | null>,
  options: UseEChartsOptions = {}
): EChartsInstanceMethods {
  // 解构配置选项，设置默认值
  const {
    autoresize = true,
    theme: initialTheme,
    initOptions,
    lazy = false
  } = options;

  // 存储ECharts实例的ref
  const chartInstance = ref<EChartsType | null>(null);
  // 存储当前主题
  const currentTheme = ref<string | object | undefined>(initialTheme);
  // 记录窗口大小变化的定时器
  let resizeTimer: number | null = null;
  // 主题变化监听器的取消函数
  let removeThemeListener: (() => void) | null = null;
  // 全局主题事件监听器
  let globalThemeListener: ((e: CustomEvent) => void) | null = null;

  /**
   * 初始化图表
   */
  const init = async () => {
    // 确保元素已存在
    if (!elRef.value) {
      console.warn('ECharts容器元素不存在');
      return;
    }
    
    // 如果已经存在实例，先销毁
    if (chartInstance.value) {
      chartInstance.value.dispose();
    }

    try {
      // 确保DOM元素已渲染完成
      await nextTick();
      
      // 检查容器元素的尺寸
      const rect = elRef.value.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('ECharts容器尺寸为0，稍后重试初始化');
        // 延迟重试
        setTimeout(() => {
          init();
        }, 100);
        return;
      }
      
      // 创建新的ECharts实例
      chartInstance.value = echarts.init(elRef.value, currentTheme.value, initOptions);
      
      console.log('ECharts实例创建成功');
      
      // 如果有初始配置，应用配置
      if (option && option.value) {
        chartInstance.value.setOption(option.value);
      }
    } catch (error) {
      console.error('ECharts初始化失败:', error);
    }
  };

  /**
   * 设置图表配置项
   * @param newOption 新的配置项
   * @param notMerge 是否不与当前配置合并
   * @param lazyUpdate 是否懒更新
   */
  const setOption = (newOption: EChartsOption, notMerge = false, lazyUpdate = false) => {
    if (chartInstance.value) {
      try {
        chartInstance.value.setOption(newOption, notMerge, lazyUpdate);
        console.log('ECharts配置设置成功');
      } catch (error) {
        console.error('ECharts配置设置失败:', error);
      }
    } else {
      console.warn('ECharts实例不存在，无法设置配置');
      // 如果实例不存在，尝试重新初始化
      init().then(() => {
        if (chartInstance.value) {
          chartInstance.value.setOption(newOption, notMerge, lazyUpdate);
        }
      });
    }
  };

  /**
   * 调整图表大小
   */
  const resize = () => {
    if (chartInstance.value) {
      chartInstance.value.resize();
    }
  };

  /**
   * 清空图表内容
   */
  const clear = () => {
    if (chartInstance.value) {
      chartInstance.value.clear();
    }
  };

  /**
   * 销毁图表实例
   */
  const dispose = () => {
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }
  };

  /**
   * 监听事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  const on = (eventName: string, handler: (...args: any[]) => void) => {
    if (chartInstance.value) {
      chartInstance.value.on(eventName, handler);
    }
  };

  /**
   * 解绑事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  const off = (eventName: string, handler?: (...args: any[]) => void) => {
    if (chartInstance.value) {
      chartInstance.value.off(eventName, handler);
    }
  };

  /**
   * 获取基础的ECharts实例
   * @returns ECharts实例
   */
  const getInstance = () => {
    return chartInstance.value;
  };

  /**
   * 更新图表主题
   * @param newTheme 新的主题名称或配置
   */
  const updateTheme = async (newTheme?: string | object) => {
    // 如果提供了新主题，更新当前主题
    if (newTheme !== undefined) {
      currentTheme.value = newTheme;
    }

    // 确保实例存在
    if (!chartInstance.value) {
      console.warn('ECharts实例不存在，无法更新主题');
      return;
    }

    try {
      // 获取当前配置
      const currentOption = chartInstance.value.getOption();
      
      // 销毁旧实例
      chartInstance.value.dispose();
      
      // 创建新实例并应用主题
      chartInstance.value = echarts.init(elRef.value as HTMLElement, currentTheme.value, initOptions);
      
      // 重新应用配置
      if (currentOption) {
        chartInstance.value.setOption(currentOption);
      }
      
      console.log('ECharts主题更新成功');
    } catch (error) {
      console.error('ECharts主题更新失败:', error);
    }
  };

  /**
   * 处理窗口大小变化
   */
  const handleResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    
    resizeTimer = window.setTimeout(() => {
      resize();
    }, 200);
  };

  // 监听配置项变化
  if (option) {
    watch(
      option,
      (newOption) => {
        if (newOption && chartInstance.value) {
          chartInstance.value.setOption(newOption);
        }
      },
      { deep: true }
    );
  }

  // 生命周期钩子：组件挂载后
  onMounted(async () => {
    if (!lazy) {
      await nextTick();
      // 确保init函数完成
      await init();
      
      // 设置窗口大小变化监听
      if (autoresize) {
        window.addEventListener('resize', handleResize);
      }
      
      // 注册主题变化监听器，自动同步主题
      removeThemeListener = themeManager.onThemeChange((theme, isDark) => {
        console.log('主题变化，更新ECharts主题:', isDark ? 'dark' : 'light');
        updateTheme(echartsThemeMap[isDark ? 'dark' : 'light']);
      });
      
      // 监听全局ECharts主题更新事件
      globalThemeListener = (e: CustomEvent) => {
        const { theme } = e.detail as { theme: 'light' | 'dark' };
        console.log('全局ECharts主题更新事件触发:', theme);
        updateTheme(echartsThemeMap[theme === 'dark' ? 'dark' : 'light']);
      };
      window.addEventListener('echartsThemeChange', globalThemeListener as EventListener);
    }
  });

  // 生命周期钩子：组件卸载前
  onUnmounted(() => {
    // 移除窗口大小变化监听
    if (autoresize) {
      window.removeEventListener('resize', handleResize);
    }
    
    // 移除主题变化监听
    if (removeThemeListener) {
      removeThemeListener();
      removeThemeListener = null;
    }
    
    // 移除全局主题事件监听
    if (globalThemeListener) {
      window.removeEventListener('echartsThemeChange', globalThemeListener as EventListener);
      globalThemeListener = null;
    }
    
    // 清理定时器
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    
    // 销毁图表实例
    dispose();
  });

  return {
    setOption,
    resize,
    clear,
    dispose,
    on,
    off,
    getInstance,
    updateTheme
  };
}

export default useECharts;