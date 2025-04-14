import type { ApiResponse } from '@/types/api'
import type { EventLog, EventLogListResult } from './logType'
import { getLevelText, getOperationType } from './logType'

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

// 导出日志数据 (前端实现)
export async function exportEventLogs(
  logs: EventLog[],
  fileName = `系统日志_${new Date().toISOString().split('T')[0]}`,
) {
  try {
    // 引入必要的库
    const XLSX = await import('xlsx')

    // 准备导出数据
    const exportData = logs.map(log => ({
      事件ID: log.eventid,
      时间: new Date(log.eventtime.replace(/-/g, '/')).toLocaleString('zh-CN'),
      模块: log.module,
      操作类型: getOperationType(log.event),
      用户ID: log.userid,
      用户名: log.username,
      用户角色: getLevelText(log.level),
      IP地址: log.ip,
      事件内容: log.event,
    }))

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    const columnWidths = [
      { wch: 10 }, // 事件ID
      { wch: 20 }, // 时间
      { wch: 15 }, // 模块
      { wch: 10 }, // 操作类型
      { wch: 10 }, // 用户ID
      { wch: 15 }, // 用户名
      { wch: 10 }, // 用户角色
      { wch: 15 }, // IP地址
      { wch: 50 }, // 事件内容
    ]
    worksheet['!cols'] = columnWidths

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '系统日志')

    // 生成Excel文件并下载
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return true
  }
  catch (error) {
    console.error('导出日志错误:', error)
    throw error
  }
}
