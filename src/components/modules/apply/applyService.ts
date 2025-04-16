import type { Activity } from '@/types/activity'
import type { ApiResponse } from '@/types/api'
import type { ApplyRequest, ApplyResponse } from '@/types/apply'

export async function applyForActivity(applyData: ApplyRequest) {
  try {
    const response = await fetch('/api/apply/studentapply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applyData),
    })

    if (!response.ok) {
      throw new Error('报名请求失败')
    }

    const data = await response.json() as ApiResponse<ApplyResponse>

    console.log('活动报名响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '活动报名失败')
    }

    return data.result
  }
  catch (error) {
    console.error('活动报名错误:', error)
    throw error
  }
}

export async function checkActivityApplyStatus(studentid: string, activityid: number) {
  try {
    const response = await fetch('/api/apply/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentid,
        activityid,
      }),
    })

    if (!response.ok) {
      throw new Error('查询报名状态失败')
    }

    const data = await response.json() as ApiResponse<boolean>

    console.log('查询活动报名状态响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '查询报名状态失败')
    }

    return data.result
  }
  catch (error) {
    console.error('查询报名状态错误:', error)
    return false // 查询失败默认返回未报名
  }
}

export async function cancelActivityApply(studentid: string, activityid: number) {
  try {
    const response = await fetch('/api/apply/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentid,
        activityid,
      }),
    })

    if (!response.ok) {
      throw new Error('取消报名请求失败')
    }

    const data = await response.json() as ApiResponse<any>

    console.log('取消活动报名响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '取消活动报名失败')
    }

    return true
  }
  catch (error) {
    console.error('取消活动报名错误:', error)
    throw error
  }
}

export async function getStudentActivities(studentid: string) {
  try {
    const response = await fetch(`/api/apply/getstudentactivity?studentid=${studentid}`)

    if (!response.ok) {
      throw new Error('获取学生报名活动失败')
    }

    const data = await response.json() as ApiResponse<Activity[]>

    console.log('获取学生报名活动响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取学生报名活动失败')
    }

    return (data.result || []).filter(activity => activity !== null)
  }
  catch (error) {
    console.error('获取学生报名活动错误:', error)
    return [] // 查询失败返回空数组
  }
}
