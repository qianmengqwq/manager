import type { Major } from './majorType'
import { useAddMajorModal, useDeleteMajorModal } from './MajorModals'
import { fetchMajors } from './MajorService'

export {
  fetchMajors,
  type Major,
  useAddMajorModal,
  useDeleteMajorModal,
}
