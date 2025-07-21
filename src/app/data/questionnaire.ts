export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  question: string;
  comp_type: 'Radio';
  options: QuestionOption[];
}

export interface QuestionnaireResponse {
  questionId: string;
  selectedOption: QuestionOption;
  timestamp: Date;
}

export interface QuestionnaireState {
  questions: Question[];
  responses: Record<string, QuestionnaireResponse>;
  currentQuestionIndex: number;
  isStarted: boolean;
  isCompleted: boolean;
  language: 'en' | 'hi';
}

// Sample questions for the questionnaire (based on insurance verification)
export const sampleQuestions: Question[] = [
  {
    id: 'Q1',
    question: 'The premium amount of Rs. 50,000 is to be paid every year for 10 years.',
    comp_type: 'Radio',
    options: [
      { id: 'Q1_yes', label: 'Yes', value: '1' },
      { id: 'Q1_no', label: 'No', value: '2' }
    ]
  },
  {
    id: 'Q2',
    question: 'The term in your policy is 5 years and life cover is Rs 2,00,000 (Fifty Two Lacs Six Hundred Rupees)?',
    comp_type: 'Radio',
    options: [
      { id: 'Q2_yes', label: 'Yes', value: '1' },
      { id: 'Q2_no', label: 'No', value: '2' }
    ]
  },
  {
    id: 'Q3',
    question: 'Are you currently employed and earning a regular income?',
    comp_type: 'Radio',
    options: [
      { id: 'Q3_yes', label: 'Yes', value: '1' },
      { id: 'Q3_no', label: 'No', value: '2' }
    ]
  },
  {
    id: 'Q4',
    question: 'Do you have any existing life insurance policies with other companies?',
    comp_type: 'Radio',
    options: [
      { id: 'Q4_yes', label: 'Yes', value: '1' },
      { id: 'Q4_no', label: 'No', value: '2' }
    ]
  },
  {
    id: 'Q5',
    question: 'Have you disclosed all your medical conditions and health information accurately?',
    comp_type: 'Radio',
    options: [
      { id: 'Q5_yes', label: 'Yes', value: '1' },
      { id: 'Q5_no', label: 'No', value: '2' }
    ]
  },
  {
    id: 'Q6',
    question: 'Do you understand the terms and conditions of this insurance policy?',
    comp_type: 'Radio',
    options: [
      { id: 'Q6_yes', label: 'Yes', value: '1' },
      { id: 'Q6_no', label: 'No', value: '2' }
    ]
  },
  {
    id: 'Q7',
    question: 'Please confirm your current occupation is Salaried?',
    comp_type: 'Radio',
    options: [
      { id: 'Q7_yes', label: 'Yes', value: '1' },
      { id: 'Q7_no', label: 'No', value: '2' }
    ]
  }
];

// WebSocket message types for questionnaire
export const QUESTIONNAIRE_MESSAGE_TYPES = {
  QUESTION_STARTED: 'question_started',
  QUESTIONS_LIST: 'questions_list',
  QUESTION: 'question',
  SUBMIT_RESPONSE: 'submit_response',
  CHANGE_LANGUAGE: 'change_language',
  QUESTIONNAIRE_COMPLETED: 'questionnaire_completed',
  CUSTOMER_AGREED: 'customer_agreed'
} as const;

export type QuestionnaireMessageType = typeof QUESTIONNAIRE_MESSAGE_TYPES[keyof typeof QUESTIONNAIRE_MESSAGE_TYPES];

export interface QuestionnairePayload {
  totalQuestions?: number;
  questions?: Question[];
  question?: Question;
  questionIndex?: number;
  questionId?: string;
  response?: QuestionOption;
  responses?: Record<string, QuestionnaireResponse>;
  completedAt?: Date;
}