import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  PlusIcon, 
  SearchIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronRightIcon, 
  ChevronDownIcon, 
  School, 
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { fetchColleges } from './CollegeService'
import { useCollegeFormModal, useDeleteCollegeModal } from './CollegeModals'
import { toast } from 'react-hot-toast'
import type { College } from './collegeType'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// 导入专业模块
import { 
  fetchMajors, 
  useMajorFormModal, 
  useDeleteMajorModal, 
  type Major 
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
    mutate: mutateColleges
  } = useSWR(
    'colleges', 
    () => fetchColleges(searchTerm)
      .then(res => res.data)
      .catch(err => {
        toast.error('获取学院失败: ' + (err instanceof Error ? err.message : String(err)))
        return []
      })
  )
  
  // 获取专业数据
  const {
    data: allMajors = [],
    isLoading: isLoadingMajors,
    mutate: mutateMajors
  } = useSWR(
    'majors',
    () => fetchMajors(searchTerm, searchTerm)
      .then(res => res.data)
      .catch(err => {
        toast.error('获取专业失败: ' + (err instanceof Error ? err.message : String(err)))
        return []
      })
  )
  
  // 按学院ID分组专业
  const majorsByCollege = allMajors.reduce<Record<number, Major[]>>((acc, major) => {
    if (!acc[major.collegeid]) {
      acc[major.collegeid] = []
    }
    acc[major.collegeid].push(major)
    return acc
  }, {})
  
  // 刷新数据
  const refreshData = () => {
    mutateColleges()
    mutateMajors()
  }
  
  // 添加/编辑学院
  const showAddCollegeModal = useCollegeFormModal(refreshData)
  const showEditCollegeModal = (college: College) => {
    const editModal = useCollegeFormModal(refreshData, college)
    editModal()
  }
  
  // 添加专业
  const showAddMajorModal = (collegeId: number) => {
    const selectedCollege = colleges.find(c => c.collegeid === collegeId)
    if (!selectedCollege) return
    
    const editData = {
      majorid: 0,
      majorname: '',
      collegeid: collegeId
    }
    
    const addModal = useMajorFormModal(refreshData, colleges, editData)
    addModal()
  }
  
  // 编辑专业
  const showEditMajorModal = (major: Major) => {
    const editData = {
      majorid: major.majorid,
      majorname: major.majorname,
      collegeid: major.collegeid
    }
    
    const editModal = useMajorFormModal(refreshData, colleges, editData)
    editModal()
  }
  
  // 删除学院
  const handleDeleteCollege = (college: College) => {
    const deleteModal = useDeleteCollegeModal(
      college.collegeid,
      college.collegename,
      refreshData
    )
    deleteModal()
  }
  
  // 删除专业
  const handleDeleteMajor = (major: Major) => {
    const deleteModal = useDeleteMajorModal(
      major.majorid,
      major.majorname,
      refreshData
    )
    deleteModal()
  }
  
  // 切换学院展开状态
  const toggleCollegeExpand = (collegeId: number) => {
    setExpandedColleges(prev => 
      prev.includes(collegeId)
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId]
    )
  }
  
  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refreshData()
  }
  
  // 搜索内容变化时展开所有学院
  useEffect(() => {
    if (searchTerm) {
      setExpandedColleges(colleges.map(c => c.collegeid))
    }
  }, [searchTerm, colleges])
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <School className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">院系管理</h1>
            <p className="text-muted-foreground text-sm mt-1">
              管理学院与专业信息，维护院系结构
            </p>
          </div>
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
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索学院或专业名称..."
                className="pl-9 h-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="h-10 px-4"
            >
              搜索
            </Button>
          </form>
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
      ) : colleges.length === 0 ? (
        // 空数据状态
        <div className="bg-muted/40 rounded-lg border border-border shadow-sm p-10 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          <h3 className="text-lg font-medium mb-2">暂无学院数据</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            您可以添加第一个学院，然后为其创建专业，建立完整的院系结构。
          </p>
          <Button onClick={showAddCollegeModal} variant="default">
            <PlusIcon className="mr-2 h-4 w-4" />
            添加第一个学院
          </Button>
        </div>
      ) : (
        // 内容区域
        <div className="grid gap-6">
          {colleges.map((college) => {
            const majors = majorsByCollege[college.collegeid] || []
            const isExpanded = expandedColleges.includes(college.collegeid)
            
            return (
              <Card 
                key={college.collegeid} 
                className={cn(
                  "overflow-hidden transition-all duration-200 border shadow-sm hover:shadow-md",
                  isExpanded && "shadow-md"
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
                          "flex items-center justify-center h-9 w-9 rounded-full transition-colors",
                          "bg-primary/5 group-hover:bg-primary/10"
                        )}
                      >
                        {isExpanded ? 
                          <ChevronDownIcon className="h-5 w-5 text-primary transition-transform duration-200" /> : 
                          <ChevronRightIcon className="h-5 w-5 text-primary transition-transform duration-200" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary/90 transition-colors">
                          {college.collegename}
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                          {majors.length 
                            ? `${majors.length} 个专业` 
                            : "暂无专业"}
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
                        className="h-9 w-9 p-0"
                        onClick={() => showEditCollegeModal(college)}
                      >
                        <PencilIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">编辑学院</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleDeleteCollege(college)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">删除学院</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <div 
                  className={cn(
                    "transition-all duration-300 ease-in-out", 
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
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
                        {majors.map((major) => (
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
                                className="h-8 w-8 p-0"
                                onClick={() => showEditMajorModal(major)}
                              >
                                <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="sr-only">编辑专业</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => handleDeleteMajor(major)}
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
      )}
    </div>
  )
} 