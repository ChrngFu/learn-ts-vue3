<template>
  <div class="user-list-container">
    <h2>用户列表</h2>
    <t-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @sort-change="handleSortChange"
    />
    <div class="action-buttons">
      <t-button @click="refresh">刷新数据</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTable, type TableDataItem } from "@/hooks/useTable";
  import { Button, type TableProps } from "tdesign-vue-next";

  // 定义用户类型
  interface User extends TableDataItem {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  // 模拟数据获取函数
  const fetchUserData = async (params: {
    page: number;
    pageSize: number;
    sort?: { columnKey: string; order: "asc" | "desc" | "" };
    filters?: Record<string, any>;
  }) => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 原始数据
    const allData: User[] = [
      { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员" },
      { id: 2, name: "李四", email: "lisi@example.com", role: "普通用户" },
      { id: 3, name: "王五", email: "wangwu@example.com", role: "普通用户" },
      { id: 4, name: "赵六", email: "zhaoliu@example.com", role: "管理员" },
      { id: 5, name: "孙七", email: "sunqi@example.com", role: "普通用户" },
    ];

    // 应用排序
    let sortedData = [...allData];
    if (params.sort && params.sort.columnKey && params.sort.order) {
      sortedData.sort((a, b) => {
        const aValue = a[params.sort!.columnKey];
        const bValue = b[params.sort!.columnKey];
        if (params.sort!.order === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // 应用分页
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = sortedData.slice(start, end);

    return {
      data: paginatedData,
      total: allData.length,
    };
  };

  // 使用useTable钩子
  const { tableData, loading, pagination, handlePageChange, handlePageSizeChange, handleSortChange, refresh } =
    useTable<User>({
      defaultCurrent: 1,
      defaultPageSize: 10,
      fetchData: fetchUserData,
      autoLoad: true,
    });

  const columns: TableProps["columns"] = [
    {
      title: "ID",
      colKey: "id",
      sorter: true,
    },
    {
      title: "姓名",
      colKey: "name",
      sorter: true,
    },
    {
      title: "邮箱",
      colKey: "email",
    },
    {
      title: "角色",
      colKey: "role",
    },
    {
      title: "操作",
      width: 120,
      fixed: "right",
      colKey: "actions",
      render: (h, { row }) => {
        return h(
          Button,
          {
            variant: "text",
            onClick: () => handleEdit(row.id),
          },
          "编辑",
        );
      },
    },
  ];

  // 处理编辑操作
  const handleEdit = (id: number) => {
    console.log("编辑用户ID:", id);
    // 这里可以添加编辑逻辑，如打开编辑对话框
  };
</script>

<style scoped>
  .user-list-container {
    padding: 20px;
  }

  h2 {
    margin-bottom: 20px;
    color: #333;
  }
</style>
