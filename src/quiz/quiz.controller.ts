import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  HttpStatus,
  HttpCode,
  HttpException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger'
import { QuizService } from './quiz.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { SubmitAnswerDto } from './dto/submit-answer.dto'

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiBody({
    description: 'Payload to create a new quiz',
    type: CreateQuizDto,
    examples: {
      example1: {
        value: {
          title: 'Quiz',
          questions: [
            {
              text: 'What is the capital city of India?',
              options: ['Mumbai', 'New Delhi', 'Kolkata', 'Bengaluru'],
              correct_option: 2,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        success: true,
        message: 'Quiz created successfully',
        data: {
          id: '12345',
          title: 'Math Quiz',
          questions: [
            {
              id: '123456',
              text: 'What is the capital city of India?',
              options: ['Mumbai', 'New Delhi', 'Kolkata', 'Bengaluru'],
              correct_option: 2,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        success: false,
        message: 'Failed to create quiz',
        error: 'Title is required',
      },
    },
  })
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    const result = this.quizService.createQuiz(createQuizDto)
    if (!result.success) {
      throw new HttpException(
        { success: false, message: result.message, error: result.error },
        HttpStatus.BAD_REQUEST,
      )
    }
    return result
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Quiz retrieved successfully',
        quiz: {
          id: '1234',
          title: 'India',
          questions: [
            {
              id: '12345',
              text: 'What is the capital city of India?',
              options: ['Mumbai', 'New Delhi', 'Kolkata', 'Bengaluru'],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        success: false,
        message: 'Failed to get quiz',
        error: 'Quiz with ID 1234 not found',
      },
    },
  })
  async getQuiz(@Param('id') id: string) {
    const result = this.quizService.getQuiz(id)
    if (!result.success) {
      throw new HttpException(
        { success: false, message: result.message, error: result.error },
        HttpStatus.NOT_FOUND,
      )
    }
    return result
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Quiz deleted successfully',
        deletedResults: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        success: false,
        message: 'Failed to get quiz',
        error: 'Quiz with ID 1234 not found',
      },
    },
  })
  async deleteQuiz(@Param('id') id: string) {
    const result = this.quizService.deleteQuiz(id)
    if (!result.success) {
      throw new HttpException(
        { success: false, message: result.message, error: result.error },
        HttpStatus.NOT_FOUND,
      )
    }
    return result
  }

  @Post(':quizId/questions/:questionId/answer')
  @ApiOperation({ summary: 'Submit an answer for a quiz question' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiHeader({ name: 'userId', required: true, description: 'User ID' })
  @ApiBody({
    description: 'Answer submission payload',
    type: SubmitAnswerDto,
    examples: {
      example1: {
        value: {
          selected_option: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Answer submitted successfully',
        answer: {
          question_id: '2e7d870c-bec9-4200-8cbe-e5c311a8771b',
          selected_option: 1,
          is_correct: true,
          correct_answer: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: [
          'selected_option must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        success: false,
        message: 'Failed to submit answer',
        error: 'Quiz with ID e5e1179c-a220-45c6-b90d-59b67f4b4387 not found',
      },
    },
  })
  async submitAnswer(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
    @Headers('userId') userId: string,
  ) {
    const result = this.quizService.submitAnswer(
      quizId,
      questionId,
      userId,
      submitAnswerDto.selected_option,
    )
    if (!result.success) {
      const statusCode = result.error?.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST
      throw new HttpException(
        { success: false, message: result.message, error: result.error },
        statusCode,
      )
    }
    return result
  }

  @Get(':quizId/results/:userId')
  @ApiOperation({ summary: 'Get quiz results for a user' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        success: true,
        message: 'Results retrieved successfully',
        result: {
          quiz_id: '1234',
          user_id: '1',
          answers: [
            {
              question_id: '12345',
              selected_option: 2,
              is_correct: true,
              correct_answer: 2,
            },
          ],
          score: '1 / 9',
          submitted_at: '2024-12-02T10:03:11.991Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        success: false,
        message: 'Failed to submit answer',
        error: 'Quiz with ID 1234 not found',
      },
    },
  })
  async getResults(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
  ) {
    const result = this.quizService.getResults(quizId, userId)
    if (!result.success) {
      throw new HttpException(
        { success: false, message: result.message, error: result.error },
        HttpStatus.NOT_FOUND,
      )
    }
    return result
  }
}
