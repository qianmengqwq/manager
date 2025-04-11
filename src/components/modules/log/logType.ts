import type { ApiResponse } from '@/types/api'

// 定义日志类型
export interface EventLog {
  eventid: number
  module: string
  userid: number
  username: string
  level: number
  ip: string
  eventtime: string
  event: string
}

// API响应中result的实际结构
export interface EventLogListResult {
  total: number
  pageTotal: number
  rows: EventLog[]
}

// 日志筛选条件类型
export interface EventLogFilter {
  module?: string
  username?: string
  searchTerm?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
}

// 根据level返回对应的角色名称
export function getLevelText(level: number): string {
  switch (level) {
    case 1:
      return '管理员'
    case 2:
      return '普通用户'
    default:
      return `未知(${level})`
  }
}

// 从事件内容中提取操作类型
export function getOperationType(event: string): string {
  // 提取方法名
  const methodMatch = event.match(/\.([^.(]+)\(/)
  if (methodMatch && methodMatch[1]) {
    const method = methodMatch[1]

    // 根据方法名推断操作类型
    if (method.startsWith('get') || method.includes('query') || method.includes('select'))
      return '查询'
    if (method.startsWith('add') || method.includes('create') || method.includes('insert'))
      return '创建'
    if (method.startsWith('update') || method.includes('modify') || method.includes('edit'))
      return '更新'
    if (method.startsWith('delete') || method.includes('remove'))
      return '删除'
    if (method.includes('login'))
      return '登录'
    if (method.includes('logout'))
      return '登出'
    if (method.includes('send') || method.includes('email'))
      return '发送'
    if (method.includes('import'))
      return '导入'
    if (method.includes('export'))
      return '导出'
    if (method.includes('secondaryVerify'))
      return '二次验证'
    if (method.includes('goFile'))
      return '归档'
    if (method.includes('check'))
      return '审核'
    return method
  }

  return '其他'
}

// 从事件内容中提取消息内容
export function getEventMessage(event: string): string {
  // 尝试提取JSON结果部分
  const resultMatch = event.match(/结果：(\{.+\})/)
  if (resultMatch && resultMatch[1]) {
    try {
      const resultJson = JSON.parse(resultMatch[1])
      if (resultJson.msg) {
        return resultJson.msg
      }
    }
    catch (e) {
      // 解析JSON失败，忽略错误
    }
  }

  // 提取方法名作为消息
  const methodMatch = event.match(/\.([^.(]+)\(/)
  if (methodMatch && methodMatch[1]) {
    // 将驼峰命名转换为空格分隔的可读文本
    return methodMatch[1].replace(/([A-Z])/g, ' $1').trim()
  }

  // 如果都提取不到，返回截断的事件内容
  return event.length > 80 ? `${event.substring(0, 80)}...` : event
}

// 提取事件详情
export function getEventDetails(event: string): string {
  return event
}
