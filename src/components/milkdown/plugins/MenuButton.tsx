import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface MenuButtonProps {
  tooltip: string
  icon: LucideIcon
  onPress: () => void
  ariaLabel: string
  disabled?: boolean
}

export function MenuButton({
  tooltip,
  icon: Icon,
  onPress,
  ariaLabel,
  disabled = false,
}: MenuButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onPress()
            }}
            aria-label={ariaLabel}
            className="p-2 mx-1 h-8 w-8"
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
