export interface FormTypeNode {
  [key: string]: FormTypeNode | string[];
}

export const formTypes: FormTypeNode = {
  'Corporate Enterprise Workspace': {
    'Product & Engineering': {
      'General Engineering': [
        'Project Roadmap Proposal',
        'Sprint Planning Brief',
        'Bug Report Template',
        'Feature Request Form'
      ],
      'Website Development': [
        'Website Idea Generation',
        'Website Design Brief',
        'Technical Specification Document',
        'Deployment Plan',
        'SEO Strategy Outline'
      ]
    },
    'Sales & Marketing': [
      'Marketing Campaign Brief',
      'Sales Funnel Analysis Report',
      'Partnership Proposal',
      'Social Media Content Calendar',
      'Press Release Draft'
    ],
    'Finance & Accounting': [
      'Quarterly Financial Report',
      'Annual Budget Proposal',
      'Capital Expenditure Request (CapEx)',
      'Invoice Template',
      'Expense Report'
    ],
    'People Operations (HR)': [
      'New Hire Onboarding Plan',
      'Employee Performance Review',
      'Internal Mobility Application',
      'Compensation & Benefits Plan',
      'Job Description Template'
    ],
    'Legal, Compliance & Operations': [
      'Internal Audit Report',
      'Vendor Contract Agreement',
      'Non-Disclosure Agreement (NDA)',
      'Supply Chain Logistics Plan',
      'Patent Application Outline'
    ],
    'Intelligence & Security': [
      'Competitive Intelligence Report',
      'Geopolitical Risk Analysis',
      'Social Media Sentiment Analysis',
      'Security Threat Assessment'
    ]
  },
  'Veterans Affairs': [
    'Health Benefits Application (10-10EZ)',
    'Disability Claim (Form 21-526EZ)',
    'Education Benefits (Form 22-1990)',
  ],
  'Legal': {
    'General': ['Client Intake Form', 'Affidavit'],
  },
  'Medical & Health': {
    'General': ['New Patient Intake', 'Insurance Claim Form'],
  },
  'Custom': ['Generic Unstructured Form'],
};