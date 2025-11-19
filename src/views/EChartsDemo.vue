<template>
  <div class="echarts-demo-container">
    <h1 class="page-title">ECharts 图表示例</h1>

    <!-- 图表容器 -->
    <div class="charts-wrapper">
      <!-- 柱状图 -->
      <div class="chart-item">
        <h2>柱状图</h2>
        <div ref="barChartRef" class="chart-container"></div>
      </div>

      <!-- 曲线图 -->
      <div class="chart-item">
        <h2>曲线图</h2>
        <div ref="lineChartRef" class="chart-container"></div>
      </div>

      <!-- 饼图 -->
      <div class="chart-item">
        <h2>饼图</h2>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from "vue";
  import useECharts from "@/hooks/useECharts";

  // 图表容器引用
  const barChartRef = ref<HTMLElement | null>(null);
  const lineChartRef = ref<HTMLElement | null>(null);
  const pieChartRef = ref<HTMLElement | null>(null);

  // 图表实例
  let barChart: ReturnType<typeof useECharts>;
  let lineChart: ReturnType<typeof useECharts>;
  let pieChart: ReturnType<typeof useECharts>;

  // 初始化所有图表
  onMounted(async () => {
    // 初始化柱状图
    barChart = useECharts(barChartRef);
    // 初始化曲线图
    lineChart = useECharts(lineChartRef);
    // 初始化饼图
    pieChart = useECharts(pieChartRef);

    // 确保图表完全初始化后再设置数据
    await nextTick();
    
    // 稍微延时确保图表实例已完全创建
    setTimeout(() => {
      initBarChart();
      initLineChart();
      initPieChart();
    }, 100);
  });

  // 初始化柱状图
  const initBarChart = () => {
    const barOption = {
      title: {
        text: "各月份销售额",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["1月", "2月", "3月", "4月", "5月", "6月"],
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        name: "销售额(万元)",
      },
      series: [
        {
          name: "2023年",
          type: "bar",
          data: [120, 200, 150, 80, 70, 110],
          itemStyle: {
            color: "#5470c6",
          },
          emphasis: {
            itemStyle: {
              color: "#73c0de",
            },
          },
        },
        {
          name: "2024年",
          type: "bar",
          data: [150, 230, 200, 100, 90, 130],
          itemStyle: {
            color: "#91cc75",
          },
          emphasis: {
            itemStyle: {
              color: "#fac858",
            },
          },
        },
      ],
      legend: {
        data: ["2023年", "2024年"],
        bottom: 0,
      },
    };

    barChart.setOption(barOption);
  };

  // 初始化曲线图
  const initLineChart = () => {
    const lineOption = {
      title: {
        text: "网站访问量趋势",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["日访问量", "平均停留时间(分钟)"],
        bottom: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      },
      yAxis: [
        {
          type: "value",
          name: "访问量(次)",
          position: "left",
        },
        {
          type: "value",
          name: "时间(分钟)",
          position: "right",
        },
      ],
      series: [
        {
          name: "日访问量",
          type: "line",
          smooth: true,
          data: [1200, 1900, 1500, 1800, 2100, 2800, 2500],
          lineStyle: {
            width: 3,
            color: "#5470c6",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(84, 112, 198, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(84, 112, 198, 0.05)",
                },
              ],
            },
          },
          emphasis: {
            focus: "series",
          },
        },
        {
          name: "平均停留时间(分钟)",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          data: [5.2, 6.8, 4.9, 7.2, 8.5, 12.3, 10.8],
          lineStyle: {
            width: 3,
            color: "#91cc75",
          },
          emphasis: {
            focus: "series",
          },
        },
      ],
    };

    lineChart.setOption(lineOption);
  };

  // 初始化饼图
  const initPieChart = () => {
    const pieOption = {
      title: {
        text: "用户来源分布",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "middle",
      },
      series: [
        {
          name: "用户来源",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["60%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "20",
              fontWeight: "bold",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 335, name: "直接访问", itemStyle: { color: "#5470c6" } },
            { value: 310, name: "搜索引擎", itemStyle: { color: "#91cc75" } },
            { value: 234, name: "社交媒体", itemStyle: { color: "#fac858" } },
            { value: 135, name: "邮件营销", itemStyle: { color: "#ee6666" } },
            { value: 1548, name: "广告推广", itemStyle: { color: "#73c0de" } },
          ],
        },
      ],
    };

    pieChart.setOption(pieOption);
  };
</script>

<style scoped lang="scss">
  .echarts-demo-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px;
  }

  .page-title {
    text-align: center;
    margin-bottom: 50px;
    color: #fff;
    font-size: 2.5rem;
    font-weight: 300;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
  }

  .charts-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
    gap: 35px;
  }

  .chart-item {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    padding: 25px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .chart-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  }

  .chart-item h2 {
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 1.2rem;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 2px solid #e74c3c;
    position: relative;
  }

  .chart-item h2::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 50px;
    height: 2px;
    background: #3498db;
    transition: width 0.3s ease;
  }

  .chart-item:hover h2::after {
    width: 100px;
  }

  .chart-container {
    width: 100%;
    height: 400px;
    min-height: 400px;
    position: relative;
    transition: height 0.3s ease;
    box-sizing: border-box;
  }

  .chart-item:hover .chart-container {
    height: 410px;
  }

  /* 添加加载动画 */
  .chart-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 48%,
      rgba(0, 0, 0, 0.05) 49%,
      rgba(0, 0, 0, 0.05) 51%,
      transparent 52%
    );
    background-size: 20px 20px;
    animation: loading 1s linear infinite;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .chart-container.loading::before {
    opacity: 1;
  }

  @keyframes loading {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 20px 20px;
    }
  }

  /* 响应式设计优化 */
  @media (max-width: 768px) {
    .echarts-demo-container {
      padding: 20px 15px;
    }

    .page-title {
      font-size: 2rem;
      margin-bottom: 30px;
    }

    .charts-wrapper {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .chart-item {
      padding: 20px;
    }

    .chart-container {
      height: 320px;
    }

    .chart-item:hover .chart-container {
      height: 330px;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 1.75rem;
    }

    .chart-container {
      height: 280px;
    }

    .chart-item:hover .chart-container {
      height: 290px;
    }
  }
</style>
