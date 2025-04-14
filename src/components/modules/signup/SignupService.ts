import type { ApiResponse } from '@/types/api'
import type { SignupFilter, SignupListResult } from './signupType'

// 查询活动列表
export async function fetchActivities(
  page = 1,
  pageSize = 10,
  filters?: Record<string, any>,
) {
  try {
    const response = await fetch('/api/activity/fuzzyPage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        pageSize,
        ...filters,
      }),
    })

    if (!response.ok)
      throw new Error('获取活动列表失败')

    const data = await response.json() as ApiResponse<any>
    console.log({ 活动数据响应: data })

    if (data.code !== 1000)
      throw new Error(data.msg || '获取活动列表失败')

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
    console.error({ 获取活动列表错误: error })
    throw error
  }
}

// 查询活动报名信息
export async function fetchActivitySignups(filters: SignupFilter) {
  try {
    const response = await fetch('/api/activity/fuzzyGetApply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: filters.page || 1,
        PageSize: filters.PageSize || 10,
        name: filters.name || '',
        sex: filters.sex || '',
        studentid: filters.studentid || '',
        email: filters.email || '',
        activityid: filters.activityid || undefined,
        activityname: filters.activityname || '',
        qq: filters.qq || '',
        telephone: filters.telephone || '',
        collegename: filters.collegename || '',
        majorname: filters.majorname || '',
        clazz: filters.clazz || '',
        ischeck: filters.ischeck === undefined ? null : filters.ischeck,
      }),
    })

    if (!response.ok)
      throw new Error('获取报名信息失败')

    const data = await response.json() as ApiResponse<SignupListResult>
    console.log({ 报名数据响应: data })

    if (data.code !== 1000)
      throw new Error(data.msg || '获取报名信息失败')

    // 判断返回的数据结构
    if (Array.isArray(data.result)) {
      // 如果result直接是一个数组，使用这个数组作为数据源
      return {
        data: data.result,
        total: data.result.length,
        pageTotal: Math.ceil(data.result.length / (filters.PageSize || 10)) || 1,
        page: filters.page || 1,
        pageSize: filters.PageSize || 10,
      }
    }
    else {
      // 原来的逻辑，当result包含rows字段时
      return {
        data: data.result.rows,
        total: data.result.total || 0,
        pageTotal: data.result.pageTotal || 0,
        page: filters.page || 1,
        pageSize: filters.PageSize || 10,
      }
    }
  }
  catch (error) {
    console.error({ 获取报名信息错误: error })
    throw error
  }
}

// 审核报名
export async function checkActivitySignup(applyId: number, isCheck: number) {
  try {
    const response = await fetch(`/api/activity/checkapply?applyid=${applyId}&ischeck=${isCheck}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok)
      throw new Error('审核报名失败')

    const data = await response.json() as ApiResponse<any>
    console.log({ 审核报名响应: data })

    if (data.code !== 1000)
      throw new Error(data.msg || '审核报名失败')

    return data.result
  }
  catch (error) {
    console.error({ 审核报名错误: error })
    throw error
  }
}

// 自动筛选报名
export async function autoFilterSignups(
  activityId: number,
  conditions: Record<string, { value: string | null, priority: number }>,
) {
  try {
    // 将条件按优先级排序
    const sortedConditions = Object.entries(conditions)
      .sort((a, b) => a[1].priority - b[1].priority)
      .reduce((acc, [key, { value }]) => {
        acc[key] = value || null
        return acc
      }, {} as Record<string, string | null>)

    const response = await fetch('/api/activity/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityid: activityId,
        conditions: sortedConditions,
      }),
    })

    if (!response.ok)
      throw new Error('自动筛选失败')

    const data = await response.json() as ApiResponse<any>
    console.log({ 自动筛选响应: data })

    if (data.code !== 1000)
      throw new Error(data.msg || '自动筛选失败')

    return data.result
  }
  catch (error) {
    console.error({ 自动筛选错误: error })
    throw error
  }
}

// 发送邮件通知
export async function sendEmailNotification(activityId: number) {
  try {
    const response = await fetch(`/api/activity/sendemailtostudent?activityid=${activityId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok)
      throw new Error('发送邮件通知失败')

    const data = await response.json() as ApiResponse<any>
    console.log({ 发送邮件通知响应: data })

    if (data.code !== 1000)
      throw new Error(data.msg || '发送邮件通知失败')

    return data.result
  }
  catch (error) {
    console.error({ 发送邮件通知错误: error })
    throw error
  }
}

// 获取活动分析数据
export async function fetchActivityAnalysis(activityId: number) {
  try {
    const response = await fetch(`/api/activity/getanalysis?activityid=${activityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok)
      throw new Error('获取活动分析数据失败')

    const data = await response.json() as ApiResponse<any>
    console.log({ 活动分析数据响应: data })

    if (data.code !== 1000)
      throw new Error(data.msg || '获取活动分析数据失败')

    return data.result
  }
  catch (error) {
    console.error({ 获取活动分析数据错误: error })
    throw error
  }
}
