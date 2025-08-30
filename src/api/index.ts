import httpClient from '@/utils/http'
import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  CreateShortUrlRequest, 
  UrlMapping,
  DashboardStats,
  PaginatedResponse,
  PaginationParams
} from '@/types'

// 用户相关API
export const userApi = {
  // 用户登录
  login(data: LoginRequest): Promise<ApiResponse<string>> {
    return httpClient.post('/user/login', data).then(res => res.data)
  },

  // 用户注册
  register(data: RegisterRequest): Promise<ApiResponse<void>> {
    return httpClient.post('/user/register', data).then(res => res.data)
  },

  // 获取用户信息
  getUserInfo(): Promise<ApiResponse<any>> {
    return httpClient.get('/user/info').then(res => res.data)
  }
}

// 短链相关API
export const urlApi = {
  // 创建短链
  createShortUrl(data: CreateShortUrlRequest): Promise<ApiResponse<UrlMapping>> {
    return httpClient.post('/urls', data).then(res => res.data)
  },

  // 获取用户的短链列表
  getUserUrls(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<UrlMapping>>> {
    return httpClient.get('/urls/my', { params }).then(res => res.data)
  },

  // 获取短链详情
  getUrlDetails(id: number): Promise<ApiResponse<UrlMapping>> {
    return httpClient.get(`/urls/${id}`).then(res => res.data)
  },

  // 更新短链
  updateUrl(id: number, data: Partial<CreateShortUrlRequest>): Promise<ApiResponse<UrlMapping>> {
    return httpClient.put(`/urls/${id}`, data).then(res => res.data)
  },

  // 删除短链
  deleteUrl(id: number): Promise<ApiResponse<void>> {
    return httpClient.delete(`/urls/${id}`).then(res => res.data)
  },

  // 获取短链统计信息
  getUrlStats(shortCode: string): Promise<ApiResponse<any>> {
    return httpClient.get(`/urls/${shortCode}/stats`).then(res => res.data)
  }
}

// 统计相关API
export const statsApi = {
  // 获取仪表板统计数据
  getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return httpClient.get('/stats/dashboard').then(res => res.data)
  },

  // 获取点击统计数据
  getClickStats(shortCode: string, days: number = 30): Promise<ApiResponse<any>> {
    return httpClient.get(`/stats/clicks/${shortCode}`, { 
      params: { days } 
    }).then(res => res.data)
  }
}