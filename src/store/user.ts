import type { UserZustand } from '@/types/user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserState {
  // 当前登录用户信息
  currentUser: UserZustand | null
  // 是否已登录
  isLoggedIn: boolean
  // 是否已通过二级验证
  isVerified: boolean
  // 二级验证的过期时间
  verifyExpireTime: number | null
  // 登录动作
  login: (user: UserZustand) => void
  // 登出动作
  logout: () => void
  // 设置二级验证状态
  setVerified: (verified: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      currentUser: null,
      isLoggedIn: false,
      isVerified: false,
      verifyExpireTime: null,
      login: (user: UserZustand) => set({ currentUser: user, isLoggedIn: true }),
      logout: () => set({ currentUser: null, isLoggedIn: false, isVerified: false, verifyExpireTime: null }),
      setVerified: (verified: boolean) => {
        if (verified) {
          // 设置验证过期时间为5分钟后
          const expireTime = Date.now() + 5 * 60 * 1000;
          set({ isVerified: true, verifyExpireTime: expireTime });
        } else {
          set({ isVerified: false, verifyExpireTime: null });
        }
      },
    }),
    {
      name: 'user-storage', // 本地存储的键名
    },
  ),
)

// 检查二级验证是否过期
export function checkVerifyExpired(): boolean {
  const { verifyExpireTime, isVerified } = useUserStore.getState();
  
  if (!isVerified || !verifyExpireTime) {
    return true;
  }
  
  // 当前时间超过过期时间，验证已过期
  return Date.now() > verifyExpireTime;
}
