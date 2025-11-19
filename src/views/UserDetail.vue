<template>
  <div class="user-detail-container">
    <h2>用户详情</h2>
    <t-card class="user-card">
      <div class="user-info">
        <t-avatar size="large">用户</t-avatar>
        <div class="info-content">
          <p><strong>用户名：</strong>张三</p>
          <p><strong>邮箱：</strong>zhangsan@example.com</p>
          <p><strong>角色：</strong>管理员</p>
          <p><strong>创建时间：</strong>2024-01-01</p>
        </div>
      </div>
    </t-card>
  </div>
</template>

<style scoped>
.user-detail-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.user-card {
  max-width: 600px;
}

.user-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-content p {
  margin: 0;
  color: #666;
}
</style>