<template>
  <el-container class="app-container">
    <!-- 头部导航 -->
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <el-icon class="logo-icon"><Link /></el-icon>
            <span class="logo-text">ShortLink</span>
          </router-link>
        </div>

        <div class="header-actions">
          <template v-if="!authStore.isAuthenticated">
            <el-button type="primary" plain @click="$router.push('/login')">
              登录
            </el-button>
            <el-button type="primary" @click="$router.push('/register')">
              注册
            </el-button>
          </template>
          
          <template v-else>
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" icon="UserFilled" />
                <span class="username">{{ authStore.user?.username || '用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="dashboard">仪表板</el-dropdown-item>
                  <el-dropdown-item command="links">我的链接</el-dropdown-item>
                  <el-dropdown-item command="analytics">数据分析</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </el-header>

    <!-- 主内容区域 -->
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleCommand = (command: string) => {
  switch (command) {
    case 'dashboard':
      router.push('/dashboard')
      break
    case 'links':
      router.push('/links')
      break
    case 'analytics':
      router.push('/analytics')
      break
    case 'logout':
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 64px;
  line-height: 64px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #409eff;
  font-weight: 600;
  font-size: 20px;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #333;
}

.app-main {
  padding: 0;
  background: #f5f7fa;
}
</style>