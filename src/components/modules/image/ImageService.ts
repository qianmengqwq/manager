import type { ApiResponse } from '@/types/api'

// 获取用户头像
export async function fetchUserAvatar(profilePicture: string) {
  try {
    const response = await fetch(`/api/user/getuserpic?key=${profilePicture}`)

    if (!response.ok) {
      throw new Error('获取头像失败')
    }

    const data = await response.json()

    if (data.code !== 1000) {
      throw new Error('获取头像失败')
    }

    const imageData = data.result
    return `data:image/jpeg;base64,${imageData}`
  }
  catch (error) {
    console.error('获取头像失败:', error)
    throw error
  }
}

// 上传用户头像
export async function uploadUserAvatar(userId: number, file: File) {
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

    const data = await response.json() as ApiResponse<any>
    console.log('头像上传响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '上传头像失败')
    }

    return data
  }
  catch (error) {
    console.error('上传头像错误:', error)
    throw error
  }
} 