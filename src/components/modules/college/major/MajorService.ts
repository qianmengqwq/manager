import type { ApiResponse } from '@/types/api'
import type {
  AddMajorParams,
  MajorListResult,
} from './majorType'

// 获取专业列表
export async function fetchMajors(
  majorname: string = '',
  collegename: string = '',
  collegeid?: number,
) {
  try {
    const requestBody: any = {
      page: 1,
      pageSize: 100,
      majorname,
      collegename,
    }

    // 仅当传入collegeid时添加到请求体中
    if (collegeid !== undefined) {
      requestBody.collegeid = collegeid
    }

    const response = await fetch(`/api/college/getmajor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error('获取专业列表失败')
    }

    const data = await response.json() as ApiResponse<MajorListResult>
    console.log({ majorData: data })

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取专业列表失败')
    }

    return {
      data: data.result.rows,
      total: data.result.total || 0,
    }
  }
  catch (error) {
    console.error({ fetchMajorsError: error })
    throw error
  }
}

// 添加专业
export async function addMajor(params: AddMajorParams) {
  try {
    const response = await fetch(`/api/college/addmagor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('添加专业失败')
    }

    const data = await response.json() as ApiResponse<any>

    if (data.code !== 1000) {
      throw new Error(data.msg || '添加专业失败')
    }

    return data.result
  }
  catch (error) {
    console.error({ addMajorError: error })
    throw error
  }
}

// 删除专业
export async function deleteMajor(majorid: number) {
  try {
    const response = await fetch(`/api/college/delmajor?majorid=${majorid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('删除专业失败')
    }

    const data = await response.json() as ApiResponse<any>

    if (data.code !== 1000) {
      throw new Error(data.msg || '删除专业失败')
    }

    return data.result
  }
  catch (error) {
    console.error({ deleteMajorError: error })
    throw error
  }
}
