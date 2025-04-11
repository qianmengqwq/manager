import { Button } from '@/components/ui/button'
import { Loader2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ImagePreview } from './ImagePreview'
import { createLocalImagePreview, revokeImagePreview, uploadImage } from './ImageService'

interface MultiImageUploadProps {
  onImagesUploaded: (piclist: string[]) => void
  existingImages?: string[]
}

export function MultiImageUpload({ onImagesUploaded, existingImages = [] }: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [previewImages, setPreviewImages] = useState<{ file: File, preview: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0)
      return

    const selectedFiles = Array.from(e.target.files)

    // 检查文件类型
    const invalidFiles = selectedFiles.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      toast.error('请只选择图片文件')
      return
    }

    // 创建预览
    const newPreviews = selectedFiles.map(file => ({
      file,
      preview: createLocalImagePreview(file),
    }))

    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  const removePreview = (index: number) => {
    setPreviewImages((prev) => {
      const updated = [...prev]
      // 释放对象URL以避免内存泄漏
      revokeImagePreview(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev]
      updated.splice(index, 1)
      onImagesUploaded(updated)
      return updated
    })
  }

  const uploadFiles = async () => {
    if (previewImages.length === 0)
      return

    setUploading(true)
    const uploadedImages = [...images]
    const failedUploads: string[] = []

    try {
      // 逐个上传文件
      for (const item of previewImages) {
        try {
          const result = await uploadImage(item.file)
          if (result?.code === 1000 && result.result) {
            uploadedImages.push(result.result)
          }
          else {
            failedUploads.push(item.file.name)
          }
        }
        catch (error) {
          console.error('上传图片失败:', error)
          failedUploads.push(item.file.name)
        }
      }

      // 清理预览
      previewImages.forEach(item => revokeImagePreview(item.preview))
      setPreviewImages([])

      // 更新已上传图片列表
      setImages(uploadedImages)
      onImagesUploaded(uploadedImages)

      if (failedUploads.length === 0) {
        toast.success('所有图片上传成功')
      }
      else {
        toast.error(`${failedUploads.length}张图片上传失败`)
      }
    }
    catch (error) {
      console.error('批量上传错误:', error)
      toast.error('上传过程中发生错误')
    }
    finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {/* 已上传的图片 */}
        {images.map((image, index) => (
          <div key={`uploaded-${index}`} className="relative group">
            <div className="w-24 h-24 border rounded-md overflow-hidden">
              <ImagePreview
                imageKey={image}
                aspectRatio="square"
                className="w-24 h-24"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* 待上传的预览图片 */}
        {previewImages.map((item, index) => (
          <div key={`preview-${index}`} className="relative group">
            <div className="w-24 h-24 border rounded-md overflow-hidden">
              <ImagePreview
                previewUrl={item.preview}
                alt={`预览 ${index}`}
                aspectRatio="square"
                className="w-24 h-24"
              />
            </div>
            <button
              type="button"
              onClick={() => removePreview(index)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* 添加更多图片的按钮 */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="w-24 h-24 border border-dashed rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs">添加图片</span>
        </button>
      </div>

      {previewImages.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={uploadFiles}
            disabled={uploading}
            size="sm"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>上传所选图片</>
            )}
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
      />
    </div>
  )
}
