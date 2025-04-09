import type { ApiResponse } from '@/types/api'
import type { UserFromResponse } from '@/types/user'
import type { UserFormValues, UserListResult } from './userType'
import { checkVerifyExpired, useUserStore } from '@/store/user'

// 获取用户列表
export async function fetchUsers(page: number, pageSize: number) {
  const response = await fetch(`/api/user/selectall`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page, pageSize }),
  })

  if (!response.ok) {
    throw new Error('获取用户列表失败')
  }

  const data = await response.json() as ApiResponse<UserListResult>

  if (data.code !== 1000) {
    throw new Error(data.msg || '获取用户列表失败')
  }

  return {
    data: data.result.rows,
    total: data.result.total || 0,
    pageTotal: data.result.pageTotal || 0,
    page,
    pageSize,
  }
}

// 获取单个用户详情
export async function fetchUserDetail(userId: number): Promise<UserFromResponse | null> {
  // 这里没有实现对应的接口，毕竟也没有真正的需要
  // 直接传row实际上是够展示的，这里只是为了保持功能写法上的一致
  try {
    const response = await fetch(`/api/user/selectall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page: 1, pageSize: 100 }),
    })

    if (!response.ok) {
      throw new Error('获取用户详情失败')
    }

    const data = await response.json() as ApiResponse<UserListResult>

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取用户详情失败')
    }

    // 从rows数组中查找对应用户
    const user = data.result.rows.find(u => u.userid === userId)

    if (!user) {
      return null
    }

    return user
  }
  catch (error) {
    console.error('获取用户详情失败', error)
    throw new Error('获取用户详情失败')
  }
}

// 添加用户
export async function addUser(userData: UserFormValues) {
  const response = await fetch(`/api/user/adduser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error('添加用户失败')
  }

  const data = await response.json() as ApiResponse<any>

  if (data.code !== 1000) {
    throw new Error(data.msg || '添加用户失败')
  }

  return data.result
}

// 更新用户
export async function updateUser(userData: UserFormValues) {
  const response = await fetch(`/api/user/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error('更新用户失败')
  }

  const data = await response.json() as ApiResponse<any>

  if (data.code !== 1000) {
    throw new Error(data.msg || '更新用户失败')
  }

  return data.result
}

// 删除用户
export async function deleteUser(userId: number) {
  const response = await fetch(`/api/user/deleteuser?userid=${userId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('删除用户失败')
  }

  const data = await response.json() as ApiResponse<any>

  if (data.code !== 1000) {
    throw new Error(data.msg || '删除用户失败')
  }

  return data.result
}

// 二级验证接口
export async function performSecondaryVerify(userId: number, password: string) {
  try {
    // 如果验证未过期，直接返回成功
    if (!checkVerifyExpired()) {
      return true
    }

    const response = await fetch(`/api/user/secondaryverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: userId,
        password,
      }),
    })

    if (!response.ok) {
      throw new Error('验证失败')
    }

    const data = await response.json() as ApiResponse<any>

    if (data.code !== 1000) {
      throw new Error(data.msg || '验证失败')
    }

    // 验证成功，设置验证状态
    useUserStore.getState().setVerified(true)
    return true
  }
  catch (error) {
    // 验证失败，确保状态为未验证
    useUserStore.getState().setVerified(false)
    console.error('二级验证失败', error)
    throw error
  }
}

// 检查是否需要二级验证
export function isSecondaryVerifyRequired(error: unknown): boolean {
  // 首先检查是否已通过验证且未过期
  if (!checkVerifyExpired()) {
    return false
  }

  // 检查错误是否包含二级验证相关信息
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase()
    return errorMsg.includes('二级验证')
      || errorMsg.includes('需要验证')
      || errorMsg.includes('验证失败')
      || errorMsg.includes('验证')
  }

  // 如果是API错误对象
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && (error as any).code === 1001) {
      return true
    }

    if ('msg' in error) {
      const msg = String((error as any).msg).toLowerCase()
      return msg.includes('二级验证')
        || msg.includes('需要验证')
        || msg.includes('验证失败')
        || msg.includes('验证')
    }
  }

  return false
}

// 上传用户头像
export async function uploadUserPicture(userId: number, file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userid', userId.toString())

    const response = await fetch(`/api/user/uploadpic`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('上传头像失败')
    }

    // 添加详细的控制台日志，帮助调试
    const data = await response.json()
    console.log('头像上传响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '上传头像失败')
    }

    // 返回完整响应以便后续处理
    return data
  }
  catch (error) {
    console.error('上传头像错误:', error)
    throw error
  }
}
