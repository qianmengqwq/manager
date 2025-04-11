import type { CmdKey } from '@milkdown/core'
import type { UseEditorReturn } from '@milkdown/react'
import { fetchActivityImage, uploadImage } from '@/components/modules/image/ImageService'
import { Button } from '@/components/ui/button'
import { insertImageCommand } from '@milkdown/preset-commonmark'
import { callCommand } from '@milkdown/utils'
import { ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { useModalStack } from 'rc-modal-sheet'
import { useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { resizeImage } from './uploader'

interface SelectedImage {
  file: File
  preview: string
}

// 创建本地文件预览URL
function createLocalImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// 释放预览URL资源
function revokeImagePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl)
}

// 图片上传表单组件
function ImageUploaderForm({
  onImageUploaded,
  onCancel,
}: {
  onImageUploaded: (imageKey: string, imageName: string) => void
  onCancel: () => void
}) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0)
      return

    const file = e.target.files[0]

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 创建预览
    setSelectedImage({
      file,
      preview: createLocalImagePreview(file),
    })
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error('请先选择图片')
      return
    }

    setUploading(true)
    const toastId = toast.loading('正在上传图片...')

    try {
      // 压缩图片
      const miniImage = await resizeImage(selectedImage.file, 1920, 1080)

      // 上传图片
      const result = await uploadImage(miniImage)

      if (result?.code !== 1000 || !result.result) {
        toast.error('图片上传失败', { id: toastId })
        return
      }

      const imageKey = result.result
      toast.success('图片上传成功', { id: toastId })

      // 直接使用imageKey，不再获取base64数据
      onImageUploaded(imageKey, selectedImage.file.name)
    }
    catch (error) {
      console.error('上传图片失败:', error)
      toast.error('图片上传失败', { id: toastId })
    }
    finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    if (selectedImage) {
      revokeImagePreview(selectedImage.preview)
      setSelectedImage(null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {selectedImage ? (
        <div className="relative group">
          <div className="border rounded-md overflow-hidden">
            <img
              src={selectedImage.preview}
              alt="预览"
              className="w-full max-h-80 object-contain"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-semibold">点击选择图片</p>
            <p>支持 JPG、PNG、WEBP 格式</p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={uploading}>
          取消
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedImage || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              上传图片
            </>
          )}
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
    </div>
  )
}

// 创建图片上传模态框钩子
export function useImageUploaderModal(editorInfo: UseEditorReturn) {
  const { present } = useModalStack()

  return useCallback(() => {
    present({
      title: '上传图片',
      content: (props) => {
        const handleImageUploaded = (imageKey: string, imageName: string) => {
          const { get } = editorInfo
          const call = <T,>(command: CmdKey<T>, payload?: T) => {
            return get()?.action(callCommand(command, payload))
          }

          // 使用API URL构建图片链接而不是base64数据
          const imageUrl = `/api/activity/getpic?key=${imageKey}`

          call(insertImageCommand.key, {
            src: imageUrl,
            title: imageName,
            alt: imageName,
          })

          props.dismiss()
        }

        return (
          <ImageUploaderForm
            onImageUploaded={handleImageUploaded}
            onCancel={props.dismiss}
          />
        )
      },
    })
  }, [present, editorInfo])
}
