import { Injectable, NotFoundException } from '@nestjs/common'
import {
  Quiz,
  Answer,
  Result,
  CreateQuizResponse,
  DeleteQuizResponse,
  SubmitAnswerResponse,
  GetQuizResponse,
  GetResultsResponse,
} from './entities/quiz.entity'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class QuizService {
  private quizzes: Map<string, Quiz> = new Map()
  private results: Map<string, Result[]> = new Map()

  createQuiz(createQuizDto: CreateQuizDto): CreateQuizResponse {
    try {
      const quiz: Quiz = {
        id: uuidv4(),
        title: createQuizDto.title,
        questions: createQuizDto.questions.map((q) => ({
          id: uuidv4(),
          text: q.text,
          options: q.options,
          correct_option: q.correct_option,
        })),
      }

      this.quizzes.set(quiz.id, quiz)
      return {
        success: true,
        message: 'Quiz created successfully',
        quiz,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create quiz',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  deleteQuiz(quizId: string): DeleteQuizResponse {
    try {
      const quiz = this.quizzes.get(quizId)
      if (!quiz) {
        return {
          success: false,
          message: 'Failed to delete quiz',
          error: `Quiz with ID ${quizId} not found`,
        }
      }

      this.quizzes.delete(quizId)
      let deletedResultsCount = 0

      try {
        for (const [userId, userResults] of this.results.entries()) {
          const filteredResults = userResults.filter(
            (result) => result.quiz_id !== quizId,
          )
          deletedResultsCount += userResults.length - filteredResults.length

          if (filteredResults.length === 0) {
            this.results.delete(userId)
          } else {
            this.results.set(userId, filteredResults)
          }
        }

        return {
          success: true,
          message: `Quiz deleted successfully`,
          deletedResults: deletedResultsCount,
        }
      } catch (error) {
        // Restore quiz if results cleanup fails
        this.quizzes.set(quizId, quiz)
        return {
          success: false,
          message: 'Failed to delete quiz results',
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete quiz',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  submitAnswer(
    quizId: string,
    questionId: string,
    userId: string,
    selectedOption: number,
  ): SubmitAnswerResponse {
    try {
      const quiz = this.quizzes.get(quizId)
      if (!quiz) {
        return {
          success: false,
          message: 'Failed to submit answer',
          error: `Quiz with ID ${quizId} not found`,
        }
      }

      const question = quiz.questions.find((q) => q.id === questionId)
      if (!question) {
        return {
          success: false,
          message: 'Failed to submit answer',
          error: `Question with ID ${questionId} not found`,
        }
      }

      const answer: Answer = {
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: selectedOption === question.correct_option,
        correct_answer: question.correct_option,
      }

      let userResults = this.results.get(userId) || []
      let quizResult = userResults.find((r) => r.quiz_id === quizId)

      if (!quizResult) {
        quizResult = {
          quiz_id: quizId,
          user_id: userId,
          answers: [],
          score: '',
          submitted_at: new Date(),
        }
        userResults.push(quizResult)
      }

      const existingAnswerIndex = quizResult.answers.findIndex(
        (a) => a.question_id === questionId,
      )

      if (existingAnswerIndex !== -1) {
        quizResult.answers[existingAnswerIndex] = answer
      } else {
        quizResult.answers.push(answer)
      }

      quizResult.score = this.calculateScore(
        quizResult.answers,
        quiz.questions.length,
      )

      this.results.set(userId, userResults)
      return {
        success: true,
        message: 'Answer submitted successfully',
        answer,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit answer',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  getQuiz(id: string): GetQuizResponse {
    try {
      const quiz = this.quizzes.get(id)
      if (!quiz) {
        return {
          success: false,
          message: 'Failed to get quiz',
          error: `Quiz with ID ${id} not found`,
        }
      }

      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map(
          ({ correct_option, ...question }) => question,
        ),
      }

      return {
        success: true,
        message: 'Quiz retrieved successfully',
        quiz: sanitizedQuiz,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get quiz',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  getResults(quizId: string, userId: string): GetResultsResponse {
    try {
      const userResults = this.results.get(userId)
      if (!userResults) {
        return {
          success: false,
          message: 'Failed to get results',
          error: `No results found for user ${userId}`,
        }
      }

      const result = userResults.find((r) => r.quiz_id === quizId)
      if (!result) {
        return {
          success: false,
          message: 'Failed to get results',
          error: `No results found for quiz ${quizId}`,
        }
      }

      const quiz = this.quizzes.get(quizId)
      if (quiz) {
        result.score = this.calculateScore(
          result.answers,
          quiz.questions.length,
        )
      }

      return {
        success: true,
        message: 'Results retrieved successfully',
        result,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get results',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  private calculateScore(answers: Answer[], totalQuestions: number): string {
    const correctAnswers = answers.filter((a) => a.is_correct).length
    return `${correctAnswers} / ${totalQuestions}`
  }
}
