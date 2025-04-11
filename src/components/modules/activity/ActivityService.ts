import type { ApiResponse } from '@/types/api'
import type { CreateActivityRequest, UpdateActivityRequest } from './activityType'

// 查询活动列表
export async function fetchActivities(
  page: number,
  pageSize: number,
  filters?: {
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
  },
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
        activityid: filters?.activityid || undefined,
        activityname: filters?.activityname || '',
        speaker: filters?.speaker || '',
        college: filters?.college || '',
        savetime: filters?.savetime || undefined,
        releasetime: filters?.releasetime || undefined,
        signtime: filters?.signtime || undefined,
        holdtime: filters?.holdtime || undefined,
        totalnumber: filters?.totalnumber || undefined,
        status: filters?.status || undefined,
        del: filters?.del || undefined,
      }),
    })

    if (!response.ok) {
      throw new Error('获取活动列表失败')
    }

    const data = await response.json() as ApiResponse<any>
    console.log('活动数据响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取活动列表失败')
    }

    // 判断返回的数据结构
    if (Array.isArray(data.result)) {
      // 如果result直接是一个数组，使用这个数组作为数据源
      return {
        data: data.result,
        total: data.result.length,
        pageTotal: Math.ceil(data.result.length / pageSize) || 1,
        page,
        pageSize,
      }
    }
    else {
      // 原来的逻辑，当result包含rows字段时
      return {
        data: data.result.rows,
        total: data.result.total || 0,
        pageTotal: data.result.pageTotal || 0,
        page,
        pageSize,
      }
    }
  }
  catch (error) {
    console.error('获取活动列表错误:', error)
    throw error
  }
}

// 创建活动
export async function createActivity(activityData: CreateActivityRequest) {
  try {
    const response = await fetch(`/api/activity/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    })

    if (!response.ok) {
      throw new Error('创建活动失败')
    }

    const data = await response.json() as ApiResponse<any>
    console.log('创建活动响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '创建活动失败')
    }

    return data.result
  }
  catch (error) {
    console.error('创建活动错误:', error)
    throw error
  }
}

// 更新活动
export async function updateActivity(activityData: UpdateActivityRequest) {
  try {
    const response = await fetch(`/api/activity/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    })

    if (!response.ok) {
      throw new Error('更新活动失败')
    }

    const data = await response.json() as ApiResponse<any>
    console.log('更新活动响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '更新活动失败')
    }

    return data.result
  }
  catch (error) {
    console.error('更新活动错误:', error)
    throw error
  }
}

// 删除活动
export async function deleteActivity(activityId: number) {
  try {
    const response = await fetch(`/api/activity/delete?activityid=${activityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('删除活动失败')
    }

    const data = await response.json() as ApiResponse<any>
    console.log('删除活动响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '删除活动失败')
    }

    return data.result
  }
  catch (error) {
    console.error('删除活动错误:', error)
    throw error
  }
}

// 归档活动
export async function archiveActivity(activityId: number) {
  try {
    const response = await fetch(`/api/activity/gofile?activityid=${activityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('归档活动失败')
    }

    const data = await response.json() as ApiResponse<any>
    console.log('归档活动响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '归档活动失败')
    }

    return data.result
  }
  catch (error) {
    console.error('归档活动错误:', error)
    throw error
  }
}

// 审核活动
export async function checkActivity(activityId: number, status: number) {
  try {
    const response = await fetch(`/api/activity/check?activityid=${activityId}&status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('审核活动失败')
    }

    const data = await response.json() as ApiResponse<any>
    console.log('审核活动响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '审核活动失败')
    }

    return data.result
  }
  catch (error) {
    console.error('审核活动错误:', error)
    throw error
  }
}
