import type { Activity } from '@/types/activity'
import type { ApiResponse } from '@/types/api'

// 查询活动列表
export async function fetchActivities(
  page: number,
  pageSize: number,
) {
  try {
    const response = await fetch(`/api/activity/fuzzyPage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        pageSize,
      }),
    })

    if (!response.ok) {
      throw new Error('获取活动列表失败')
    }

    const data = await response.json() as ApiResponse<Activity[]>

    console.log('活动数据响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取活动列表失败')
    }

    return {
      data: data.result,
      total: data.result.length || 0,
    }
  }
  catch (error) {
    console.error('获取活动列表错误:', error)
    throw error
  }
}
