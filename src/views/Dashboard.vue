<template>
  <Layout>
    <div class="dashboard">
      <div class="dashboard-content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>仪表板</h1>
          <p>欢迎回来，{{ authStore.user?.username }}</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24"><Link /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalUrls }}</div>
              <div class="stat-label">总链接数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24"><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalClicks }}</div>
              <div class="stat-label">总点击量</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.todayClicks }}</div>
              <div class="stat-label">今日点击</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ daysSinceStart }}</div>
              <div class="stat-label">使用天数</div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <h2>快速操作</h2>
          <div class="actions-grid">
            <el-card class="action-card" @click="showCreateDialog = true">
              <div class="action-content">
                <el-icon size="32"><Plus /></el-icon>
                <h3>创建短链</h3>
                <p>快速创建新的短链接</p>
              </div>
            </el-card>

            <el-card class="action-card" @click="$router.push('/links')">
              <div class="action-content">
                <el-icon size="32"><List /></el-icon>
                <h3>管理链接</h3>
                <p>查看和管理所有链接</p>
              </div>
            </el-card>

            <el-card class="action-card" @click="$router.push('/analytics')">
              <div class="action-content">
                <el-icon size="32"><DataAnalysis /></el-icon>
                <h3>数据分析</h3>
                <p>查看详细的统计数据</p>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 最近的链接 -->
        <div class="recent-links">
          <div class="section-header">
            <h2>最近创建</h2>
            <el-button type="primary" plain @click="$router.push('/links')">
              查看全部
            </el-button>
          </div>

          <div class="links-table">
            <el-table :data="stats.recentUrls" style="width: 100%">
              <el-table-column prop="title" label="标题" min-width="200">
                <template #default="scope">
                  <div class="link-title">
                    {{ scope.row.title || '未命名链接' }}
                  </div>
                  <div class="link-url">{{ scope.row.originalUrl }}</div>
                </template>
              </el-table-column>
              
              <el-table-column prop="shortCode" label="短链" width="120">
                <template #default="scope">
                  <el-tag type="info">{{ scope.row.shortCode }}</el-tag>
                </template>
              </el-table-column>
              
              <el-table-column prop="clickCount" label="点击量" width="100" align="center" />
              
              <el-table-column prop="createdTime" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createdTime) }}
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    text 
                    @click="copyShortUrl(scope.row.shortCode)"
                  >
                    复制
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 创建短链对话框 -->
      <el-dialog 
        v-model="showCreateDialog" 
        title="创建短链" 
        width="500px"
      >
        <el-form 
          ref="createFormRef" 
          :model="createForm" 
          :rules="createRules"
          label-width="80px"
        >
          <el-form-item label="原始链接" prop="originalUrl">
            <el-input v-model="createForm.originalUrl" placeholder="请输入要缩短的链接" />
          </el-form-item>
          
          <el-form-item label="标题">
            <el-input v-model="createForm.title" placeholder="为链接添加标题（可选）" />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input 
              v-model="createForm.description" 
              type="textarea" 
              placeholder="添加描述（可选）"
              :rows="3"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="urlStore.loading"
            @click="handleCreateUrl"
          >
            创建
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore, useUrlStore } from '@/stores'
import { statsApi } from '@/api'
import type { CreateShortUrlRequest, DashboardStats } from '@/types'
import Layout from '@/components/Layout.vue'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const urlStore = useUrlStore()

const showCreateDialog = ref(false)
const createFormRef = ref<FormInstance>()

const stats = ref<DashboardStats>({
  totalUrls: 0,
  totalClicks: 0,
  todayClicks: 0,
  recentUrls: [],
  topUrls: []
})

const createForm = reactive<CreateShortUrlRequest>({
  originalUrl: '',
  title: '',
  description: ''
})

const createRules: FormRules = {
  originalUrl: [
    { required: true, message: '请输入原始链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ]
}

const daysSinceStart = computed(() => {
  // 假设用户注册时间，这里可以从用户信息中获取
  const startDate = dayjs('2024-01-01')
  return dayjs().diff(startDate, 'day')
})

const loadDashboardData = async () => {
  try {
    const response = await statsApi.getDashboardStats()
    stats.value = response.data
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
  }
}

const handleCreateUrl = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    
    await urlStore.createUrl(createForm)
    
    ElMessage.success('短链创建成功！')
    showCreateDialog.value = false
    
    // 重置表单
    createFormRef.value.resetFields()
    Object.assign(createForm, {
      originalUrl: '',
      title: '',
      description: ''
    })
    
    // 重新加载数据
    await loadDashboardData()
    
  } catch (error) {
    console.error('创建短链失败:', error)
  }
}

const copyShortUrl = async (shortCode: string) => {
  try {
    const url = `${window.location.origin}/${shortCode}`
    await navigator.clipboard.writeText(url)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.dashboard-content {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-content {
  text-align: center;
  padding: 20px;
}

.action-content .el-icon {
  color: #409eff;
  margin-bottom: 16px;
}

.action-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.action-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.recent-links {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.links-table {
  border-radius: 8px;
  overflow: hidden;
}

.link-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.link-url {
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #333;
  font-weight: 500;
}
</style>