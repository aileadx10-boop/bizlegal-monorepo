export interface VisaCategory {
  code: string
  name: string
  ina_section: string
  category: 'nonimmigrant' | 'immigrant'
  requires_employer: boolean
  requires_labor_cert: boolean
  annual_cap: string
  max_initial_stay: string
  requirements: string[]
}

export const VISA_TYPES: VisaCategory[] = [
  {
    code: 'H-1B',
    name: 'Specialty Occupation Worker',
    ina_section: 'INA § 101(a)(15)(H)(i)(b)',
    category: 'nonimmigrant',
    requires_employer: true,
    requires_labor_cert: false,
    annual_cap: '65,000 + 20,000 master\'s exemption',
    max_initial_stay: '3 years (extendable to 6)',
    requirements: ['Bachelor\'s degree in specific specialty', 'Employer-employee relationship', 'Specialty occupation position', 'Approved LCA from DOL', 'Prevailing wage compliance'],
  },
  {
    code: 'L-1A',
    name: 'Intracompany Transferee — Manager/Executive',
    ina_section: 'INA § 101(a)(15)(L)',
    category: 'nonimmigrant',
    requires_employer: true,
    requires_labor_cert: false,
    annual_cap: 'No cap',
    max_initial_stay: '3 years (1 year if new office), max 7 years',
    requirements: ['1 year continuous employment abroad in preceding 3 years', 'Managerial or executive capacity', 'Qualifying relationship between US and foreign entity'],
  },
  {
    code: 'L-1B',
    name: 'Intracompany Transferee — Specialized Knowledge',
    ina_section: 'INA § 101(a)(15)(L)',
    category: 'nonimmigrant',
    requires_employer: true,
    requires_labor_cert: false,
    annual_cap: 'No cap',
    max_initial_stay: '3 years, max 5 years',
    requirements: ['1 year continuous employment abroad in preceding 3 years', 'Specialized knowledge of company products/processes', 'Qualifying relationship between US and foreign entity'],
  },
  {
    code: 'O-1A',
    name: 'Extraordinary Ability (Sciences/Business/Education/Athletics)',
    ina_section: 'INA § 101(a)(15)(O)',
    category: 'nonimmigrant',
    requires_employer: true,
    requires_labor_cert: false,
    annual_cap: 'No cap',
    max_initial_stay: '3 years (extendable in 1-year increments)',
    requirements: ['Meet ≥3 of 8 evidentiary criteria', 'Sustained national/international acclaim', 'Coming to continue work in area of extraordinary ability', 'Advisory opinion from peer group'],
  },
  {
    code: 'EB-1A',
    name: 'Extraordinary Ability — Green Card',
    ina_section: 'INA § 203(b)(1)(A)',
    category: 'immigrant',
    requires_employer: false,
    requires_labor_cert: false,
    annual_cap: '~40,000 (shared EB-1)',
    max_initial_stay: 'Permanent',
    requirements: ['Meet ≥3 of 10 evidentiary criteria', 'Sustained national/international acclaim', 'Continue work in area of extraordinary ability', 'Self-petition allowed (no employer needed)'],
  },
  {
    code: 'EB-2 NIW',
    name: 'National Interest Waiver — Green Card',
    ina_section: 'INA § 203(b)(2)',
    category: 'immigrant',
    requires_employer: false,
    requires_labor_cert: false,
    annual_cap: '~40,000 (shared EB-2)',
    max_initial_stay: 'Permanent',
    requirements: ['Advanced degree or exceptional ability', 'Matter of Dhanasar 3-prong test', 'Work has substantial merit and national importance', 'Self-petition allowed'],
  },
  {
    code: 'EB-5',
    name: 'Immigrant Investor — Green Card',
    ina_section: 'INA § 203(b)(5)',
    category: 'immigrant',
    requires_employer: false,
    requires_labor_cert: false,
    annual_cap: '~10,000',
    max_initial_stay: 'Permanent (conditional 2 years)',
    requirements: ['Capital investment of $1.05M ($800K in TEA)', 'Create 10+ full-time jobs', 'Lawful source of funds', 'Active management or Regional Center'],
  },
]

export function findVisaType(code: string): VisaCategory | undefined {
  return VISA_TYPES.find(v => v.code.toLowerCase() === code.toLowerCase())
}
