export interface CreateCommentRequest {
  text: string;
}

export interface CreateCommentResponse {
  id: number;
  text: string;
  authorUsername: string;
  createdAt: string;
}
