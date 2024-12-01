export interface Question {
  id: string
  text: string
  options: string[]
  correct_option: number
}

export interface Quiz {
  id: string
  title: string
  questions: Question[]
}

export interface Answer {
  question_id: string
  selected_option: number
  correct_answer: number
  is_correct: boolean
}

export interface Result {
  quiz_id: string
  user_id: string
  answers: Answer[]
  score: string
  submitted_at: Date
}