import type { College } from './collegeType'
import CollegeManager from './CollegeManager'
import { useCollegeFormModal, useDeleteCollegeModal } from './CollegeModals'
import { fetchColleges } from './CollegeService'

export {
  type College,
  CollegeManager,
  fetchColleges,
  useCollegeFormModal,
  useDeleteCollegeModal,
}

export default CollegeManager
