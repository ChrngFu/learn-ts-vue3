<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import VirtualList from "@/components/VirtualList.vue";

  // 定义数据项接口
  interface ListItem {
    id: number;
    title: string;
    description: string;
    timestamp: Date;
  }

  // 响应式数据
  const listData = ref<ListItem[]>([]);
  const listSize = ref(10000); // 默认生成10000条数据
  const itemHeight = ref(60); // 每一项高度
  const loading = ref(false);
  const showPerformanceInfo = ref(false);
  const renderTime = ref(0);
  const memoryUsage = ref(0);

  // 生成模拟数据
  const generateData = (count: number) => {
    const data: ListItem[] = [];
    for (let i = 1; i <= count; i++) {
      data.push({
        id: i,
        title: `列表项 ${i}`,
        description: `这是第 ${i} 个列表项的详细描述信息，用于虚拟列表演示`,
        timestamp: new Date(),
      });
    }
    return data;
  };

  // 加载数据
  const loadData = () => {
    loading.value = true;
    const startTime = performance.now();

    // 模拟异步加载
    setTimeout(() => {
      listData.value = generateData(listSize.value);

      // 计算渲染时间
      const endTime = performance.now();
      renderTime.value = endTime - startTime;

      // 获取内存使用情况（如果浏览器支持）
      if (performance && "memory" in performance) {
        const memoryInfo = performance as unknown as { memory: { usedJSHeapSize: number } };
        memoryUsage.value = Number((memoryInfo.memory.usedJSHeapSize / 1024 / 1024).toFixed(2));
      }

      loading.value = false;
    }, 100);
  };

  // 切换性能信息显示
  const togglePerformanceInfo = () => {
    showPerformanceInfo.value = !showPerformanceInfo.value;
  };

  // 组件挂载时加载数据
  onMounted(() => {
    loadData();
  });
</script>

<template>
  <div class="virtual-list-demo">
    <h1 class="page-title">虚拟列表演示</h1>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <t-label>列表数据量：</t-label>
        <t-input-number v-model="listSize" :min="100" :max="100000" :step="1000" style="width: 200px" />
        <t-button @click="loadData" :loading="loading">生成数据</t-button>
      </div>

      <div class="control-group">
        <t-label>行高：</t-label>
        <t-input-number v-model="itemHeight" :min="50" :max="200" :step="10" style="width: 120px" />
        <t-button @click="togglePerformanceInfo">
          {{ showPerformanceInfo ? "隐藏性能信息" : "显示性能信息" }}
        </t-button>
      </div>

      <!-- 性能信息 -->
      <div v-if="showPerformanceInfo" class="performance-info">
        <t-card>
          <template #title>性能信息</template>
          <div class="info-item">
            <span>渲染时间：</span>
            <span>{{ renderTime.toFixed(2) }} ms</span>
          </div>
          <div class="info-item">
            <span>内存使用：</span>
            <span>{{ memoryUsage }} MB</span>
          </div>
          <div class="info-item">
            <span>总数据量：</span>
            <span>{{ listData.length.toLocaleString() }}</span>
          </div>
        </t-card>
      </div>
    </div>

    <!-- 虚拟列表展示区域 -->
    <div class="virtual-list-section">
      <t-card>
        <template #title>虚拟列表展示 ({{ listData.length.toLocaleString() }} 条数据)</template>

        <div v-if="loading" class="loading-container">
          <t-loading text="生成数据中..." />
        </div>

        <template v-else>
          <VirtualList :data="listData" height="600px" :itemHeight="itemHeight" keyField="id" :buffer="3">
            <template #default="{ item, index }">
              <div class="list-item-content">
                <div class="item-index">{{ index + 1 }}</div>
                <div class="item-main">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <p class="item-description">{{ item.description }}</p>
                </div>
                <div class="item-time">{{ item.timestamp.toLocaleTimeString() }}</div>
              </div>
            </template>
          </VirtualList>
        </template>
      </t-card>
    </div>

    <!-- 功能说明 -->
    <div class="description-section">
      <t-card>
        <template #title>虚拟列表说明</template>
        <div class="description-content">
          <p>虚拟列表是一种高效渲染大量数据的技术，其核心原理是：</p>
          <ul>
            <li>只渲染可视区域内的数据项</li>
            <li>通过计算偏移量模拟完整列表的滚动效果</li>
            <li>随着滚动动态更新可视区域的数据</li>
            <li>保持DOM节点数量在合理范围内，避免性能问题</li>
          </ul>
          <p>使用虚拟列表的好处：</p>
          <ul>
            <li>减少DOM节点数量，提高渲染性能</li>
            <li>降低内存占用</li>
            <li>流畅的滚动体验</li>
            <li>支持处理几十万甚至上百万条数据</li>
          </ul>
        </div>
      </t-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .virtual-list-demo {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: "Fusion Pixel 12px M latin";

    .page-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 24px;
      color: var(--text-primary);
    }

    .control-panel {
      margin-bottom: 32px;

      .control-group {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .performance-info {
        margin-top: 16px;

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .virtual-list-section {
      margin-bottom: 32px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 600px;
    }

    .list-item-content {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);

      .item-index {
        width: 60px;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .item-main {
        flex: 1;
        padding: 0 16px;
      }

      .item-title {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: var(--text-primary);
      }

      .item-description {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }

      .item-time {
        width: 120px;
        text-align: right;
        color: var(--text-tertiary);
        font-size: 14px;
      }
    }

    .description-section {
      .description-content {
        font-family: "WenQuanYi Micro Hei Mono", system-ui;
        font-weight: normal;
        p {
          margin-bottom: 16px;
          line-height: 1.6;
        }

        ul {
          margin-bottom: 24px;
          padding-left: 24px;

          li {
            margin-bottom: 8px;
            line-height: 1.6;
          }
        }
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .virtual-list-demo {
      padding: 16px;

      .page-title {
        font-size: 24px;
      }

      .control-panel {
        .control-group {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
      }

      .list-item-content {
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;

        .item-index {
          width: auto;
          margin-bottom: 8px;
        }

        .item-main {
          width: 100%;
          padding: 0 0 8px 0;
        }

        .item-time {
          width: 100%;
          text-align: left;
        }
      }
    }
  }
</style>
