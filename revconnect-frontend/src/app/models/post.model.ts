export interface Post {
  id?: number;
  content: string;
  authorId: number;
  authorName?: string;
  createdAt?: string;
  originalPostId?: number;
  isShared?: boolean;
  postType?: string;
  callToAction?: string;
  mediaPath?: string;
  isPinned?: boolean;
  hashtags?: string[];
  likeCount?: number;
  commentCount?: number;
  scheduledAt?: string;       // ISO datetime string — null means published
  taggedProductIds?: number[];
  isPublished?: boolean;      // false when scheduledAt is in the future
}

export interface Comment {
  id?: number;
  content: string;
  userId: number;
  postId: number;
  createdAt?: string;
  username?: string;
  userName?: string;
}

export interface Like {
  userId: number;
  postId: number;
}
