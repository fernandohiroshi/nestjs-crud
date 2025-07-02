import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @MinLength(1)
  readonly text: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(1)
  readonly from: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(1)
  readonly to: string;
}
