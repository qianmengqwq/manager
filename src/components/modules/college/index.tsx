import type { College } from './collegeType'
import CollegeManager from './CollegeManager'
import { useAddCollegeModal, useDeleteCollegeModal } from './CollegeModals'
import { fetchColleges } from './CollegeService'

export {
  fetchColleges,
  type College,
  useAddCollegeModal,
  useDeleteCollegeModal,
}

export default CollegeManager
