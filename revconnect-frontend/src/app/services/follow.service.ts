import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = `${environment.apiUrl}/follows`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  followUser(followerId: number, followingId: number): Observable<Follow> {
    return this.http.post<Follow>(this.apiUrl, { followingId }).pipe(
      tap(() => {
        // Send FOLLOW notification to the person being followed
        const username = this.authService.getCurrentUser()?.username || 'Someone';
        this.http.post(`${environment.apiUrl}/notifications`, {
          senderId: followerId,
          receiverId: followingId,
          type: 'FOLLOW',
          message: `${username} started following you`,
          postId: null
        }).subscribe({ error: () => {} });
      })
    );
  }

  unfollowUser(followerId: number, followingId: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl, { params: { followingId } });
  }

  getFollowers(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/followers/${userId}`);
  }

  getFollowing(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/following/${userId}`);
  }

  checkFollowStatus(followerId: number, followingId: number): Observable<{ isFollowing: boolean }> {
    return this.http.get<boolean>(`${this.apiUrl}/check`, { params: { followerId, followingId } }).pipe(
      map(result => ({ isFollowing: result }))
    );
  }
}
