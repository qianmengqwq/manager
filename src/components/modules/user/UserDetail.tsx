import type { UserFromResponse } from '@/types/user'
import { UserAvatar } from '@/components/modules/image'
import { Badge } from '@/components/ui/badge'
import { USER_ROLE_MAP } from './userType'

interface UserDetailProps {
  user: UserFromResponse
  onAvatarUpdate?: (newProfilePicture: string) => void
}

export function UserDetail({ user, onAvatarUpdate }: UserDetailProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-4 mb-4">
        <UserAvatar
          userId={user.userid}
          username={user.username}
          profilePicture={user.profilepicture}
          size="lg"
          editable
          onAvatarUpdate={onAvatarUpdate}
        />
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
          <p className="text-sm font-medium text-muted-foreground">账号</p>
          <p className="truncate">{user.account || '无'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">角色</p>
          <p>{USER_ROLE_MAP[user.level as 1 | 2] || '未知角色'}</p>
        </div>
      </div>
    </div>
  )
}

function roleBadge(level: number) {
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
