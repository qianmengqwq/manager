import type { ApiResponse } from '@/types/api'
import type { Major } from './major/majorType'

// 定义学院类型
export interface College {
  collegeid: number
  collegename: string
}

// API响应中result的实际结构 - 学院
export interface CollegeListResult {
  total: number
  pageTotal: number
  rows: College[]
}

// 学院筛选条件类型
export interface CollegeFilter {
  collegename?: string
}

// 新增学院请求参数
export interface AddCollegeParams {
  collegename: string
}

// 更新学院请求参数
export interface UpdateCollegeParams {
  collegeid: number
  collegename: string
}
