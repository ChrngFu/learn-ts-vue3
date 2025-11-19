<template>
  <div class="table-demo-container">
    <h1 class="page-title">表格组件演示</h1>

    <!-- 过滤和操作区域 -->
    <div class="filter-section">
      <t-input
        v-model="searchKeyword"
        placeholder="搜索用户名"
        prefix-icon="search"
        @keyup.enter="handleSearch"
        style="width: 300px"
      />
      <t-button @click="handleSearch" variant="primary" style="margin-left: 10px">搜索</t-button>
      <t-button @click="resetSearch" variant="outline" style="margin-left: 10px">重置</t-button>
      <t-button @click="refreshData" style="margin-left: 10px">刷新数据</t-button>
    </div>

    <!-- 表格组件 -->
    <t-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :hover-effect="true"
      row-key="id"
      :max-height="400"
      @sort-change="handleTableSort"
    >
      <!-- 操作列插槽 -->
      <template #action="{ row }">
        <t-button size="small" @click="handleView(row)">查看</t-button>
        <t-button size="small" variant="primary" style="margin-left: 8px" @click="handleEdit(row)">编辑</t-button>
        <t-button size="small" variant="danger" style="margin-left: 8px" @click="handleDelete(row)">删除</t-button>
      </template>
    </t-table>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <t-pagination
        :total="pagination.total"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 数据统计信息 -->
    <div class="data-info">
      <p>
        共 {{ pagination.total }} 条数据，当前显示第 {{ (pagination.current - 1) * pagination.pageSize + 1 }}-{{
          Math.min(pagination.current * pagination.pageSize, pagination.total)
        }}
        条
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from "vue";
  import { Button, Tag, MessagePlugin, type BaseTableCol } from "tdesign-vue-next";
  import { useTable, type TableDataItem, type SortInfo } from "@/hooks/useTable";

  // 定义用户数据类型
  interface UserData extends TableDataItem {
    id: number;
    username: string;
    email: string;
    role: "admin" | "editor" | "viewer";
    status: "active" | "inactive" | "suspended";
    createdAt: string;
    lastLogin: string;
  }

  // 搜索关键词
  const searchKeyword = ref("");

  // 使用TDesign的MessagePlugin作为消息提示

  // 角色枚举映射（英文 -> 中文）
  const roleMap = {
    admin: "管理员",
    editor: "编辑",
    viewer: "查看者",
  };

  // 状态枚举映射（英文 -> 中文）
  const statusMap = {
    active: "活跃",
    inactive: "非活跃",
    suspended: "已停用",
  };

  // 生成模拟数据的函数
  function generateMockData(
    page: number,
    pageSize: number,
    keyword?: string,
    sort?: SortInfo,
  ): { data: UserData[]; total: number } {
    // 模拟总数据量
    const totalCount = 200;

    // 生成当前页数据
    let allData: UserData[] = [];

    for (let i = 0; i < totalCount; i++) {
      const user: UserData = {
        id: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: ["admin", "editor", "viewer"][Math.floor(Math.random() * 3)] as UserData["role"],
        status: ["active", "inactive", "suspended"][Math.floor(Math.random() * 3)] as UserData["status"],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
      allData.push(user);
    }

    // 应用搜索过滤
    if (keyword) {
      allData = allData.filter(user => user.username.toLowerCase().includes(keyword.toLowerCase()));
    }

    // 应用排序
    if (sort && sort.columnKey && sort.order) {
      allData.sort((a, b) => {
        const aValue = a[sort.columnKey];
        const bValue = b[sort.columnKey];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sort.order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.order === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    // 计算分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = allData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: allData.length,
    };
  }

  // 使用useTable hook
  const {
    tableData,
    loading,
    pagination,
    loadData,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    refresh,
  } = useTable<UserData>({
    defaultCurrent: 1,
    defaultPageSize: 10,
    fetchData: async params => {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 调用模拟数据生成函数
      const result = generateMockData(params.page, params.pageSize, searchKeyword.value || undefined, params.sort);

      return result;
    },
    autoLoad: true,
  });
  // 表格列配置
  const columns = ref<BaseTableCol<UserData>[]>([
    {
      title: "ID",
      colKey: "id",
      width: 80,
      align: "center",
    },
    {
      title: "用户名",
      colKey: "username",
      width: 150,
      align: "center",
    },
    {
      title: "邮箱",
      colKey: "email",
      width: 200,
      align: "center",
    },
    {
      title: "角色",
      colKey: "role",
      width: 100,
      align: "center",
      cell: (h, { row }) => {
        return h(
          Tag,
          {
            variant: "light-outline",
          },
          roleMap[row.role] || row.role,
        );
      },
    },
    {
      title: "状态",
      colKey: "status",
      width: 120,
      align: "center",
      cell: (h, { row }) => {
        return h(
          Tag,
          {
            theme: row.status === "active" ? "success" : "danger",
          },
          statusMap[row.status] || row.status,
        );
      },
    },
    {
      title: "创建时间",
      colKey: "createdAt",
      width: 150,
      align: "center",
    },
    {
      title: "操作",
      colKey: "action",
      width: 220,
      align: "center",
      fixed: "right",
      cell: (h, { row }) => {
        return h("div", {}, [
          h(
            Button,
            {
              variant: "text",
              theme: "primary",
              onClick: () => handleView(row),
            },
            "查看",
          ),
          h(
            Button,
            {
              variant: "text",
              theme: "primary",
              onClick: () => handleEdit(row),
            },
            "编辑",
          ),
          h(
            Button,
            {
              variant: "text",
              theme: "danger",
              onClick: () => handleDelete(row),
            },
            "删除",
          ),
        ]);
      },
    },
  ]);

  // 处理搜索
  const handleSearch = () => {
    loadData(true); // 重置分页并重新加载
  };

  // 重置搜索
  const resetSearch = () => {
    searchKeyword.value = "";
    loadData(true);
  };

  // 刷新数据
  const refreshData = () => {
    refresh();
  };

  // 处理表格排序
  const handleTableSort = (sort: SortInfo) => {
    handleSortChange(sort);
  };

  // 查看用户
  const handleView = (row: UserData) => {
    MessagePlugin.info(`查看用户: ${row.username}`);
    // 这里可以跳转到详情页或显示详情弹窗
  };

  // 编辑用户
  const handleEdit = (row: UserData) => {
    MessagePlugin.info(`编辑用户: ${row.username}`);
    // 这里可以跳转到编辑页或显示编辑弹窗
  };

  // 删除用户
  const handleDelete = (row: UserData) => {
    // 这里可以实现删除确认逻辑
    MessagePlugin.info(`删除用户: ${row.username}`);
  };
</script>

<style lang="scss" scoped>
  .table-demo-container {
    padding: 20px;
    background-color: var(--bg-secondary);
    min-height: 100vh;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-primary);
  }

  .filter-section {
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px var(--shadow-base);
  }

  .t-table {
    background: var(--bg-primary);
    border-radius: 8px;
    box-shadow: 0 1px 3px var(--shadow-base);
  }

  .pagination-section {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    background: var(--bg-primary);
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px var(--shadow-base);
  }

  .data-info {
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-secondary);
    text-align: right;
  }

  // 响应式调整
  @media (max-width: 768px) {
    .table-demo-container {
      padding: 10px;
    }

    .filter-section {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-section :deep(.t-input) {
      width: 100% !important;
      margin-bottom: 10px;
    }

    .filter-section :deep(.t-button) {
      margin-left: 0 !important;
      margin-right: 10px;
      margin-bottom: 10px;
    }

    .pagination-section {
      justify-content: center;
    }
  }
</style>
