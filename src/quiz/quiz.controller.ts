import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  HttpStatus,
  HttpCode,
} from '@nestjs/common'
import { QuizService } from './quiz.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { SubmitAnswerDto } from './dto/submit-answer.dto'
import { SubmitQuizAnswersDto } from './dto/submit-quiz.dto'

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.createQuiz(createQuizDto)
  }

  @Get(':id')
  getQuiz(@Param('id') id: string) {
    return this.quizService.getQuiz(id)
  }

  @Post(':quizId/questions/:questionId/answer')
  submitAnswer(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
    @Headers('userId') userId: string,
  ) {
    return this.quizService.submitAnswer(
      quizId,
      questionId,
      userId,
      submitAnswerDto.selected_option,
    )
  }

  @Get(':quizId/results/:userId')
  getResults(@Param('quizId') quizId: string, @Param('userId') userId: string) {
    return this.quizService.getResults(quizId, userId)
  }
}
