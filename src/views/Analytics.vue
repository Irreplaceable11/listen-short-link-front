<template>
  <Layout>
    <div class="analytics-page">
      <div class="analytics-content">
        <div class="page-header">
          <h1>数据分析</h1>
          <p>深入了解您的链接表现</p>
        </div>

        <div class="coming-soon">
          <el-empty
            image="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
            description="数据分析功能正在开发中"
          >
            <el-button type="primary" @click="$router.push('/links')">
              返回链接管理
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
.analytics-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.analytics-content {
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