import type { UserFromResponse } from '@/types/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { USER_ROLE_MAP } from './userType'

interface UserDetailProps {
  user: UserFromResponse
  avatarUrl?: string
}

export function UserDetail({ user, avatarUrl }: UserDetailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(avatarUrl || null)

  useEffect(() => {
    // 如果没有提供头像URL且用户有profilepicture，则尝试获取头像
    if (!avatarUrl && user.profilepicture) {
      const fetchAvatar = async () => {
        try {
          const response = await fetch(`/api/user/getuserpic?key=${user.profilepicture}`)

          if (!response.ok) {
            throw new Error('获取头像失败')
          }

          const data = await response.json()

          if (data.code !== 1000) {
            throw new Error('获取头像失败')
          }

          const imageData = data.result
          const pictureUrl = `data:image/jpeg;base64,${imageData}`
          setImageUrl(pictureUrl)
        }
        catch (error) {
          console.error('获取头像失败:', error)
        }
      }

      fetchAvatar()
    }
  }, [avatarUrl, user.profilepicture])

  const roleBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-blue-500">管理员</Badge>
      case 2:
        return <Badge className="bg-purple-500">普通用户</Badge>
      default:
        return (
          <Badge>
            未知角色(
            {level}
            )
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={imageUrl || undefined} alt={user.username} />
          <AvatarFallback className="text-2xl font-semibold">
            {user.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{user.username}</h3>
          <div className="flex gap-2 mt-1">
            {roleBadge(user.level)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">用户ID</p>
          <p>{user.userid}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">邮箱</p>
          <p>{user.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">头像</p>
          <p className="truncate">{user.profilepicture || '无'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">角色</p>
          <p>{USER_ROLE_MAP[user.level as 1 | 2] || '未知角色'}</p>
        </div>
      </div>
    </div>
  )
}
