import type {
  ExtendedColumnFilter,
  ExtendedColumnSort,
} from '@/types/data-table'
import { dataTableConfig } from '@/config/data-table'

import { createParser } from 'nuqs'

import { z } from 'zod'

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
})

export function getSortingStateParser<TData>(columnIds?: string[] | Set<string>) {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(sortingItemSchema).safeParse(parsed)

        if (!result.success)
          return null

        if (validKeys && result.data.some(item => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedColumnSort<TData>[]
      }
      catch {
        return null
      }
    },
    serialize: value => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length
      && a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc,
      ),
  })
}

const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
})

export type FilterItemSchema = z.infer<typeof filterItemSchema>

export function getFiltersStateParser<TData>(columnIds?: string[] | Set<string>) {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(filterItemSchema).safeParse(parsed)

        if (!result.success)
          return null

        if (validKeys && result.data.some(item => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedColumnFilter<TData>[]
      }
      catch {
        return null
      }
    },
    serialize: value => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length
      && a.every(
        (filter, index) =>
          filter.id === b[index]?.id
          && (filter as any).value === (b[index] as any)?.value
          && (filter as any).variant === (b[index] as any)?.variant
          && (filter as any).operator === (b[index] as any)?.operator,
      ),
  })
}
