import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private apiUrl = `${environment.apiUrl}/feed`;

  constructor(private http: HttpClient) {}

  // GET /api/feed?postType=REGULAR
  getFeed(postType?: string): Observable<Post[]> {
    const params: any = {};
    if (postType) params['postType'] = postType;
    return this.http.get<Post[]>(this.apiUrl, { params });
  }

  // GET /api/feed/search?keyword=
  searchPosts(keyword: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/search`, { params: { keyword } });
  }

  // GET /api/feed/hashtag/{tag}
  searchByHashtag(tag: string): Observable<Post[]> {
    const clean = tag.startsWith('#') ? tag.substring(1) : tag;
    return this.http.get<Post[]>(`${this.apiUrl}/hashtag/${clean}`);
  }

  // GET /api/feed/trending-hashtags?limit=10
  getTrendingHashtags(limit = 10): Observable<{ name: string; count: number }[]> {
    return this.http.get<{ name: string; count: number }[]>(
      `${this.apiUrl}/trending-hashtags`, { params: { limit } }
    );
  }
}
