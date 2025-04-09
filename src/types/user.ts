export interface UserFromResponse {
  userid: number
  username: string
  account: string
  email: string
  level: 1 | 2
  status: number
  del: number
  profilepicture: string
  password?: string
}

export const USER_LEVEL_MAP = {
  1: '管理员',
  2: '普通用户',
} as const

export interface UserZustand extends UserFromResponse {
  // 处理后的base64图片字符串
  picture: string
}
