import { IsNumber } from 'class-validator'

export class SubmitAnswerDto {
  @IsNumber()
  selected_option: number
}
