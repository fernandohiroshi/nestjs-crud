import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  readonly text: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly from: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly to: string;
}
