export interface SendMessageInput {
  sessionId: string;
  username: string;
  platform: string;
  text: string;
}

export interface MessageAdapter {
  sendMessage(input: SendMessageInput): Promise<void>;
}
