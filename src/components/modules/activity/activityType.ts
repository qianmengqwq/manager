import type { ApiResponse } from '@/types/api'

// 定义活动类型
export interface Activity {
  activityid: number
  activityname: string
  speaker: string
  college: string
  savetime: string
  releasetime: string
  signtime: string
  holdtime: string
  totalnumber: number
  introduce?: string
  status: number
  del?: number
  piclist: string[] | null
}

// API响应中result的实际结构
export interface ActivityListResult {
  total: number
  pageTotal: number
  rows: Activity[]
}

// 活动筛选条件类型
export interface ActivityFilter {
  activityid?: number
  activityname?: string
  speaker?: string
  college?: string
  savetime?: string
  releasetime?: string
  signtime?: string
  holdtime?: string
  totalnumber?: number
  status?: number
  del?: number
}

// 创建活动请求类型
export interface CreateActivityRequest {
  activityid?: number
  activityname: string
  speaker: string
  college: string
  signtime: string
  holdtime: string
  introduce: string
  totalnumber: number
  piclist: string[] | null
}

// 更新活动请求类型
export interface UpdateActivityRequest {
  activityid: number
  activityname: string
  speaker: string
  college: string
  signtime: string
  holdtime: string
  introduce: string
  totalnumber: number
  piclist: string[] | null
}

// 根据状态返回对应的标签文本
export function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return '已保存'
    case 1:
      return '审核未通过'
    case 2:
      return '已发布'
    case 3:
      return '已归档'
    default:
      return `未知(${status})`
  }
}

// 根据状态获取对应的颜色
export function getStatusColor(status: number): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (status) {
    case 0:
      return 'secondary'
    case 1:
      return 'destructive'
    case 2:
      return 'default'
    case 3:
      return 'outline'
    default:
      return 'secondary'
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
