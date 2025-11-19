<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from "vue";

  // 定义属性
  const props = defineProps<{
    data: any[];
    height: string | number;
    itemHeight: number;
    keyField?: string;
    buffer?: number;
  }>();

  // 默认值
  const defaultKeyField = "id";
  const defaultBuffer = 5;

  // 响应式数据
  const scrollTop = ref(0);
  const containerHeight = ref(0);

  // 计算属性
  const keyField = computed(() => props.keyField || defaultKeyField);
  const buffer = computed(() => props.buffer || defaultBuffer);

  // 容器元素引用
  const containerRef = ref<HTMLElement>();

  // 计算可视区域开始和结束索引
  const startIndex = computed(() =>
    Math.floor(Math.max(0, scrollTop.value - buffer.value * props.itemHeight) / props.itemHeight),
  );

  const endIndex = computed(() =>
    Math.min(
      props.data.length - 1,
      Math.ceil((scrollTop.value + containerHeight.value + buffer.value * props.itemHeight) / props.itemHeight),
    ),
  );

  // 计算可视区域内的数据
  const visibleData = computed(() => {
    return props.data.slice(startIndex.value, endIndex.value + 1);
  });

  // 计算偏移量
  const offsetY = computed(() => startIndex.value * props.itemHeight);

  // 计算总高度
  const totalHeight = computed(() => props.data.length * props.itemHeight);

  // 处理滚动事件
  const handleScroll = (e: Event) => {
    scrollTop.value = (e.target as HTMLElement).scrollTop;
  };

  // 更新容器高度
  const updateContainerHeight = () => {
    if (containerRef.value) {
      if (typeof props.height === "number") {
        containerHeight.value = props.height;
      } else if (typeof props.height === "string") {
        // 如果是百分比或其他单位，需要计算实际像素值
        if (props.height.includes("%")) {
          const percentage = parseFloat(props.height);
          if (containerRef.value.parentElement) {
            containerHeight.value = (containerRef.value.parentElement.clientHeight * percentage) / 100;
          }
        } else {
          // 其他单位直接使用
          containerHeight.value = parseFloat(props.height);
        }
      }
    }
  };

  // 组件挂载时
  onMounted(() => {
    updateContainerHeight();
    window.addEventListener("resize", updateContainerHeight);
  });

  // 组件卸载时
  onUnmounted(() => {
    window.removeEventListener("resize", updateContainerHeight);
  });

  // 监听height变化
  watch(
    () => props.height,
    () => {
      updateContainerHeight();
    },
  );
</script>

<template>
  <div ref="containerRef" class="virtual-list-container" :style="{ height }" @scroll="handleScroll">
    <div class="virtual-list-wrapper" :style="{ height: totalHeight + 'px' }">
      <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="(item, index) in visibleData"
          :key="item[keyField] || index"
          class="virtual-list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="startIndex + index"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .virtual-list-container {
    position: relative;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
  }

  .virtual-list-wrapper {
    position: relative;
    width: 100%;
  }

  .virtual-list-content {
    position: absolute;
    width: 100%;
  }

  .virtual-list-item {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0 16px;
  }
</style>
