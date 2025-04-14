import { fetchActivityAnalysis } from '@/components/modules/signup/SignupService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pie, PieChart } from 'recharts'

interface AnalysisData {
  collegeCount: Record<string, number>
  majorCount: Record<string, number>
  sexCount: Record<string, number>
}

const collegeChartConfig = {
  value: {
    label: '人数',
  },
} as const

const majorChartConfig = {
  value: {
    label: '人数',
  },
} as const

const sexChartConfig = {
  value: {
    label: '人数',
  },
} as const

export function AnalyticsPage() {
  const params = useParams({ from: '/dashboard/analytics/$activityId' })
  const activityId = Number.parseInt(params.activityId, 10)
  const navigate = useNavigate()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchActivityAnalysis(activityId)
        setAnalysisData(data)
      }
      catch (error) {
        toast.error('获取分析数据失败')
        console.error({ 获取分析数据错误: error })
      }
    }
    fetchData()
  }, [activityId])

  const goBack = () => {
    navigate({ to: '/dashboard/signup' })
  }

  // 转换数据格式为饼图所需格式
  const transformData = (data: Record<string, number>, colors: string[]) => {
    return Object.entries(data).map(([name, value], index) => ({
      name,
      value,
      fill: colors[index % colors.length],
    }))
  }

  const collegeColors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981']
  const majorColors = ['#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E']
  const sexColors = ['#06B6D4', '#F97316']

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">活动数据分析</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>学院分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={collegeChartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={analysisData ? transformData(analysisData.collegeCount, collegeColors) : []}
                  dataKey="value"
                  nameKey="name"
                  label
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>专业分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={majorChartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={analysisData ? transformData(analysisData.majorCount, majorColors) : []}
                  dataKey="value"
                  nameKey="name"
                  label
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>性别分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={sexChartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={analysisData ? transformData(analysisData.sexCount, sexColors) : []}
                  dataKey="value"
                  nameKey="name"
                  label
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
