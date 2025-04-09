export type ApiResponseCode = 1000 | 1001 | 4040

export interface ApiResponse<T> {
  code: ApiResponseCode
  message: string
  result: T
}
