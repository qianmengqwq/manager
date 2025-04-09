import type { UserFromResponse } from '@/types/user'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { UserAvatar } from '@/components/modules/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Eye,
  LogOut,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'

interface UseColumnsProps {
  showDetailModal: (userId: number) => void
  showEditModal: (user: UserFromResponse) => void
  showDeleteModal: (user: UserFromResponse) => void
  showKickOutModal: (user: UserFromResponse) => void
  onUserUpdate?: (user: UserFromResponse) => void
}

export function useColumns({
  showDetailModal,
  showEditModal,
  showDeleteModal,
  showKickOutModal,
  onUserUpdate,
}: UseColumnsProps) {
  return useMemo<ColumnDef<UserFromResponse>[]>(() => [
    {
      id: 'userid',
      accessorKey: 'userid',
      header: ({ column }) => <DataTableColumnHeader column={column} title="用户ID" />,
      enableColumnFilter: true,
      meta: {
        label: '用户ID',
      },
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title="用户名" />,
      enableColumnFilter: true,
      meta: {
        label: '用户名',
      },
    },
    {
      id: 'account',
      accessorKey: 'account',
      header: ({ column }) => <DataTableColumnHeader column={column} title="账号" />,
      enableColumnFilter: true,
      meta: {
        label: '账号',
      },
    },
    {
      id: 'password',
      accessorKey: 'password',
      header: ({ column }) => <DataTableColumnHeader column={column} title="密码" />,
      enableColumnFilter: true,
      meta: {
        label: '密码',
      },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="邮箱" />,
      enableColumnFilter: true,
      meta: {
        label: '邮箱',
      },
    },
    {
      id: 'level',
      accessorKey: 'level',
      header: ({ column }) => <DataTableColumnHeader column={column} title="角色" />,
      cell: ({ row }) => {
        const level = row.original.level
        switch (level) {
          case 1:
            return <Badge className="bg-blue-500">管理员</Badge>
          case 2:
            return <Badge className="bg-purple-500">普通用户</Badge>
          default:
            return (
              <Badge>
                未知(
                {level}
                )
              </Badge>
            )
        }
      },
      enableColumnFilter: true,
      meta: {
        label: '角色',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="在线状态" />,
      cell: ({ row }) => {
        const status = row.original.status
        return status === 1 ? (
          <Badge className="bg-green-500">在线</Badge>
        ) : (
          <Badge className="bg-red-500">离线</Badge>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: '在线状态',
      },
    },
    {
      id: 'profilepicture',
      accessorKey: 'profilepicture',
      header: ({ column }) => <DataTableColumnHeader column={column} title="头像" />,
      cell: ({ row }) => {
        const user = row.original
        return (
          <UserAvatar
            userId={user.userid}
            username={user.username}
            profilePicture={user.profilepicture}
            editable
            onAvatarUpdate={(newProfilePicture) => {
              onUserUpdate?.({
                ...user,
                profilepicture: newProfilePicture,
              })
            }}
          />
        )
      },
      enableColumnFilter: true,
      meta: {
        label: '头像',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">操作菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => showDetailModal(user.userid)}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showEditModal(user)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑用户
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => showDeleteModal(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除用户
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => showKickOutModal(user)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                踢下线
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [showDetailModal, showEditModal, showDeleteModal, showKickOutModal, onUserUpdate])
}
