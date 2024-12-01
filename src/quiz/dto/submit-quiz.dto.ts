export interface QuestionAnswer {
  questionId: string
  selectedOption: number
}

export class SubmitQuizAnswersDto {
  answers: QuestionAnswer[]
}
