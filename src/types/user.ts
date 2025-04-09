export interface UserFromResponse {
  userid: number
  level: 1 | 2
  username: string
  email: string
  profilepicture: string
}

export const levelToRoleMap = {
  1: '管理员',
  2: '普通用户',
}

export type UserRole = (typeof levelToRoleMap)[keyof typeof levelToRoleMap]

export interface UserZustand extends UserFromResponse {
  // 处理后的base64图片字符串
  picture: string
}
