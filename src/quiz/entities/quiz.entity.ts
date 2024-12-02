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

interface BaseResponse {
  success: boolean
  message: string
  error?: string
}

export interface CreateQuizResponse extends BaseResponse {
  quiz?: Quiz
}

export interface DeleteQuizResponse extends BaseResponse {
  deletedQuiz?: Quiz
  deletedResults?: number
}

export interface SubmitAnswerResponse extends BaseResponse {
  answer?: Answer
  result?: Result
}

export interface GetQuizResponse extends BaseResponse {
  quiz?: Omit<Quiz, 'questions'> & {
    questions: Omit<Question, 'correct_option'>[]
  }
}

export interface GetResultsResponse extends BaseResponse {
  result?: Result
}
