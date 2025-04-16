import type { Student } from '@/types/student'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudentState {
  student: Student | null
  isLoggedIn: boolean
  setStudent: (student: Student) => void
  clearStudent: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    set => ({
      student: null,
      isLoggedIn: false,
      setStudent: student => set({ student, isLoggedIn: true }),
      clearStudent: () => set({ student: null, isLoggedIn: false }),
    }),
    {
      name: 'student-storage',
    },
  ),
)
