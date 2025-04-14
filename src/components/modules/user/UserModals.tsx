import type { UserFromResponse } from '@/types/user'
import type { UserFormValues } from './userType'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/user'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { mutate } from 'swr'
import { DeleteConfirm } from './DeleteConfirm'
import { SecondaryVerifyForm } from './SecondaryVerifyForm'
import { UserDetail } from './UserDetail'
import { UserForm } from './UserForm'
import {
  addUser,
  deleteUser,
  fetchUserDetail,
  performSecondaryVerify,
  updateUser,
} from './UserService'

// 用户详情模态框
export function useUserDetailModal() {
  const { present } = useModalStack()

  return useCallback((userId: number) => {
    present({
      title: '用户详情',
      content: () => {
        const [user, setUser] = useState<UserFromResponse | null>(null)
        const [isLoading, setIsLoading] = useState(true)

        // 获取用户详情
        useEffect(() => {
          const fetchData = async () => {
            setIsLoading(true)
            try {
              const detail = await fetchUserDetail(userId)
              setUser(detail)
            }
            catch (error) {
              toast.error('获取用户详情失败')
              console.error(error)
            }
            finally {
              setIsLoading(false)
            }
          }

          fetchData()

          // 清理函数，当组件卸载时执行
          return () => {
            // 这里可以添加一些清理逻辑，如取消请求等
          }
        }, [userId]) // 依赖项只有userId

        if (isLoading) {
          return <div className="py-8 text-center">加载中...</div>
        }

        if (!user) {
          return <div className="py-8 text-center">用户不存在或已被删除</div>
        }

        return <UserDetail user={user} />
      },
    })
  }, [present])
}

// 二级验证模态框
export function useSecondaryVerifyModal() {
  const { present } = useModalStack()
  const currentUser = useUserStore(state => state.currentUser)

  return useCallback(
    async (onVerifySuccess: () => Promise<void>) => {
      // 确保有用户登录
      if (!currentUser || !currentUser.userid) {
        toast.error('未登录或登录状态异常')
        return
      }

      return new Promise<void>((resolve) => {
        present({
          title: '安全验证',
          content: (props) => {
            const [isSubmitting, setIsSubmitting] = useState(false)

            const handleSubmit = async (password: string) => {
              setIsSubmitting(true)
              try {
                await performSecondaryVerify(currentUser.userid, password)
                props.dismiss()
                // 验证成功后执行原操作
                await onVerifySuccess()
                resolve()
              }
              catch (error) {
                console.error('二级验证失败:', error)
                if (error instanceof Error) {
                  toast.error(error.message)
                }
                else {
                  toast.error('验证失败，请重试')
                }
                // 不关闭模态框，让用户可以重试
              }
              finally {
                setIsSubmitting(false)
              }
            }

            const handleCancel = () => {
              props.dismiss()
              resolve() // 用户取消也要resolve，避免悬挂的Promise
            }

            return (
              <SecondaryVerifyForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            )
          },
        })
      })
    },
    [present, currentUser],
  )
}

// 添加用户模态框
export function useAddUserModal() {
  const { present } = useModalStack()
  const showVerifyModal = useSecondaryVerifyModal()

  return useCallback(() => {
    present({
      title: '添加用户',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const handleSubmit = async (values: UserFormValues) => {
          setIsSubmitting(true)
          try {
            // 添加用户操作封装，会在二级验证成功后执行
            const performAddUser = async () => {
              try {
                await addUser(values)
                toast.success('添加用户成功')
                props.dismiss()
                // 添加成功后刷新列表
                await mutate('userList')
              }
              catch (error) {
                setIsSubmitting(false)
                if (error instanceof Error) {
                  toast.error(error.message)
                }
                else {
                  toast.error('添加用户失败')
                }
                throw error // 抛出错误，让上层知道操作失败
              }
            }

            try {
              // 尝试直接添加用户
              await performAddUser()
            }
            catch (error) {
              // 检查是否需要二级验证
              const errorMessage = error instanceof Error ? error.message : '未知错误'
              if (errorMessage.includes('二级验证') || (error as any)?.code === 1001) {
                // 需要二级验证，显示验证模态框
                await showVerifyModal(performAddUser)
              }
              // 其他错误已在 performAddUser 中处理
            }
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <UserForm
            onSubmit={handleSubmit}
            onCancel={props.dismiss}
            submitText="添加"
            isSubmitting={isSubmitting}
          />
        )
      },
    })
  }, [present, showVerifyModal])
}

// 编辑用户模态框
export function useEditUserModal() {
  const { present } = useModalStack()
  const showVerifyModal = useSecondaryVerifyModal()

  return useCallback((user: UserFromResponse) => {
    present({
      title: '编辑用户',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)
        const [userDetail, setUserDetail] = useState<UserFromResponse | null>(null)
        const [isLoading, setIsLoading] = useState(true)

        // 获取用户详情
        useEffect(() => {
          const fetchData = async () => {
            try {
              const detail = await fetchUserDetail(user.userid)
              setUserDetail(detail)
            }
            catch (error) {
              console.error('获取用户详情失败:', error)
              toast.error('获取用户详情失败')
            }
            finally {
              setIsLoading(false)
            }
          }

          fetchData()
        }, [user.userid])

        const handleSubmit = async (values: UserFormValues) => {
          setIsSubmitting(true)
          try {
            // 编辑用户操作封装，会在二级验证成功后执行
            const performUpdateUser = async () => {
              try {
                await updateUser(values)
                toast.success('更新用户成功')
                props.dismiss()
                // 更新成功后刷新列表
                await mutate('userList')
              }
              catch (error) {
                setIsSubmitting(false)
                if (error instanceof Error) {
                  toast.error(error.message)
                }
                else {
                  toast.error('更新用户失败')
                }
                throw error // 抛出错误，让上层知道操作失败
              }
            }

            try {
              // 尝试直接更新用户
              await performUpdateUser()
            }
            catch (error) {
              // 检查是否需要二级验证
              const errorMessage = error instanceof Error ? error.message : '未知错误'
              if (errorMessage.includes('二级验证') || (error as any)?.code === 1001) {
                // 需要二级验证，显示验证模态框
                await showVerifyModal(performUpdateUser)
              }
              // 其他错误已在 performUpdateUser 中处理
            }
          }
          finally {
            setIsSubmitting(false)
          }
        }

        if (isLoading) {
          return <div className="py-8 text-center">加载中...</div>
        }

        if (!userDetail) {
          return <div className="py-8 text-center">用户不存在或已被删除</div>
        }

        return (
          <UserForm
            user={userDetail}
            onSubmit={handleSubmit}
            onCancel={props.dismiss}
            submitText="保存"
            isSubmitting={isSubmitting}
          />
        )
      },
    })
  }, [present, showVerifyModal])
}

// 删除用户模态框
export function useDeleteUserModal() {
  const { present } = useModalStack()
  const showVerifyModal = useSecondaryVerifyModal()

  return useCallback((user: UserFromResponse) => {
    present({
      title: '删除用户',
      content: (props) => {
        const [isSubmitting, setIsSubmitting] = useState(false)

        const handleDelete = async () => {
          setIsSubmitting(true)
          try {
            // 删除用户操作封装，会在二级验证成功后执行
            const performDeleteUser = async () => {
              try {
                await deleteUser(user.userid)
                toast.success('删除用户成功')
                props.dismiss()
                // 删除成功后刷新列表
                await mutate('userList')
              }
              catch (error) {
                setIsSubmitting(false)
                if (error instanceof Error) {
                  toast.error(error.message)
                }
                else {
                  toast.error('删除用户失败')
                }
                throw error // 抛出错误，让上层知道操作失败
              }
            }

            try {
              // 尝试直接删除用户
              await performDeleteUser()
            }
            catch (error) {
              // 检查是否需要二级验证
              const errorMessage = error instanceof Error ? error.message : '未知错误'
              if (errorMessage.includes('二级验证') || (error as any)?.code === 1001) {
                // 需要二级验证，显示验证模态框
                await showVerifyModal(performDeleteUser)
              }
              // 其他错误已在 performDeleteUser 中处理
            }
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={props.dismiss}
            isSubmitting={isSubmitting}
            username={user.username}
          />
        )
      },
    })
  }, [present, showVerifyModal])
}

// 踢下线确认模态框
export function useKickOutModal() {
  const { present } = useModalStack()

  return useCallback((user: UserFromResponse) => {
    present({
      title: '确认踢下线',
      content: () => (
        <div className="space-y-4">
          <p>
            确定要将用户
            {user.username}
            {' '}
            踢下线吗？
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                present({ title: '', content: () => null })
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `/api/user/kickout?userid=${user.userid}&level=${user.level}`,
                  )

                  if (!response.ok) {
                    throw new Error('踢下线失败')
                  }

                  const data = await response.json()
                  if (data.code !== 1000) {
                    throw new Error(data.message || '踢下线失败')
                  }

                  toast.success('踢下线成功')
                  present({ title: '', content: () => null })
                }
                catch (error) {
                  toast.error(error instanceof Error ? error.message : '踢下线失败')
                }
              }}
            >
              确认踢下线
            </Button>
          </div>
        </div>
      ),
    })
  }, [present])
}

// 个人资料模态框
export function useProfileModal() {
  const { present } = useModalStack()
  const currentUser = useUserStore(state => state.currentUser)

  return useCallback(() => {
    if (!currentUser) {
      toast.error('未登录或登录状态异常')
      return
    }

    present({
      title: '个人资料',
      content: () => {
        const [user, setUser] = useState<UserFromResponse | null>(null)
        const [isLoading, setIsLoading] = useState(true)
        const [_avatarUrl, setAvatarUrl] = useState<string | null>(null)

        useEffect(() => {
          const fetchData = async () => {
            setIsLoading(true)
            try {
              const detail = await fetchUserDetail(currentUser.userid)
              setUser(detail)

              if (detail?.profilepicture) {
                try {
                  const response = await fetch(`/api/user/getuserpic?key=${detail.profilepicture}`)
                  if (!response.ok) {
                    throw new Error('获取头像失败')
                  }
                  const data = await response.json()
                  if (data.code !== 1000) {
                    throw new Error('获取头像失败')
                  }
                  const imageData = data.result
                  const pictureUrl = `data:image/jpeg;base64,${imageData}`
                  setAvatarUrl(pictureUrl)
                }
                catch (error) {
                  console.error('获取头像失败:', error)
                }
              }
            }
            catch (error) {
              toast.error('获取用户详情失败')
              console.error(error)
            }
            finally {
              setIsLoading(false)
            }
          }

          fetchData()
        }, [currentUser.userid])

        if (isLoading) {
          return <div className="py-8 text-center">加载中...</div>
        }

        if (!user) {
          return <div className="py-8 text-center">用户不存在或已被删除</div>
        }

        return <UserDetail user={user} />
      },
    })
  }, [present, currentUser])
}

// 设置模态框
export function useSettingsModal() {
  const { present } = useModalStack()
  const currentUser = useUserStore(state => state.currentUser)

  return useCallback(() => {
    if (!currentUser) {
      toast.error('未登录或登录状态异常')
      return
    }

    present({
      title: '设置',
      content: () => {
        const [isSubmitting, setIsSubmitting] = useState(false)
        const [formData, setFormData] = useState({
          email: currentUser.email || '',
          account: currentUser.account || '',
          password: currentUser.password || '',
        })

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          setIsSubmitting(true)
          try {
            await updateUser({
              ...formData,
              userid: currentUser.userid,
              username: currentUser.username,
              level: currentUser.level,
            })
            toast.success('设置已更新')
            present({ title: '', content: () => null })
          }
          catch (error) {
            console.error('更新设置失败:', error)
            toast.error('更新设置失败')
          }
          finally {
            setIsSubmitting(false)
          }
        }

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="请输入邮箱"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="account" className="text-sm font-medium">
                账号
              </label>
              <Input
                id="account"
                type="text"
                value={formData.account}
                onChange={e => setFormData(prev => ({ ...prev, account: e.target.value }))}
                placeholder="请输入账号"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="请输入密码"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => present({ title: '', content: () => null })}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        )
      },
    })
  }, [present, currentUser])
}
