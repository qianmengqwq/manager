import type { College } from './collegeType'
import CollegeManager from './CollegeManager'
import { useAddCollegeModal, useDeleteCollegeModal } from './CollegeModals'
import { fetchColleges } from './CollegeService'

export {
  type College,
  fetchColleges,
  useAddCollegeModal,
  useDeleteCollegeModal,
}

export default CollegeManager
