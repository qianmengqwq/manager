import type { Major } from './majorType'
import { useDeleteMajorModal, useMajorFormModal } from './MajorModals'
import { fetchMajors } from './MajorService'

export {
  fetchMajors,
  type Major,
  useDeleteMajorModal,
  useMajorFormModal,
}
