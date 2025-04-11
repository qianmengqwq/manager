import { ImageIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchActivityImage } from './ImageService'

interface ImagePreviewProps {
  imageKey?: string
  previewUrl?: string
  className?: string
  alt?: string
  showPlaceholder?: boolean
  aspectRatio?: 'square' | 'auto' | '16/9' | '4/3'
}

/**
 * 通用图片预览组件
 *
 * 可以接收图片的key（用于从API获取）或者直接的previewUrl
 * 如果同时提供了两者，则优先使用previewUrl
 */
export function ImagePreview({
  imageKey,
  previewUrl,
  className = '',
  alt = '图片预览',
  showPlaceholder = true,
  aspectRatio = 'square',
}: ImagePreviewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(previewUrl || null)

  const aspectRatioClass = {
    'square': 'aspect-square',
    'auto': '',
    '16/9': 'aspect-video',
    '4/3': 'aspect-4/3',
  }[aspectRatio]

  useEffect(() => {
    // 如果直接提供了预览URL，优先使用
    if (previewUrl) {
      setImageUrl(previewUrl)
      setError(false)
      return
    }

    // 如果没有imageKey，则不进行加载
    if (!imageKey) {
      setImageUrl(null)
      setError(false)
      return
    }

    // 否则从API获取图片
    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(false)
        const url = await fetchActivityImage(imageKey)
        setImageUrl(url)
      }
      catch (error) {
        console.error('加载图片失败:', error)
        setError(true)
      }
      finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [imageKey, previewUrl])

  if (loading) {
    return (
      <div className={`bg-muted flex items-center justify-center ${aspectRatioClass} ${className}`}>
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (error || (!imageUrl && showPlaceholder)) {
    return (
      <div className={`bg-muted flex items-center justify-center ${aspectRatioClass} ${className}`}>
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  if (!imageUrl) {
    return null
  }

  return (
    <div className={`overflow-hidden ${aspectRatioClass} ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * 图片网格组件 - 用于展示多张图片
 */
export function ImageGrid({
  imageKeys,
  className = '',
  maxDisplay = 4,
}: {
  imageKeys: string[]
  className?: string
  maxDisplay?: number
}) {
  const displayCount = Math.min(imageKeys.length, maxDisplay)
  const hasMore = imageKeys.length > maxDisplay

  return (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`}>
      {imageKeys.slice(0, displayCount).map((key, index) => (
        <ImagePreview key={index} imageKey={key} aspectRatio="square" />
      ))}

      {hasMore && (
        <div className="bg-muted flex items-center justify-center aspect-square rounded-md">
          <span className="text-muted-foreground font-medium">
            +
            {imageKeys.length - maxDisplay}
          </span>
        </div>
      )}
    </div>
  )
}
