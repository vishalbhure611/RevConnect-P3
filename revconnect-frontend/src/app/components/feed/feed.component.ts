import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { FeedService } from '../../services/feed.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { PostCardComponent } from '../post-card/post-card.component';

type FeedTab = 'feed' | 'trending' | 'scheduled';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  trendingHashtags: { name: string; count: number }[] = [];
  scheduledPosts: Post[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  activeTab: FeedTab = 'feed';

  // Filters
  filterPostType = '';
  filterUserType = '';
  showFilters = false;

  // Hashtag search
  hashtagSearch = '';
  activeHashtag = '';

  // Create post form
  newPostContent = '';
  postType = 'REGULAR';
  callToAction = '';
  showAdvancedOptions = false;
  isPosting = false;
  hashtagInput = '';

  // Advanced (CREATOR/BUSINESS only)
  scheduledAt = '';
  taggedProductInput = '';
  taggedProductIds: number[] = [];

  constructor(
    private postService: PostService,
    private feedService: FeedService,
    public authService: AuthService
  ) {}

  get currentRole(): string {
    return this.authService.getCurrentUser()?.role || 'USER';
  }

  get isAdvancedUser(): boolean {
    return this.currentRole === 'CREATOR' || this.currentRole === 'BUSINESS';
  }

  ngOnInit(): void {
    this.loadFeed();
    this.loadTrendingHashtags();
    if (this.isAdvancedUser) this.loadScheduledPosts();
  }

  loadFeed(): void {
    this.isLoading = true;
    this.activeHashtag = '';
    const postType = this.filterPostType || undefined;
    // feed-service handles following IDs server-side
    this.feedService.getFeed(postType).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.applyUserTypeFilter();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyUserTypeFilter(): void {
    if (!this.filterUserType) { this.filteredPosts = [...this.posts]; return; }
    const currentUser = this.authService.getCurrentUser();
    if (this.filterUserType === currentUser?.role) {
      this.filteredPosts = this.posts.filter(p => Number(p.authorId) === Number(currentUser?.id));
    } else {
      this.filteredPosts = [...this.posts];
    }
  }

  applyFilters(): void {
    this.isLoading = true;
    this.activeHashtag = '';
    this.loadFeed();
    this.showFilters = false;
  }

  clearFilters(): void {
    this.filterPostType = '';
    this.filterUserType = '';
    this.activeHashtag = '';
    this.loadFeed();
    this.showFilters = false;
  }

  loadTrendingHashtags(): void {
    this.feedService.getTrendingHashtags(10).subscribe({
      next: (tags) => this.trendingHashtags = tags,
      error: () => {}
    });
  }

  loadScheduledPosts(): void {
    this.postService.getScheduledPosts().subscribe({
      next: (posts) => this.scheduledPosts = posts,
      error: () => {}
    });
  }

  searchByHashtag(tag: string): void {
    const clean = tag.startsWith('#') ? tag.substring(1) : tag;
    this.activeHashtag = '#' + clean;
    this.activeTab = 'feed';
    this.isLoading = true;
    this.filterPostType = '';
    this.filterUserType = '';
    this.feedService.searchByHashtag(clean).subscribe({
      next: (posts) => { this.posts = posts; this.filteredPosts = posts; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  setTab(tab: FeedTab): void {
    this.activeTab = tab;
    if (tab === 'trending') this.loadTrendingHashtags();
    if (tab === 'scheduled') this.loadScheduledPosts();
  }

  get displayPosts(): Post[] { return this.filteredPosts; }

  get hasActiveFilters(): boolean {
    return !!(this.filterPostType || this.filterUserType || this.activeHashtag);
  }

  parseTaggedProducts(): void {
    this.taggedProductIds = this.taggedProductInput
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
  }

  createPost(): void {
    if (!this.newPostContent.trim()) {
      this.errorMessage = 'Post content cannot be empty';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    const explicitTags = this.hashtagInput
      .split(/[\s,]+/)
      .map(t => t.trim()).filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : '#' + t);

    this.parseTaggedProducts();
    this.isPosting = true;
    this.errorMessage = '';

    const post: any = {
      content: this.newPostContent,
      authorId: userId,
      postType: this.postType,
      callToAction: this.callToAction || undefined,
      hashtags: explicitTags.length > 0 ? explicitTags : undefined,
      scheduledAt: this.scheduledAt || undefined,
      taggedProductIds: this.taggedProductIds.length > 0 ? this.taggedProductIds : undefined
    };

    this.postService.createPost(post).subscribe({
      next: (created) => {
        if (created.scheduledAt) {
          this.scheduledPosts.unshift(created);
          this.successMessage = 'Post scheduled!';
        } else {
          this.posts.unshift(created);
          this.filteredPosts.unshift(created);
          this.successMessage = 'Post created!';
        }
        this.resetForm();
        this.isPosting = false;
        setTimeout(() => this.successMessage = '', 3000);
        this.loadTrendingHashtags();
      },
      error: (e) => {
        this.errorMessage = e.error?.error || 'Failed to create post';
        this.isPosting = false;
      }
    });
  }

  resetForm(): void {
    this.newPostContent = '';
    this.hashtagInput = '';
    this.postType = 'REGULAR';
    this.callToAction = '';
    this.scheduledAt = '';
    this.taggedProductInput = '';
    this.taggedProductIds = [];
    this.showAdvancedOptions = false;
  }

  onPostDeleted(postId: number): void {
    this.posts = this.posts.filter(p => p.id !== postId);
    this.filteredPosts = this.filteredPosts.filter(p => p.id !== postId);
    this.scheduledPosts = this.scheduledPosts.filter(p => p.id !== postId);
  }

  onPostUpdated(updatedPost: Post): void {
    const update = (arr: Post[]) => {
      const idx = arr.findIndex(p => p.id === updatedPost.id);
      if (idx !== -1) arr[idx] = updatedPost;
    };
    update(this.posts);
    update(this.filteredPosts);
    update(this.scheduledPosts);
  }

  formatScheduled(dt: string): string {
    if (!dt) return '';
    return new Date(dt).toLocaleString();
  }

  get minScheduleDate(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toISOString().slice(0, 16);
  }
}
