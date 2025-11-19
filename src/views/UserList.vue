<template>
  <div class="user-list-container">
    <h2>用户列表</h2>
    <t-table :data="userData" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { TableProps } from "tdesign-vue-next";

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  const userData = ref<User[]>([
    { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员" },
    { id: 2, name: "李四", email: "lisi@example.com", role: "普通用户" },
    { id: 3, name: "王五", email: "wangwu@example.com", role: "普通用户" },
  ]);

  const columns: TableProps["columns"] = [
    { title: "ID", colKey: "id" },
    { title: "姓名", colKey: "name" },
    { title: "邮箱", colKey: "email" },
    { title: "角色", colKey: "role" },
    {
      title: "操作",
      width: 120,
      fixed: "right",
      colKey: "actions",
      render: h => {
        return h("t-button", { size: "small" }, "编辑");
      },
    },
  ];
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
