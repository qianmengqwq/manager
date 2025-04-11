import type { ApiResponse } from '@/types/api'
import type { EventLogListResult } from './logType'

// 获取系统事件日志
export async function fetchEventLogs(
  page: number,
  pageSize: number,
  filters?: {
    module?: string
    username?: string
    level?: number
    ip?: string
    dateFrom?: string
    dateTo?: string
    event?: string
  },
) {
  try {
    const response = await fetch(`/api/event/getevent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        pageSize,
        module: filters?.module || '',
        username: filters?.username || '',
        level: filters?.level || 0,
        ip: filters?.ip || '',
        dateTime: filters?.dateFrom ? filters.dateFrom : '',
        event: filters?.event || '',
      }),
    })

    if (!response.ok) {
      throw new Error('获取日志列表失败')
    }

    const data = await response.json() as ApiResponse<EventLogListResult>
    console.log('日志数据响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取日志列表失败')
    }

    return {
      data: data.result.rows,
      total: data.result.total || 0,
      pageTotal: data.result.pageTotal || 0,
      page,
      pageSize,
    }
  }
  catch (error) {
    console.error('获取日志列表错误:', error)
    throw error
  }
}

// 导出日志数据 (如果后端支持，可以实现此功能)
export async function exportEventLogs(filter?: Record<string, any>) {
  try {
    const response = await fetch(`/api/event/exportevents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter || {}),
    })

    if (!response.ok) {
      throw new Error('导出日志失败')
    }

    // 获取blob数据
    const blob = await response.blob()

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `系统日志_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()

    // 清理
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return true
  }
  catch (error) {
    console.error('导出日志错误:', error)
    throw error
  }
}
