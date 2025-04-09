export interface UserFromResponse {
  userid: number
  level: number
  username: string
  email: string
  profilepicture: string
}

export interface UserZustand extends UserFromResponse {
  // 处理后的base64图片字符串
  picture: string
}
