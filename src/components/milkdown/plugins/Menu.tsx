import type { CmdKey } from '@milkdown/core'
import type { UseEditorReturn } from '@milkdown/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  toggleLinkCommand,
} from '@milkdown/preset-commonmark'
import { callCommand } from '@milkdown/utils'
import { ImagePlus, Link } from 'lucide-react'
import { useState } from 'react'
import { createButtons } from './_buttonList'
import { useImageUploaderModal } from './ImageUploader'
import { MenuButton } from './MenuButton'

export function MilkdownPluginsMenu({
  editorInfo,
}: {
  editorInfo: UseEditorReturn
}) {
  const [link, setLink] = useState('')
  const showImageUploader = useImageUploaderModal(editorInfo)

  const { get } = editorInfo
  const call = <T,>(command: CmdKey<T>, payload?: T) => {
    return get()?.action(callCommand(command, payload))
  }

  const buttonList = createButtons(call)

  return (
    <div className="sticky top-0 flex flex-wrap bg-background/80 backdrop-blur-md z-10 p-1">
      {buttonList.map(({ tooltip, icon, onPress, ariaLabel }, index) => (
        <MenuButton
          key={index}
          tooltip={tooltip}
          icon={icon}
          onPress={onPress}
          ariaLabel={ariaLabel}
        />
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 mx-1 h-8 w-8"
            aria-label="插入链接"
          >
            <Link className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px]">
          <div className="w-full px-1 py-2">
            <p className="font-bold text-sm mb-2">
              选中文本以插入链接
            </p>
            <div className="flex flex-col w-full gap-2 mt-2">
              <Input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="链接 URL"
                className="text-sm"
              />
            </div>
            <Button
              variant="default"
              onClick={() => {
                call(toggleLinkCommand.key, { href: link })
                setLink('')
              }}
              className="w-full mt-2"
            >
              确定插入
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <MenuButton
        tooltip="上传图片"
        icon={ImagePlus}
        onPress={showImageUploader}
        ariaLabel="上传图片"
      />
    </div>
  )
}
