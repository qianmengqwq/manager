import { getVerificationCode } from '@/lib/api'
import { useCallback, useState } from 'react'

/**
 * 验证码获取钩子，不使用SWR，改用简单的状态管理
 */
export function useCaptcha() {
  const [captchaImage, setCaptchaImage] = useState<ArrayBuffer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 手动请求验证码的函数
  const refreshCaptcha = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const newCaptchaImage = await getVerificationCode()
      setCaptchaImage(newCaptchaImage)
      return newCaptchaImage
    }
    catch (err) {
      const captchaError = err instanceof Error ? err : new Error('获取验证码失败')
      setError(captchaError)
      throw captchaError
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  return {
    captchaImage,
    isLoading,
    error,
    refreshCaptcha,
  }
}
