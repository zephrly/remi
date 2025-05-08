export interface UserRating {
  id: string;
  user_id: string;
  rated_user_id: string;
  interest_level: number;
  created_at: string;
  updated_at: string;
}

export interface InviteLink {
  id: string;
  code: string;
  user_id: string;
  created_at: string;
  used: boolean;
}

export interface Connection {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}
