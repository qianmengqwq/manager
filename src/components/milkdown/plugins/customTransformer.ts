import type { MilkdownPlugin } from '@milkdown/core'
import { createTransformer } from '@milkdown/transformer'

// 创建自定义transformer处理图片URL
export function createCustomTransformer(): MilkdownPlugin {
  const transformer = createTransformer({
    // 解析markdown为prosemirror节点时，处理图片URL
    parse: {
      // 对Image节点进行处理，将imageKey转换为完整URL
      transformNode: (node) => {
        if (node.type === 'image' && node.url) {
          return {
            ...node,
            // 保存原始的imageKey，稍后再渲染时使用
            data: { originalUrl: node.url },
          }
        }
        return node
      },
    },
    // 将prosemirror节点序列化为markdown时，保留原始imageKey
    serialize: {
      // 图片节点序列化时处理
      // 这里返回原始的imageKey，不处理URL
      image: (node) => {
        return {
          type: 'image',
          url: node.attrs.src,
          title: node.attrs.title,
          alt: node.attrs.alt,
        }
      },
    },
  })

  return transformer
}
