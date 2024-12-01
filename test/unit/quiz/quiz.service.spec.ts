import { Test } from '@nestjs/testing'
import { QuizService } from '../../../src/quiz/quiz.service'
import { NotFoundException } from '@nestjs/common'
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
      const answer = service.submitAnswer(
        QUIZ_ID,
        QUESTION_1_ID,
        userId,
        2, // correct option
      )

      expect(answer.is_correct).toBe(true)
      expect(answer.selected_option).toBe(2)
    })

    it('should submit an incorrect answer', () => {
      const answer = service.submitAnswer(
        QUIZ_ID,
        QUESTION_1_ID,
        userId,
        1, // incorrect option
      )

      expect(answer.is_correct).toBe(false)
      expect(answer.selected_option).toBe(1)
    })

    it('should throw NotFoundException for non-existent quiz', () => {
      expect(() =>
        service.submitAnswer('non-existent', QUESTION_1_ID, userId, 1),
      ).toThrow(NotFoundException)
    })

    it('should throw NotFoundException for non-existent question', () => {
      expect(() =>
        service.submitAnswer(QUIZ_ID, 'non-existent', userId, 1),
      ).toThrow(NotFoundException)
    })
  })

  describe('getResults', () => {
    const userId = 'user-1'

    it('should return results with correct score', () => {
      // Submit first answer (correct)
      const answer1 = service.submitAnswer(
        QUIZ_ID,
        QUESTION_1_ID,
        userId,
        2, // correct option
      )
      console.log('Answer 1:', answer1)

      // Submit second answer (incorrect)
      const answer2 = service.submitAnswer(
        QUIZ_ID,
        QUESTION_2_ID,
        userId,
        1, // incorrect option
      )
      console.log('Answer 2:', answer2)

      const results = service.getResults(QUIZ_ID, userId)
      console.log('Quiz Results:', results)

      expect(results.answers.length).toBe(2)

      expect(results.answers).toContainEqual(
        expect.objectContaining({
          question_id: QUESTION_1_ID,
          is_correct: true,
          selected_option: 2,
        }),
      )

      expect(results.answers).toContainEqual(
        expect.objectContaining({
          question_id: QUESTION_2_ID,
          is_correct: false,
          selected_option: 1,
        }),
      )

      expect(results.score).toBe('1 / 2')
    })

    it('should throw NotFoundException for non-existent user results', () => {
      expect(() => service.getResults(QUIZ_ID, 'non-existent')).toThrow(
        NotFoundException,
      )
    })

    it('should throw NotFoundException for non-existent quiz results', () => {
      service.submitAnswer(QUIZ_ID, QUESTION_1_ID, userId, 1)
      expect(() => service.getResults('non-existent', userId)).toThrow(
        NotFoundException,
      )
    })
  })

  describe('getQuiz', () => {
    it('should return quiz without correct answers', () => {
      const retrievedQuiz = service.getQuiz(QUIZ_ID)

      expect(retrievedQuiz.questions[0]).not.toHaveProperty('correct_option')
      expect(retrievedQuiz.title).toBe(mockQuiz.title)
      expect(retrievedQuiz.id).toBe(QUIZ_ID)
    })

    it('should throw NotFoundException for non-existent quiz', () => {
      expect(() => service.getQuiz('non-existent')).toThrow(NotFoundException)
    })
  })
})
