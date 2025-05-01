export interface Memory {
  id: string;
  userId: string;
  prompt: string;
  content: string;
  createdAt: string;
  tags?: {
    id: string;
    user?: {
      id: string;
      name: string;
    };
  }[];
  photos?: {
    id: string;
    photoUrl: string;
  }[];
  comments?: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    user?: {
      name: string;
    };
  }[];
}
