import type { ApiResponse } from '@/types/api'

// 定义活动报名信息类型
export interface ActivitySignup {
  applyid: number
  activityid: number
  activityname: string
  name: string
  sex: string
  studentid: string
  email: string
  qq: string
  telephone: string
  collegename: string
  majorname: string
  clazz: string
  ischeck: number // 0未成功报名、1成功报名
  createtime: string
}

// API响应中result的实际结构
export interface SignupListResult {
  total: number
  pageTotal: number
  rows: ActivitySignup[]
}

// 活动报名筛选条件类型
export interface SignupFilter {
  page?: number
  PageSize?: number
  name?: string
  sex?: string
  studentid?: string
  email?: string
  activityid?: number
  activityname?: string
  qq?: string
  telephone?: string
  collegename?: string
  majorname?: string
  clazz?: string
  ischeck?: number | null
}

// 根据审核状态返回对应的标签文本
export function getCheckStatusText(ischeck: number): string {
  switch (ischeck) {
    case 0:
      return '未审核'
    case 1:
      return '已通过'
    default:
      return `未知(${ischeck})`
  }
}

// 根据审核状态获取对应的颜色
export function getCheckStatusColor(ischeck: number): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (ischeck) {
    case 0:
      return 'secondary'
    case 1:
      return 'default'
    default:
      return 'outline'
  }
}

// 格式化日期时间
export function formatDateTime(dateString: string): string {
  if (!dateString)
    return '-'
  try {
    return new Date(dateString.replace(/-/g, '/')).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
} 