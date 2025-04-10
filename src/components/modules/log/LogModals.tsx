import type { EventLog } from './logType'
import { Badge } from '@/components/ui/badge'
import { getLevelText, getEventDetails, getOperationType } from './logType'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback } from 'react'

// 日志详情模态框
export function useLogDetailModal() {
  const { present } = useModalStack()

  return useCallback((log: EventLog) => {
    present({
      title: '日志详情',
      content: () => {
        // 格式化日期
        const formatDate = (dateString: string) => {
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }
          return new Date(dateString.replace(/-/g, '/')).toLocaleString('zh-CN', options)
        }

        // 获取操作类型
        const operationType = getOperationType(log.event)

        // 日志级别标签
        const getLevelBadge = (level: number) => {
          switch (level) {
            case 1:
              return <Badge className="bg-blue-500">管理员</Badge>
            case 2:
              return <Badge className="bg-purple-500">普通用户</Badge>
            default:
              return (
                <Badge>
                  未知(
                  {level}
                  )
                </Badge>
              )
          }
        }

        // 操作类型颜色映射
        const getOperationBadge = (operation: string) => {
          const colorMap: Record<string, string> = {
            '查询': 'bg-gray-100 text-gray-800',
            '创建': 'bg-blue-100 text-blue-800',
            '更新': 'bg-amber-100 text-amber-800',
            '删除': 'bg-red-100 text-red-800',
            '登录': 'bg-green-100 text-green-800',
            '登出': 'bg-green-100 text-green-800',
            '发送': 'bg-indigo-100 text-indigo-800',
            '导入': 'bg-purple-100 text-purple-800',
            '导出': 'bg-purple-100 text-purple-800',
          }
          
          const color = colorMap[operation] || 'bg-gray-100 text-gray-800'
          return <Badge variant="outline" className={color}>{operation}</Badge>
        }

        return (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getLevelBadge(log.level)}
                <span className="text-muted-foreground text-sm">
                  {formatDate(log.eventtime)}
                </span>
              </div>
              <Badge variant="outline">{log.module}</Badge>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">操作类型: </span>
                {getOperationBadge(operationType)}
              </div>
              <p className="text-sm break-words">{log.event}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">操作人</p>
                <p>
                  {log.username}
                  {' '}
                  (ID:
                  {' '}
                  {log.userid}
                  )
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">用户角色</p>
                <p>{getLevelText(log.level)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP地址</p>
                <p>{log.ip}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">事件ID</p>
                <p>{log.eventid}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">详细信息</p>
              <div className="bg-muted p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  {getEventDetails(log.event)}
                </pre>
              </div>
            </div>
          </div>
        )
      },
    })
  }, [present])
} 