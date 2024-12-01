import {
  IsString,
  IsArray,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateQuestionDto {
  @IsString()
  text: string

  @IsArray()
  @ArrayMinSize(4)
  options: string[]

  @IsNumber()
  correct_option: number
}

export class CreateQuizDto {
  @IsString()
  title: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[]
}
