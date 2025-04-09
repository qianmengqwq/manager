import type { UserFromResponse } from '@/types/user'
import { z } from 'zod'

// 用户表单验证schema
export const userFormSchema = z.object({
  userid: z.number().nullable(),
  username: z.string().min(2, '用户名至少需要2个字符'),
  account: z.string().min(2, '账号至少需要2个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  level: z.number().int().min(1).max(2),
  profilepicture: z.string().optional(),
})

// 表单值类型
export type UserFormValues = z.infer<typeof userFormSchema>

// API响应中result的实际结构
export interface UserListResult {
  total: number
  pageTotal: number
  rows: UserFromResponse[]
}

// 用户角色映射
export const USER_ROLE_MAP = {
  1: '管理员',
  2: '普通用户',
}

// 用户角色选项
export const USER_ROLE_OPTIONS = [
  { value: '1', label: '管理员' },
  { value: '2', label: '普通用户' },
]
