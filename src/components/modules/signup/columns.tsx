import type { ColumnDef } from '@tanstack/react-table'
import type { ActivitySignup } from './signupType'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
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
import { Check, Eye, MoreHorizontal, X } from 'lucide-react'
import { formatDateTime, getCheckStatusColor, getCheckStatusText } from './signupType'

interface UseColumnsProps {
  showSignupDetail: (signup: ActivitySignup) => void
  showApproveSignup: (signup: ActivitySignup) => void
  showRejectSignup: (signup: ActivitySignup) => void
}

export function useColumns({
  showSignupDetail,
  showApproveSignup,
  showRejectSignup,
}: UseColumnsProps) {
  const columns: ColumnDef<ActivitySignup>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="姓名" />,
      enableColumnFilter: true,
      meta: {
        label: '姓名',
      },
    },
    {
      id: 'sex',
      accessorKey: 'sex',
      header: ({ column }) => <DataTableColumnHeader column={column} title="性别" />,
      enableColumnFilter: true,
      meta: {
        label: '性别',
      },
    },
    {
      id: 'studentid',
      accessorKey: 'studentid',
      header: ({ column }) => <DataTableColumnHeader column={column} title="学号" />,
      enableColumnFilter: true,
      meta: {
        label: '学号',
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
      id: 'telephone',
      accessorKey: 'telephone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="电话" />,
      enableColumnFilter: true,
      meta: {
        label: '电话',
      },
    },
    {
      id: 'collegename',
      accessorKey: 'collegename',
      header: ({ column }) => <DataTableColumnHeader column={column} title="学院" />,
      enableColumnFilter: true,
      meta: {
        label: '学院',
      },
    },
    {
      id: 'majorname',
      accessorKey: 'majorname',
      header: ({ column }) => <DataTableColumnHeader column={column} title="专业" />,
      enableColumnFilter: true,
      meta: {
        label: '专业',
      },
    },
    {
      id: 'clazz',
      accessorKey: 'clazz',
      header: ({ column }) => <DataTableColumnHeader column={column} title="班级" />,
      enableColumnFilter: true,
      meta: {
        label: '班级',
      },
    },
    {
      id: 'ischeck',
      accessorKey: 'ischeck',
      header: ({ column }) => <DataTableColumnHeader column={column} title="审核状态" />,
      cell: ({ row }) => {
        const ischeck = row.getValue('ischeck') as number
        return (
          <Badge className={`bg-${getCheckStatusColor(ischeck)}-100 text-${getCheckStatusColor(ischeck)}-800`}>
            {getCheckStatusText(ischeck)}
          </Badge>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: '审核状态',
        options: [
          { label: '未审核', value: '0' },
          { label: '已通过', value: '1' },
        ],
      },
    },
    {
      id: 'createtime',
      accessorKey: 'createtime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="报名时间" />,
      cell: ({ row }) => formatDateTime(row.getValue('createtime')),
      enableColumnFilter: true,
      meta: {
        label: '报名时间',
        variant: 'date',
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const signup = row.original

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
              <DropdownMenuItem onClick={() => showSignupDetail(signup)}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              {signup.ischeck === 0 && (
                <>
                  <DropdownMenuItem onClick={() => showApproveSignup(signup)}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    通过报名
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => showRejectSignup(signup)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    拒绝报名
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return columns
}
