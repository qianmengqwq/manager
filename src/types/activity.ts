export interface Activity {
  activityid: number
  activityname: string
  speaker: string
  college: string
  savetime: string
  releasetime: string
  signtime: string
  holdtime: string
  totalnumber: number
  introduce?: string
  status: number
  piclist: string[] | null
}