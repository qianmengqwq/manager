import { toast } from 'react-hot-toast'

// 使用相对路径，将通过Vite代理转发
const API_URL = '/api'

/**
 * 通用的fetch封装，处理错误和响应转换
 */
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '请求失败' }))
      throw new Error(errorData.message || `请求失败: ${response.status}`)
    }

    return await response.json()
  }
  catch (error) {
    const message = error instanceof Error ? error.message : '请求出错'
    toast.error(message)
    throw error
  }
}

/**
 * 获取验证码图片的ArrayBuffer
 * 使用POST方法请求，返回验证码图片的ArrayBuffer数据
 */
export async function getVerificationCode(): Promise<ArrayBuffer> {
  try {
    // 添加时间戳参数防止缓存
    const timestamp = new Date().getTime()
    const url = `${API_URL}/user/getcode?t=${timestamp}`

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': '*/*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      toast.error(`获取验证码失败: ${response.status}`)
      throw new Error(`获取验证码失败: ${response.status}`)
    }

    // 获取ArrayBuffer格式的响应数据
    return await response.arrayBuffer()
  }
  catch (error) {
    const message = error instanceof Error ? error.message : '获取验证码失败'
    toast.error(message)
    console.error('获取验证码错误:', error)
    throw error
  }
}
