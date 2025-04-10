'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  showTime?: boolean
}

export function DateTimePicker({
  date,
  setDate,
  disabled = false,
  placeholder = '选择日期和时间',
  className,
  showTime = true,
}: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, 'HH:mm') : '00:00',
  )

  // 时间变化时更新日期
  const handleTimeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedTime(e.target.value)

      if (date) {
        const [hours, minutes] = e.target.value.split(':').map(Number)
        const newDate = new Date(date)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)
        setDate(newDate)
      }
    },
    [date, setDate],
  )

  // 日期变化时保留之前的时间
  const handleDateSelect = React.useCallback(
    (selectedDate: Date | undefined) => {
      if (selectedDate) {
        const [hours, minutes] = selectedTime.split(':').map(Number)
        selectedDate.setHours(hours)
        selectedDate.setMinutes(minutes)
      }
      setDate(selectedDate)
    },
    [selectedTime, setDate],
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">时间:</span>
              <Input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-[120px]"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
