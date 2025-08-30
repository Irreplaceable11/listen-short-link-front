<template>
  <Layout>
    <div class="links-page">
      <div class="links-content">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="header-left">
            <h1>我的链接</h1>
            <p>管理您创建的所有短链接</p>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              创建短链
            </el-button>
          </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filters">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-input
                v-model="searchQuery"
                placeholder="搜索链接标题或URL"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-select v-model="statusFilter" placeholder="状态" clearable @change="handleFilter">
                <el-option label="全部" value="" />
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="sortBy" placeholder="排序" @change="handleSort">
                <el-option label="创建时间" value="createdTime" />
                <el-option label="点击量" value="clickCount" />
                <el-option label="更新时间" value="updatedTime" />
              </el-select>
            </el-col>
          </el-row>
        </div>

        <!-- 链接列表 -->
        <div class="links-list">
          <el-card
            v-for="link in filteredLinks"
            :key="link.id"
            class="link-card"
            shadow="hover"
          >
            <div class="link-header">
              <div class="link-info">
                <h3 class="link-title">{{ link.title || '未命名链接' }}</h3>
                <div class="link-urls">
                  <div class="original-url">
                    <el-icon><Link /></el-icon>
                    <span>{{ link.originalUrl }}</span>
                  </div>
                  <div class="short-url">
                    <el-icon><Paperclip /></el-icon>
                    <span>{{ getShortUrl(link.shortCode) }}</span>
                    <el-button 
                      type="primary" 
                      text 
                      size="small" 
                      @click="copyToClipboard(link.shortCode)"
                    >
                      复制
                    </el-button>
                  </div>
                </div>
              </div>
              
              <div class="link-actions">
                <el-dropdown @command="(command) => handleAction(command, link)">
                  <el-button type="primary" text>
                    操作 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="stats">统计</el-dropdown-item>
                      <el-dropdown-item command="copy">复制链接</el-dropdown-item>
                      <el-dropdown-item 
                        :command="link.status === 1 ? 'disable' : 'enable'"
                      >
                        {{ link.status === 1 ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" style="color: #f56c6c;">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div class="link-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ link.clickCount }} 次点击</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(link.createdTime) }}</span>
              </div>
              <div class="meta-item">
                <el-tag :type="link.status === 1 ? 'success' : 'danger'" size="small">
                  {{ link.status === 1 ? '正常' : '禁用' }}
                </el-tag>
              </div>
              <div v-if="link.expireTime" class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>过期时间: {{ formatDate(link.expireTime) }}</span>
              </div>
            </div>

            <div v-if="link.description" class="link-description">
              <p>{{ link.description }}</p>
            </div>
          </el-card>

          <!-- 加载更多 -->
          <div v-if="urlStore.hasMore" class="load-more">
            <el-button 
              :loading="urlStore.loading" 
              @click="loadMore"
              style="width: 100%;"
            >
              加载更多
            </el-button>
          </div>

          <!-- 空状态 -->
          <el-empty 
            v-if="!urlStore.loading && filteredLinks.length === 0"
            description="暂无链接数据"
          >
            <el-button type="primary" @click="showCreateDialog = true">
              创建您的第一个短链
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 创建/编辑对话框 -->
      <el-dialog 
        v-model="showCreateDialog" 
        :title="editingLink ? '编辑短链' : '创建短链'"
        width="600px"
        @close="resetForm"
      >
        <el-form 
          ref="linkFormRef" 
          :model="linkForm" 
          :rules="linkRules"
          label-width="80px"
        >
          <el-form-item label="原始链接" prop="originalUrl">
            <el-input 
              v-model="linkForm.originalUrl" 
              placeholder="请输入要缩短的链接"
              :disabled="!!editingLink"
            />
          </el-form-item>
          
          <el-form-item label="标题">
            <el-input v-model="linkForm.title" placeholder="为链接添加标题（可选）" />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input 
              v-model="linkForm.description" 
              type="textarea" 
              placeholder="添加描述（可选）"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="过期时间">
            <el-date-picker
              v-model="linkForm.expireTime"
              type="datetime"
              placeholder="选择过期时间（可选）"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="urlStore.loading"
            @click="handleSubmit"
          >
            {{ editingLink ? '更新' : '创建' }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useUrlStore } from '@/stores'
import type { CreateShortUrlRequest, UrlMapping } from '@/types'
import Layout from '@/components/Layout.vue'
import dayjs from 'dayjs'

const urlStore = useUrlStore()

const showCreateDialog = ref(false)
const linkFormRef = ref<FormInstance>()
const editingLink = ref<UrlMapping | null>(null)
const searchQuery = ref('')
const statusFilter = ref<number | ''>('')
const sortBy = ref('createdTime')

const linkForm = reactive<CreateShortUrlRequest>({
  originalUrl: '',
  title: '',
  description: '',
  expireTime: undefined
})

const linkRules: FormRules = {
  originalUrl: [
    { required: true, message: '请输入原始链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ]
}

// 过滤和排序链接
const filteredLinks = computed(() => {
  let links = [...urlStore.urls]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    links = links.filter(link => 
      (link.title?.toLowerCase().includes(query)) ||
      link.originalUrl.toLowerCase().includes(query) ||
      link.shortCode.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value !== '') {
    links = links.filter(link => link.status === statusFilter.value)
  }

  // 排序
  links.sort((a, b) => {
    const aValue = a[sortBy.value as keyof UrlMapping]
    const bValue = b[sortBy.value as keyof UrlMapping]
    
    if (sortBy.value === 'clickCount') {
      return (bValue as number) - (aValue as number)
    } else {
      return new Date(bValue as string).getTime() - new Date(aValue as string).getTime()
    }
  })

  return links
})

const loadMore = async () => {
  await urlStore.loadMore()
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const handleFilter = () => {
  // 过滤逻辑已在 computed 中处理
}

const handleSort = () => {
  // 排序逻辑已在 computed 中处理
}

const handleAction = async (command: string, link: UrlMapping) => {
  switch (command) {
    case 'edit':
      editLink(link)
      break
    case 'stats':
      // 跳转到统计页面
      // router.push(`/links/${link.id}`)
      ElMessage.info('统计功能开发中...')
      break
    case 'copy':
      await copyToClipboard(link.shortCode)
      break
    case 'disable':
    case 'enable':
      await toggleLinkStatus(link)
      break
    case 'delete':
      await deleteLink(link)
      break
  }
}

const editLink = (link: UrlMapping) => {
  editingLink.value = link
  Object.assign(linkForm, {
    originalUrl: link.originalUrl,
    title: link.title,
    description: link.description,
    expireTime: link.expireTime ? new Date(link.expireTime) : undefined
  })
  showCreateDialog.value = true
}

const toggleLinkStatus = async (link: UrlMapping) => {
  try {
    const newStatus = link.status === 1 ? 0 : 1
    await urlStore.updateUrl(link.id, { status: newStatus } as any)
    ElMessage.success(newStatus === 1 ? '链接已启用' : '链接已禁用')
  } catch (error) {
    console.error('更新链接状态失败:', error)
  }
}

const deleteLink = async (link: UrlMapping) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除链接 "${link.title || link.shortCode}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await urlStore.deleteUrl(link.id)
    ElMessage.success('链接已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除链接失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!linkFormRef.value) return

  try {
    await linkFormRef.value.validate()
    
    const formData = {
      ...linkForm,
      expireTime: linkForm.expireTime ? dayjs(linkForm.expireTime).format('YYYY-MM-DD HH:mm:ss') : undefined
    }

    if (editingLink.value) {
      await urlStore.updateUrl(editingLink.value.id, formData)
      ElMessage.success('链接更新成功')
    } else {
      await urlStore.createUrl(formData)
      ElMessage.success('链接创建成功')
    }
    
    showCreateDialog.value = false
    resetForm()
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const resetForm = () => {
  editingLink.value = null
  linkFormRef.value?.resetFields()
  Object.assign(linkForm, {
    originalUrl: '',
    title: '',
    description: '',
    expireTime: undefined
  })
}

const copyToClipboard = async (shortCode: string) => {
  try {
    const url = getShortUrl(shortCode)
    await navigator.clipboard.writeText(url)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const getShortUrl = (shortCode: string) => {
  return `${window.location.origin}/${shortCode}`
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  urlStore.fetchUrls()
})
</script>

<style scoped>
.links-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.links-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.header-left p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.filters {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.link-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.link-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.link-info {
  flex: 1;
}

.link-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.link-urls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.original-url,
.short-url {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.original-url {
  color: #666;
}

.short-url {
  color: #409eff;
  font-family: monospace;
}

.short-url span {
  margin-right: 8px;
}

.link-actions {
  margin-left: 16px;
}

.link-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.link-description {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.link-description p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.load-more {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .link-header {
    flex-direction: column;
    gap: 12px;
  }

  .link-meta {
    flex-wrap: wrap;
    gap: 8px 16px;
  }
}
</style>