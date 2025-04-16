// 获取活动图片预览
export async function fetchActivityImage(imageKey: string) {
  try {
    const response = await fetch(`/api/activity/getpic?key=${imageKey}`)

    if (!response.ok) {
      throw new Error('获取图片失败')
    }

    // 后端直接返回图片数据，不再需要解析JSON
    const imageBlob = await response.blob()
    return URL.createObjectURL(imageBlob)
  }
  catch (error) {
    console.error('获取图片失败:', error)
    throw error
  }
}
