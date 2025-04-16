import type { Activity } from '@/types/activity'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ActivityState {
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  clearActivities: () => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    set => ({
      activities: [],
      setActivities: activities => set({ activities }),
      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: 'activity-storage',
    },
  ),
)
