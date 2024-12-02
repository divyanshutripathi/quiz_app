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
import { QuizService } from './quiz.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { SubmitAnswerDto } from './dto/submit-answer.dto'

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
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
