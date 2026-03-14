import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post, Comment } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  // POST /api/posts  — X-User-Id added by JWT interceptor
  createPost(post: Post & { hashtags?: string[]; scheduledAt?: string; taggedProductIds?: number[] }): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, {
      content: post.content,
      postType: post.postType || 'REGULAR',
      callToAction: post.callToAction || null,
      mediaPath: post.mediaPath || null,
      hashtags: post.hashtags || null,
      scheduledAt: post.scheduledAt || null,
      taggedProductIds: post.taggedProductIds || null
    });
  }

  // GET /api/posts/{postId}
  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  // GET /api/posts/user/{userId} — user's own posts (paginated)
  getPostsByUser(userId: number): Observable<Post[]> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`).pipe(
      map(r => r.content || r)
    );
  }

  // GET /api/posts/feed?followingIds=1,2,3&postType=REGULAR — personalized feed
  getFeed(followingIds: number[], postType?: string): Observable<Post[]> {
    const params: any = {};
    if (followingIds.length > 0) params['followingIds'] = followingIds.join(',');
    if (postType) params['postType'] = postType;
    return this.http.get<Post[]>(`${this.apiUrl}/feed`, { params });
  }

  // GET /api/posts/search?keyword=
  searchPosts(keyword: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/search`, { params: { keyword } });
  }

  // GET /api/posts/hashtag/{tag}
  searchByHashtag(tag: string): Observable<Post[]> {
    const clean = tag.startsWith('#') ? tag.substring(1) : tag;
    return this.http.get<Post[]>(`${this.apiUrl}/hashtag/${clean}`);
  }

  // GET /api/posts/trending-hashtags
  getTrendingHashtags(limit = 10): Observable<{ name: string; count: number }[]> {
    return this.http.get<{ name: string; count: number }[]>(`${this.apiUrl}/trending-hashtags`, { params: { limit } });
  }

  // PUT /api/posts/{postId}
  updatePost(id: number, content: string, hashtags?: string[]): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, { content, hashtags: hashtags || null });
  }

  // DELETE /api/posts/{postId}
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // POST /api/posts/{postId}/share
  sharePost(postId: number): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${postId}/share`, {});
  }

  // POST /api/posts/{postId}/pin
  pinPost(postId: number): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${postId}/pin`, {});
  }

  // DELETE /api/posts/{postId}/pin
  unpinPost(postId: number): Observable<Post> {
    return this.http.delete<Post>(`${this.apiUrl}/${postId}/pin`);
  }

  // GET /api/posts/scheduled
  getScheduledPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/scheduled`);
  }

  // GET /api/posts/pinned/{userId}
  getPinnedPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/pinned/${userId}`);
  }

  // ---- Comments ----

  addComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/comments`, {
      postId: comment.postId,
      content: comment.content
    });
  }

  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/comments/post/${postId}`);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${id}`);
  }

  // ---- Likes ----

  likePost(postId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/likes`, {}, { params: { postId } });
  }

  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/likes`, { params: { postId } });
  }

  getLikeCount(postId: number): Observable<number> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/likes/post/${postId}/count`).pipe(
      map(r => r.count)
    );
  }

  isLikedByUser(postId: number): Observable<boolean> {
    return this.http.get<{ liked: boolean }>(`${environment.apiUrl}/likes/post/${postId}/user`).pipe(
      map(r => r.liked)
    );
  }

  // ---- Search ----

  searchUsers(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/search`, { params: { keyword } });
  }

  // ---- File upload ----

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/files/upload`, formData);
  }
}
