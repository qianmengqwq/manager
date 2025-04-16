import type { ApiResponse } from '@/types/api'
import type { Student } from '@/types/student'

export async function getStudentInfo(studentId: string, password: string) {
  try {
    const response = await fetch(`/api/apply/isStudent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        password,
      }),
    })

    if (!response.ok) {
      throw new Error('获取学生数据成功')
    }

    const data = await response.json() as ApiResponse<Student>

    console.log('学生校验响应:', data)

    if (data.code !== 1000) {
      throw new Error(data.msg || '获取学生信息失败')
    }

    // 临时返回一个模拟的学生数据，实际应该返回 data.result
    return data.result
  }
  catch (error) {
    console.error('获取学生信息错误:', error)
    throw error
  }
}
