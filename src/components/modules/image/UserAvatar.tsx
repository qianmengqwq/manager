import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchUserAvatar, uploadUserAvatar } from './ImageService'

interface UserAvatarProps {
  userId: number
  username: string
  profilePicture?: string
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  onAvatarUpdate?: (newProfilePicture: string) => void
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const iconSizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function UserAvatar({
  userId,
  username,
  profilePicture,
  size = 'sm',
  editable = false,
  onAvatarUpdate,
}: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profilePicture) {
      const loadAvatar = async () => {
        try {
          const url = await fetchUserAvatar(profilePicture)
          setImageUrl(url)
        }
        catch (error) {
          console.error('获取头像失败:', error)
        }
      }

      loadAvatar()
    }
  }, [profilePicture])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    setUploading(true)
    try {
      const result = await uploadUserAvatar(userId, file)
      if (result?.code === 1000 && result.result) {
        const url = await fetchUserAvatar(result.result.profilepicture)
        setImageUrl(url)
        onAvatarUpdate?.(result.result.profilepicture)
        toast.success('头像上传成功')
      }
    }
    catch (error) {
      console.error('上传头像错误:', error)
      toast.error('上传头像失败')
    }
    finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative inline-block">
      <Avatar className={sizeMap[size]}>
        <AvatarImage src={imageUrl || undefined} alt={username} />
        <AvatarFallback className={sizeMap[size]}>
          <User className={iconSizeMap[size]} />
        </AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <div
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={triggerFileInput}
          >
            {uploading ? (
              <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${iconSizeMap[size]}`} />
            ) : (
              <Upload className={`text-white ${iconSizeMap[size]}`} />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
} 