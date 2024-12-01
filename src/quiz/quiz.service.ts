import { Injectable, NotFoundException } from '@nestjs/common'
import { Quiz, Question, Answer, Result } from './entities/quiz.entity'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class QuizService {
  private quizzes: Map<string, Quiz> = new Map()
  private results: Map<string, Result[]> = new Map()

  createQuiz(createQuizDto: CreateQuizDto): Quiz {
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
    return quiz
  }

  submitAnswer(
    quizId: string,
    questionId: string,
    userId: string,
    selectedOption: number,
  ): Answer {
    const quiz = this.quizzes.get(quizId)
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`)
    }

    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`)
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
      // Replace existing answer
      quizResult.answers[existingAnswerIndex] = answer
    } else {
      // Add new answer
      quizResult.answers.push(answer)
    }

    // Calculate score based on total questions in the quiz
    quizResult.score = this.calculateScore(
      quizResult.answers,
      quiz.questions.length,
    )

    this.results.set(userId, userResults)
    return answer
  }

  getQuiz(id: string): Omit<Quiz, 'questions'> & {
    questions: Omit<Question, 'correct_option'>[]
  } {
    const quiz = this.quizzes.get(id)
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`)
    }

    return {
      ...quiz,
      questions: quiz.questions.map(
        ({ correct_option, ...question }) => question,
      ),
    }
  }

  getResults(quizId: string, userId: string): Result {
    const userResults = this.results.get(userId)
    if (!userResults) {
      throw new NotFoundException(`No results found for user ${userId}`)
    }

    const result = userResults.find((r) => r.quiz_id === quizId)
    if (!result) {
      throw new NotFoundException(`No results found for quiz ${quizId}`)
    }

    // Ensure the score is calculated based on total questions
    const quiz = this.quizzes.get(quizId)
    if (quiz) {
      result.score = this.calculateScore(result.answers, quiz.questions.length)
    }

    return result
  }

  private calculateScore(answers: Answer[], totalQuestions: number): string {
    const correctAnswers = answers.filter((a) => a.is_correct).length
    return `${correctAnswers} / ${totalQuestions}`
  }
}
