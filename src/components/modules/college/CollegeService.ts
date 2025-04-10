import type { ApiResponse } from '@/types/api'
import type {
  AddCollegeParams,
  CollegeListResult,
  UpdateCollegeParams,
} from './collegeType'

// 获取学院列表
export async function fetchColleges(collegename: string = '') {
  try {
    const response = await fetch(`/api/college/getall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 1,
        pageSize: 100,
        collegename,
      }),
    })

    if (!response.ok) {
      throw new Error('获取学院列表失败')
    }

    const data = await response.json() as ApiResponse<CollegeListResult>
    console.log({ collegeData: data })

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取学院列表失败')
    }

    return {
      data: data.result.rows,
      total: data.result.total || 0,
    }
  }
  catch (error) {
    console.error({ fetchCollegesError: error })
    throw error
  }
}

// 添加学院
export async function addCollege(params: AddCollegeParams) {
  try {
    const response = await fetch(`/api/college/addcollege`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('添加学院失败')
    }

    const data = await response.json() as ApiResponse<any>

    if (data.code !== 1000) {
      throw new Error(data.msg || '添加学院失败')
    }

    return data.result
  }
  catch (error) {
    console.error({ addCollegeError: error })
    throw error
  }
}

// 删除学院
export async function deleteCollege(collegeid: number) {
  try {
    const response = await fetch(`/api/college/delcollege?collegeid=${collegeid}`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('删除学院失败')
    }

    const data = await response.json() as ApiResponse<any>

    if (data.code !== 1000) {
      throw new Error(data.msg || '删除学院失败')
    }

    return data.result
  }
  catch (error) {
    console.error({ deleteCollegeError: error })
    throw error
  }
}
