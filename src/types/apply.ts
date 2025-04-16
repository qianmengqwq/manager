export interface ApplyRequest {
  name: string
  sex: string
  studentid: string
  email: string
  activityid: number
  activityname: string
  qq: string
  telephone: string
  collegename: string
  majorname: string
  clazz: string
}

export interface ApplyResponse {
  id: number
  name: string
  sex: string
  studentid: string
  email: string
  activityid: number
  activityname: string
  qq: string
  telephone: string
  collegename: string
  majorname: string
  clazz: string
  applyTime: string
  status: number
} 