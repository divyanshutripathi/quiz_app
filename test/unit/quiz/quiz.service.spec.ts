import { Test } from '@nestjs/testing'
import { QuizService } from '../../../src/quiz/quiz.service'
import { Quiz } from '../../../src/quiz/entities/quiz.entity'

describe('QuizService', () => {
  let service: QuizService

  const QUIZ_ID = 'quiz-test-id'
  const QUESTION_1_ID = 'question-1-id'
  const QUESTION_2_ID = 'question-2-id'

  const mockQuiz: Quiz = {
    id: QUIZ_ID,
    title: 'Test Quiz',
    questions: [
      {
        id: QUESTION_1_ID,
        text: 'Question 1',
        options: ['A', 'B', 'C', 'D'],
        correct_option: 2,
      },
      {
        id: QUESTION_2_ID,
        text: 'Question 2',
        options: ['X', 'Y', 'Z'],
        correct_option: 0,
      },
    ],
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [QuizService],
    }).compile()

    service = module.get<QuizService>(QuizService)
    ;(service as any).quizzes.set(QUIZ_ID, mockQuiz)
  })

  describe('submitAnswer', () => {
    const userId = 'user-1'

    it('should submit a correct answer', () => {
      const response = service.submitAnswer(QUIZ_ID, QUESTION_1_ID, userId, 2)
      expect(response.success).toBe(true)
      expect(response.message).toBe('Answer submitted successfully')
      expect(response.answer.is_correct).toBe(true)
      expect(response.answer.selected_option).toBe(2)
    })

    it('should submit an incorrect answer', () => {
      const response = service.submitAnswer(QUIZ_ID, QUESTION_1_ID, userId, 1)
      expect(response.success).toBe(true)
      expect(response.message).toBe('Answer submitted successfully')
      expect(response.answer.is_correct).toBe(false)
      expect(response.answer.selected_option).toBe(1)
    })

    it('should update an existing answer', () => {
      service.submitAnswer(QUIZ_ID, QUESTION_1_ID, userId, 2)
      const updatedResponse = service.submitAnswer(
        QUIZ_ID,
        QUESTION_1_ID,
        userId,
        1,
      )

      expect(updatedResponse.success).toBe(true)
      expect(updatedResponse.answer.selected_option).toBe(1)
      expect(updatedResponse.answer.is_correct).toBe(false)
    })

    it('should handle invalid quiz ID', () => {
      const response = service.submitAnswer(
        'invalid-quiz',
        QUESTION_1_ID,
        userId,
        1,
      )
      expect(response.success).toBe(false)
      expect(response.error).toBe('Quiz with ID invalid-quiz not found')
    })

    it('should handle invalid question ID', () => {
      const response = service.submitAnswer(
        QUIZ_ID,
        'invalid-question',
        userId,
        1,
      )
      expect(response.success).toBe(false)
      expect(response.error).toBe('Question with ID invalid-question not found')
    })
  })

  describe('getQuiz', () => {
    it('should return quiz without correct options', () => {
      const response = service.getQuiz(QUIZ_ID)

      expect(response.success).toBe(true)
      expect(response.message).toBe('Quiz retrieved successfully')
      expect(response.quiz.questions[0]).not.toHaveProperty('correct_option')
    })

    it('should handle non-existent quiz', () => {
      const response = service.getQuiz('non-existent')
      expect(response.success).toBe(false)
      expect(response.error).toBe('Quiz with ID non-existent not found')
    })
  })

  describe('getResults', () => {
    const userId = 'user-1'

    it('should return results correctly', () => {
      service.submitAnswer(QUIZ_ID, QUESTION_1_ID, userId, 2)
      service.submitAnswer(QUIZ_ID, QUESTION_2_ID, userId, 1)

      const response = service.getResults(QUIZ_ID, userId)

      expect(response.success).toBe(true)
      expect(response.result.score).toBe('1 / 2')
    })

    it('should handle missing results for user', () => {
      const response = service.getResults(QUIZ_ID, 'non-existent-user')
      expect(response.success).toBe(false)
      expect(response.error).toBe('No results found for user non-existent-user')
    })

    it('should handle missing results for quiz', () => {
      service.submitAnswer(QUIZ_ID, QUESTION_1_ID, userId, 2)
      const response = service.getResults('non-existent-quiz', userId)

      expect(response.success).toBe(false)
      expect(response.error).toBe('No results found for quiz non-existent-quiz')
    })
  })

  describe('deleteQuiz', () => {
    it('should delete a quiz successfully', () => {
      const response = service.deleteQuiz(QUIZ_ID)
      expect(response.success).toBe(true)
      expect(response.deletedQuiz.id).toBe(QUIZ_ID)
    })

    it('should handle non-existent quiz ID', () => {
      const response = service.deleteQuiz('non-existent')
      expect(response.success).toBe(false)
      expect(response.error).toBe('Quiz with ID non-existent not found')
    })
  })

  describe('createQuiz', () => {
    it('should create a quiz successfully', () => {
      const newQuiz = {
        title: 'New Quiz',
        questions: [
          { text: 'Q1', options: ['A', 'B'], correct_option: 0 },
          { text: 'Q2', options: ['X', 'Y', 'Z'], correct_option: 2 },
        ],
      }

      const response = service.createQuiz(newQuiz)

      expect(response.success).toBe(true)
      expect(response.quiz.title).toBe('New Quiz')
      expect(response.quiz.questions.length).toBe(2)
    })

    it('should handle invalid quiz creation', () => {
      const response = service.createQuiz(null as any) // Invalid input
      expect(response.success).toBe(false)
      expect(response.message).toBe('Failed to create quiz')
    })
  })
})
