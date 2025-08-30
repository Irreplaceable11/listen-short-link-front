<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <header class="home-header">
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
    </header>
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          让长链接变<span class="highlight">短</span>，让传播更<span class="highlight">简单</span>
        </h1>
        <p class="hero-subtitle">
          专业的短链接服务，提供数据分析、批量管理、自定义域名等功能
        </p>

        <!-- 短链生成器 -->
        <div class="url-generator">
          <el-form 
            ref="urlFormRef"
            :model="urlForm" 
            :rules="urlRules"
            class="generator-form"
            @submit.prevent="handleCreateUrl"
          >
            <div class="input-group">
              <el-form-item prop="originalUrl" class="url-input">
                <el-input
                  v-model="urlForm.originalUrl"
                  placeholder="输入您要缩短的链接..."
                  size="large"
                  clearable
                  @keyup.enter="handleCreateUrl"
                >
                  <template #prepend>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              
              <el-button 
                type="primary" 
                size="large"
                class="generate-btn"
                :loading="urlStore.loading"
                @click="handleCreateUrl"
              >
                生成短链
              </el-button>
            </div>

            <!-- 高级选项 -->
            <el-collapse v-model="activeCollapse" class="advanced-options">
              <el-collapse-item title="高级选项" name="advanced">
                <div class="advanced-form">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="标题">
                        <el-input v-model="urlForm.title" placeholder="为链接添加标题" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="过期时间">
                        <el-date-picker
                          v-model="urlForm.expireTime"
                          type="datetime"
                          placeholder="选择过期时间"
                          style="width: 100%"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="描述">
                    <el-input 
                      v-model="urlForm.description" 
                      type="textarea" 
                      placeholder="添加链接描述" 
                      :rows="2"
                    />
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>

          <!-- 生成结果 -->
          <div v-if="generatedUrl" class="result-section">
            <div class="result-card">
              <h3>短链生成成功！</h3>
              <div class="result-url">
                <el-input 
                  :value="getShortUrl(generatedUrl.shortCode)" 
                  readonly
                  class="result-input"
                >
                  <template #append>
                    <el-button @click="copyToClipboard">
                      <el-icon><DocumentCopy /></el-icon>
                      复制
                    </el-button>
                  </template>
                </el-input>
              </div>
              <div class="result-actions">
                <el-button type="primary" plain @click="$router.push('/links')">
                  管理我的链接
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features">
      <div class="features-content">
        <h2 class="section-title">为什么选择我们？</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="32"><TrendCharts /></el-icon>
            </div>
            <h3>数据分析</h3>
            <p>详细的点击统计和访问分析，帮您了解链接表现</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="32"><Lock /></el-icon>
            </div>
            <h3>安全可靠</h3>
            <p>专业的安全防护，保障您的链接和数据安全</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="32"><Setting /></el-icon>
            </div>
            <h3>批量管理</h3>
            <p>支持批量创建、编辑和管理短链接</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="32"><Clock /></el-icon>
            </div>
            <h3>永久有效</h3>
            <p>链接永久有效，也支持设置过期时间</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore, useUrlStore } from '@/stores'
import { useRouter } from 'vue-router'
import type { CreateShortUrlRequest, UrlMapping } from '@/types'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const urlStore = useUrlStore()
const router = useRouter()

const urlFormRef = ref<FormInstance>()
const activeCollapse = ref<string[]>([])
const generatedUrl = ref<UrlMapping | null>(null)

const urlForm = reactive<CreateShortUrlRequest>({
  originalUrl: '',
  title: '',
  description: '',
  expireTime: undefined
})

const urlRules: FormRules = {
  originalUrl: [
    { required: true, message: '请输入要缩短的链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ]
}

const handleCreateUrl = async () => {
  if (!urlFormRef.value) return

  try {
    await urlFormRef.value.validate()
    
    // 如果用户未登录，先提示登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录以创建短链接')
      return
    }

    const formData = {
      ...urlForm,
      expireTime: urlForm.expireTime ? dayjs(urlForm.expireTime).format('YYYY-MM-DD HH:mm:ss') : undefined
    }

    const response = await urlStore.createUrl(formData)
    generatedUrl.value = response.data
    
    ElMessage.success('短链生成成功！')
    
    // 重置表单
    urlFormRef.value.resetFields()
    Object.assign(urlForm, {
      originalUrl: '',
      title: '',
      description: '',
      expireTime: undefined
    })
    
  } catch (error) {
    console.error('生成短链失败:', error)
  }
}

const getShortUrl = (shortCode: string) => {
  return `${window.location.origin}/${shortCode}`
}

const copyToClipboard = async () => {
  if (!generatedUrl.value) return
  
  try {
    await navigator.clipboard.writeText(getShortUrl(generatedUrl.value.shortCode))
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

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
.home-page {
  min-height: 100vh;
}

.home-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(228, 231, 237, 0.3);
  padding: 0;
  height: 64px;
  line-height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
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
  background-color: rgba(245, 247, 250, 0.8);
}

.username {
  font-size: 14px;
  color: #333;
}
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.highlight {
  color: #ffd700;
}

.hero-subtitle {
  font-size: 20px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  line-height: 1.6;
}

.url-generator {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.generator-form {
  margin-bottom: 0;
}

.input-group {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.url-input {
  flex: 1;
}

.generate-btn {
  height: 48px;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 500;
}

.advanced-options {
  margin-top: 20px;
  border: none;
}

.advanced-options :deep(.el-collapse-item__header) {
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0 16px;
  font-weight: 500;
}

.advanced-options :deep(.el-collapse-item__content) {
  padding: 20px 0 0 0;
}

.advanced-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.result-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.result-card h3 {
  color: #409eff;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.result-url {
  margin-bottom: 16px;
}

.result-input :deep(.el-input__inner) {
  font-family: monospace;
  color: #409eff;
}

.result-actions {
  text-align: center;
}

.features {
  padding: 80px 20px;
  background: white;
}

.features-content {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 600;
  color: #333;
  margin: 0 0 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 16px;
  background: #f8f9fa;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  margin: 0 0 20px 0;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .generate-btn {
    width: 100%;
  }
}
</style>