export class GetChatBoxesQueryDto {
  user_id: number;
}

export class ChatBoxItemDto {
  group_id: number;
  group_name: string;
  icon_url?: string;
  latest_message?: string;
  latest_message_time?: Date;
  latest_message_sender?: string;
  unread_count: number;
  created_at: Date;
}

export class GetChatBoxesResponseDto {
  success: boolean;
  data: ChatBoxItemDto[];
  message?: string;
}

export class MessageItemDto {
  message_id: number;
  content: string;
  created_at: Date;
  sender: {
    user_id: number;
    name: string;
    email: string;
  } | null;
}

export class GetChatBoxMessagesResponseDto {
  success: boolean;
  data: MessageItemDto[];
  message?: string;
}



