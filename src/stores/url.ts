import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { urlApi } from '@/api'
import type { UrlMapping, CreateShortUrlRequest, PaginationParams } from '@/types'

export const useUrlStore = defineStore('url', () => {
  const urls = ref<UrlMapping[]>([])
  const currentUrl = ref<UrlMapping | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  const hasMore = computed(() => urls.value.length < total.value)

  // 创建短链
  const createUrl = async (data: CreateShortUrlRequest) => {
    loading.value = true
    try {
      const response = await urlApi.createShortUrl(data)
      // 将新创建的URL添加到列表顶部
      urls.value.unshift(response.data)
      return response
    } finally {
      loading.value = false
    }
  }

  // 获取用户短链列表
  const fetchUrls = async (params: PaginationParams = { page: 1, size: 10 }) => {
    loading.value = true
    try {
      const response = await urlApi.getUserUrls(params)
      
      if (params.page === 1) {
        urls.value = response.data.content
      } else {
        urls.value.push(...response.data.content)
      }
      
      total.value = response.data.totalElements
      currentPage.value = response.data.page
      pageSize.value = response.data.size
      
      return response
    } finally {
      loading.value = false
    }
  }

  // 获取短链详情
  const fetchUrlDetails = async (id: number) => {
    loading.value = true
    try {
      const response = await urlApi.getUrlDetails(id)
      currentUrl.value = response.data
      return response
    } finally {
      loading.value = false
    }
  }

  // 更新短链
  const updateUrl = async (id: number, data: Partial<CreateShortUrlRequest>) => {
    loading.value = true
    try {
      const response = await urlApi.updateUrl(id, data)
      
      // 更新列表中的对应项
      const index = urls.value.findIndex(url => url.id === id)
      if (index !== -1) {
        urls.value[index] = response.data
      }
      
      // 更新当前选中的URL
      if (currentUrl.value?.id === id) {
        currentUrl.value = response.data
      }
      
      return response
    } finally {
      loading.value = false
    }
  }

  // 删除短链
  const deleteUrl = async (id: number) => {
    loading.value = true
    try {
      await urlApi.deleteUrl(id)
      
      // 从列表中移除
      urls.value = urls.value.filter(url => url.id !== id)
      total.value -= 1
      
      // 如果删除的是当前选中的URL，清空当前选择
      if (currentUrl.value?.id === id) {
        currentUrl.value = null
      }
    } finally {
      loading.value = false
    }
  }

  // 加载更多
  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      await fetchUrls({ page: currentPage.value + 1, size: pageSize.value })
    }
  }

  // 刷新列表
  const refresh = async () => {
    currentPage.value = 1
    await fetchUrls({ page: 1, size: pageSize.value })
  }

  // 清空数据
  const clear = () => {
    urls.value = []
    currentUrl.value = null
    total.value = 0
    currentPage.value = 1
  }

  return {
    urls,
    currentUrl,
    loading,
    total,
    currentPage,
    pageSize,
    hasMore,
    createUrl,
    fetchUrls,
    fetchUrlDetails,
    updateUrl,
    deleteUrl,
    loadMore,
    refresh,
    clear
  }
})