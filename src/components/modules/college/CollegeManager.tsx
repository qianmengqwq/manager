import type { Major } from './major'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  ChevronDownIcon,
  ChevronRightIcon,
  GraduationCap,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'
import { useAddCollegeModal, useDeleteCollegeModal } from './CollegeModals'

import { fetchColleges } from './CollegeService'
// 导入专业模块
import {
  fetchMajors,
  useAddMajorModal,
  useDeleteMajorModal,
} from './major'

export default function CollegeManager() {
  // 搜索条件
  const [searchTerm, setSearchTerm] = useState('')

  // 当前展开的学院ID列表
  const [expandedColleges, setExpandedColleges] = useState<number[]>([])

  // 获取学院数据
  const {
    data: colleges = [],
    isLoading: isLoadingColleges,
  } = useSWR(
    'colleges',
    () => fetchColleges()
      .then(res => res.data)
      .catch((err) => {
        toast.error(`获取学院失败: ${err instanceof Error ? err.message : String(err)}`)
        return []
      }),
  )

  // 获取专业数据
  const {
    data: allMajors = [],
    isLoading: isLoadingMajors,
  } = useSWR(
    'majors',
    () => fetchMajors()
      .then(res => res.data)
      .catch((err) => {
        toast.error(`获取专业失败: ${err instanceof Error ? err.message : String(err)}`)
        return []
      }),
  )

  // 按学院ID分组专业
  const majorsByCollege = useMemo(() => {
    return allMajors.reduce<Record<number, Major[]>>((acc, major) => {
      if (!acc[major.collegeid]) {
        acc[major.collegeid] = []
      }
      acc[major.collegeid].push(major)
      return acc
    }, {})
  }, [allMajors])

  // 根据搜索条件筛选学院和专业
  const filteredColleges = useMemo(() => {
    if (!searchTerm.trim())
      return colleges

    return colleges.filter(college =>
      college.collegename.toLowerCase().includes(searchTerm.toLowerCase())
      || (majorsByCollege[college.collegeid] || []).some(major =>
        major.majorname.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }, [colleges, majorsByCollege, searchTerm])

  // 添加学院模态框
  const showAddCollegeModal = useAddCollegeModal()

  // 删除学院模态框
  const showDeleteCollegeModal = useDeleteCollegeModal()

  // 添加专业模态框
  const showAddMajorModal = useAddMajorModal(colleges)

  // 删除专业模态框
  const showDeleteMajorModal = useDeleteMajorModal()

  // 切换学院展开状态
  const toggleCollegeExpand = (collegeId: number) => {
    setExpandedColleges(prev =>
      prev.includes(collegeId)
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId],
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 flex flex-col h-full">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">院系管理</h1>
        </div>
        <Button
          onClick={showAddCollegeModal}
          size="sm"
          className="bg-primary hover:bg-primary/90 shadow-sm"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          添加学院
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学院或专业名称..."
              className="pl-9 h-10 bg-background"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoadingColleges || isLoadingMajors ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">正在加载数据...</p>
          </div>
        </div>
      ) : filteredColleges.length === 0 ? (
        // 空数据状态
        <div className="bg-muted/40 rounded-lg border border-border shadow-sm p-10 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          <h3 className="text-lg font-medium mb-2">暂无学院数据</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm ? '没有找到符合条件的学院或专业' : '您可以添加第一个学院，然后为其创建专业，建立完整的院系结构。'}
          </p>
          {!searchTerm && (
            <Button onClick={showAddCollegeModal} variant="default">
              <PlusIcon className="mr-2 h-4 w-4" />
              添加第一个学院
            </Button>
          )}
        </div>
      ) : (
        // 内容区域 - 添加最大高度和滚动功能
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto pr-2 pb-4 max-h-[800px]">
            <div className="grid gap-6">
              {filteredColleges.map((college) => {
                const majors = majorsByCollege[college.collegeid] || []
                const isExpanded = expandedColleges.includes(college.collegeid)

                return (
                  <Card
                    key={college.collegeid}
                    className={cn(
                      'overflow-hidden transition-all duration-200 border shadow-sm hover:shadow-md py-0 gap-0',
                      isExpanded && 'shadow-md',
                    )}
                  >
                    <CardHeader className="px-6 py-5">
                      <div className="flex justify-between items-center gap-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => toggleCollegeExpand(college.collegeid)}
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center h-9 w-9 rounded-full transition-colors',
                              'bg-primary/5 group-hover:bg-primary/10',
                            )}
                          >
                            {isExpanded
                              ? <ChevronDownIcon className="h-5 w-5 text-primary transition-transform duration-200" />
                              : <ChevronRightIcon className="h-5 w-5 text-primary transition-transform duration-200" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary/90 transition-colors">
                              {college.collegename}
                            </CardTitle>
                            <CardDescription className="mt-0.5">
                              {majors.length
                                ? `${majors.length} 个专业`
                                : '暂无专业'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-sm font-medium"
                            onClick={() => showAddMajorModal(college.collegeid)}
                          >
                            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                            添加专业
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => showDeleteCollegeModal(college)}
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">删除学院</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <div
                      className={cn(
                        'transition-all duration-300 ease-in-out',
                        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
                      )}
                    >
                      <Separator />
                      <CardContent className="p-6 pt-5">
                        {majors.length === 0 ? (
                          <div className="text-center py-8 px-4">
                            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
                            <p className="text-muted-foreground mb-4">
                              该学院暂无专业信息
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showAddMajorModal(college.collegeid)}
                            >
                              <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                              添加专业
                            </Button>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {majors.map(major => (
                              <div
                                key={major.majorid}
                                className="flex justify-between items-center px-4 py-3.5 rounded-md bg-accent/30 hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium">
                                    {major.majorname}
                                  </span>
                                </div>
                                <div className="flex gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={() => showDeleteMajorModal(major)}
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    <span className="sr-only">删除专业</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
