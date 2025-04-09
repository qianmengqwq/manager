import type { UserZustand } from '@/types/user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserState {
  // 当前登录用户信息
  currentUser: UserZustand | null
  // 是否已登录
  isLoggedIn: boolean
  // 登录动作
  login: (user: UserZustand) => void
  // 登出动作
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      currentUser: null,
      isLoggedIn: false,
      login: (user: UserZustand) => set({ currentUser: user, isLoggedIn: true }),
      logout: () => set({ currentUser: null, isLoggedIn: false }),
    }),
    {
      name: 'user-storage', // 本地存储的键名
    },
  ),
)
