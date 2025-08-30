<template>
  <Layout>
    <div class="link-detail-page">
      <div class="link-detail-content">
        <div class="page-header">
          <h1>链接详情</h1>
          <p>链接的详细信息和统计数据</p>
        </div>

        <div class="coming-soon">
          <el-empty
            image="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
            description="链接详情页面正在开发中"
          >
            <el-button type="primary" @click="$router.push('/links')">
              返回链接列表
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
</script>

<style scoped>
.link-detail-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.link-detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.coming-soon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>