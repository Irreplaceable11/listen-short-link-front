<template>
  <Layout>
    <div class="not-found-page">
      <div class="not-found-content">
        <el-result
          icon="warning"
          title="404"
          sub-title="抱歉，您访问的页面不存在"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/')">
              返回首页
            </el-button>
            <el-button @click="$router.back()">
              返回上一页
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>