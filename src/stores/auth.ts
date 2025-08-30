import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api'
import type { LoginRequest, RegisterRequest, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // 登录
  const login = async (credentials: LoginRequest) => {
    loading.value = true
    try {
      const response = await userApi.login(credentials)
      token.value = response.data
      localStorage.setItem('token', response.data)
      
      // 获取用户信息
      await getUserInfo()
      return response
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterRequest) => {
    loading.value = true
    try {
      const response = await userApi.register(userData)
      return response
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    if (!token.value) return
    
    try {
      const response = await userApi.getUserInfo()
      user.value = response.data
    } catch (error) {
      // 如果获取用户信息失败，清除token
      logout()
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // 初始化 - 如果有token，尝试获取用户信息
  const init = async () => {
    if (token.value) {
      try {
        await getUserInfo()
      } catch (error) {
        console.error('初始化用户信息失败:', error)
      }
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    register,
    getUserInfo,
    logout,
    init
  }
})