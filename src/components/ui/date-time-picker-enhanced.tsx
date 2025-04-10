'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateTimePickerEnhancedProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  showTime?: boolean
}

export function DateTimePickerEnhanced({
  date,
  setDate,
  disabled = false,
  placeholder = '选择日期和时间',
  className,
  showTime = true,
}: DateTimePickerEnhancedProps) {
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])
  
  const [selectedHour, setSelectedHour] = React.useState<string>(
    date ? format(date, 'HH') : '00'
  )
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    date ? format(date, 'mm') : '00'
  )

  // 时间变化时更新日期
  const handleTimeChange = React.useCallback(
    (type: 'hour' | 'minute', value: string) => {
      if (type === 'hour') {
        setSelectedHour(value)
      } else {
        setSelectedMinute(value)
      }

      if (date) {
        const newDate = new Date(date)
        if (type === 'hour') {
          newDate.setHours(parseInt(value))
        } else {
          newDate.setMinutes(parseInt(value))
        }
        setDate(newDate)
      }
    },
    [date, setDate],
  )

  // 日期变化时保留之前的时间
  const handleDateSelect = React.useCallback(
    (selectedDate: Date | undefined) => {
      if (selectedDate) {
        selectedDate.setHours(parseInt(selectedHour))
        selectedDate.setMinutes(parseInt(selectedMinute))
      }
      setDate(selectedDate)
    },
    [selectedHour, selectedMinute, setDate],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, showTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd', { locale: zhCN })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={zhCN}
          initialFocus
        />
        {showTime && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">时间:</span>
              <div className="flex items-center gap-2 ml-auto">
                <Select
                  value={selectedHour}
                  onValueChange={(value) => handleTimeChange('hour', value)}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="小时" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>:</span>
                <Select
                  value={selectedMinute}
                  onValueChange={(value) => handleTimeChange('minute', value)}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="分钟" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                        {minute.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
} 