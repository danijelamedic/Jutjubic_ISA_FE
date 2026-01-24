export interface PublicVideoDTO {
  id: number;
  title: string;
  authorUsername: string;
  createdAt: string; // ISO string
  likeCount: number;
  commentCount: number;
  location: string | null;
  description: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;

  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface PublicCommentDTO {
  id: number;
  text: string;
  createdAt: string;
  authorUsername: string;
}

export interface PublicUserDTO {
  username: string;
  firstName: string;
  lastName: string;
}
