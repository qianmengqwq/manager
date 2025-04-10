import type { ApiResponse } from '@/types/api'

// 定义专业类型
export interface Major {
  majorid: number
  majorname: string
  collegeid: number
  collegename: string
  del: number
}

// API响应中result的实际结构 - 专业
export interface MajorListResult {
  total: number
  pageTotal: number
  rows: Major[]
}

// 专业筛选条件类型
export interface MajorFilter {
  majorname?: string
  collegename?: string
  collegeid?: number
}

// 新增专业请求参数
export interface AddMajorParams {
  majorname: string
  collegeid: number
  collegename: string
}

// 更新专业请求参数
export interface UpdateMajorParams {
  majorid: number
  majorname: string
  collegeid: number
  collegename?: string
} 