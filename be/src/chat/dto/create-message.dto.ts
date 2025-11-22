import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsInt()
  groupId?: number; // ID của nhóm chat, nếu là chat nhóm

  @IsNotEmpty()
  @IsString()
  content: string;
}