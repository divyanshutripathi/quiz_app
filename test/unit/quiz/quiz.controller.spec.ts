import { Test, TestingModule } from '@nestjs/testing'
import { QuizController } from '../../../src/quiz/quiz.controller'
import { QuizService } from '../../../src/quiz/quiz.service'
import { HttpException } from '@nestjs/common'
import { CreateQuizDto } from '../../../src/quiz/dto/create-quiz.dto'
import { SubmitAnswerDto } from '../../../src/quiz/dto/submit-answer.dto'

describe('QuizController', () => {
  let controller: QuizController
  let service: QuizService

  const mockQuizService = {
    createQuiz: jest.fn(),
    getQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
    submitAnswer: jest.fn(),
    getResults: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile()

    controller = module.get<QuizController>(QuizController)
    service = module.get<QuizService>(QuizService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createQuiz', () => {
    it('should create a quiz successfully', async () => {
      const dto: CreateQuizDto = { title: 'Test Quiz', questions: [] }
      mockQuizService.createQuiz.mockReturnValueOnce({
        success: true,
        quiz: {},
      })

      const result = await controller.createQuiz(dto)

      expect(mockQuizService.createQuiz).toHaveBeenCalledWith(dto)
      expect(result.success).toBe(true)
    })

    it('should throw an exception when quiz creation fails', async () => {
      const dto: CreateQuizDto = { title: 'Test Quiz', questions: [] }
      mockQuizService.createQuiz.mockReturnValueOnce({
        success: false,
        message: 'Error creating quiz',
        error: 'Validation Error',
      })

      await expect(controller.createQuiz(dto)).rejects.toThrow(HttpException)
      expect(mockQuizService.createQuiz).toHaveBeenCalledWith(dto)
    })
  })

  describe('getQuiz', () => {
    it('should return a quiz successfully', async () => {
      const quizId = 'quiz-test-id'
      mockQuizService.getQuiz.mockReturnValueOnce({ success: true, quiz: {} })

      const result = await controller.getQuiz(quizId)

      expect(mockQuizService.getQuiz).toHaveBeenCalledWith(quizId)
      expect(result.success).toBe(true)
    })

    it('should throw an exception when quiz is not found', async () => {
      const quizId = 'quiz-test-id'
      mockQuizService.getQuiz.mockReturnValueOnce({
        success: false,
        message: 'Quiz not found',
        error: 'Not Found',
      })

      await expect(controller.getQuiz(quizId)).rejects.toThrow(HttpException)
      expect(mockQuizService.getQuiz).toHaveBeenCalledWith(quizId)
    })
  })

  describe('deleteQuiz', () => {
    it('should delete a quiz successfully', async () => {
      const quizId = 'quiz-test-id'
      mockQuizService.deleteQuiz.mockReturnValueOnce({ success: true })

      const result = await controller.deleteQuiz(quizId)

      expect(mockQuizService.deleteQuiz).toHaveBeenCalledWith(quizId)
      expect(result.success).toBe(true)
    })

    it('should throw an exception when quiz deletion fails', async () => {
      const quizId = 'quiz-test-id'
      mockQuizService.deleteQuiz.mockReturnValueOnce({
        success: false,
        message: 'Quiz not found',
        error: 'Not Found',
      })

      await expect(controller.deleteQuiz(quizId)).rejects.toThrow(HttpException)
      expect(mockQuizService.deleteQuiz).toHaveBeenCalledWith(quizId)
    })
  })

  describe('submitAnswer', () => {
    it('should submit an answer successfully', async () => {
      const quizId = 'quiz-test-id'
      const questionId = 'question-test-id'
      const userId = 'user-test-id'
      const dto: SubmitAnswerDto = { selected_option: 1 }
      mockQuizService.submitAnswer.mockReturnValueOnce({ success: true })

      const result = await controller.submitAnswer(
        quizId,
        questionId,
        dto,
        userId,
      )

      expect(mockQuizService.submitAnswer).toHaveBeenCalledWith(
        quizId,
        questionId,
        userId,
        dto.selected_option,
      )
      expect(result.success).toBe(true)
    })

    it('should throw an exception for invalid answers', async () => {
      const quizId = 'quiz-test-id'
      const questionId = 'question-test-id'
      const userId = 'user-test-id'
      const dto: SubmitAnswerDto = { selected_option: 1 }
      mockQuizService.submitAnswer.mockReturnValueOnce({
        success: false,
        message: 'Invalid answer',
        error: 'Bad Request',
      })

      await expect(
        controller.submitAnswer(quizId, questionId, dto, userId),
      ).rejects.toThrow(HttpException)
      expect(mockQuizService.submitAnswer).toHaveBeenCalledWith(
        quizId,
        questionId,
        userId,
        dto.selected_option,
      )
    })
  })

  describe('getResults', () => {
    it('should retrieve results successfully', async () => {
      const quizId = 'quiz-test-id'
      const userId = 'user-test-id'
      mockQuizService.getResults.mockReturnValueOnce({
        success: true,
        result: {},
      })

      const result = await controller.getResults(quizId, userId)

      expect(mockQuizService.getResults).toHaveBeenCalledWith(quizId, userId)
      expect(result.success).toBe(true)
    })

    it('should throw an exception when results are not found', async () => {
      const quizId = 'quiz-test-id'
      const userId = 'user-test-id'
      mockQuizService.getResults.mockReturnValueOnce({
        success: false,
        message: 'Results not found',
        error: 'Not Found',
      })

      await expect(controller.getResults(quizId, userId)).rejects.toThrow(
        HttpException,
      )
      expect(mockQuizService.getResults).toHaveBeenCalledWith(quizId, userId)
    })
  })
})
