// API 响应通用类型
export interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  data: T
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

// URL映射相关类型
export interface UrlMapping {
  id: number
  shortCode: string
  originalUrl: string
  userId?: number
  title?: string
  description?: string
  domain?: string
  clickCount: number
  status: number
  expireTime?: string
  createdTime: string
  updatedTime: string
}

export interface CreateShortUrlRequest {
  originalUrl: string
  title?: string
  description?: string
  domain?: string
  expireTime?: string
}

// 统计数据类型
export interface ClickStatistic {
  id: number
  shortCode: string
  userAgent: string
  ipAddress: string
  referer?: string
  clickTime: string
}

export interface DashboardStats {
  totalUrls: number
  totalClicks: number
  todayClicks: number
  recentUrls: UrlMapping[]
  topUrls: UrlMapping[]
}

// 分页类型
export interface PaginationParams {
  page: number
  size: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}