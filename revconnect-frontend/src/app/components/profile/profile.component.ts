import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { FollowService } from '../../services/follow.service';
import { ConnectionService } from '../../services/connection.service';
import { CreatorService, CreatorProfile, SocialLink, ExternalLink } from '../../services/creator.service';
import { BusinessService, BusinessProfile, BusinessHours, DAYS_OF_WEEK } from '../../services/business.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PostCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  creatorProfile: CreatorProfile | null = null;
  businessProfile: BusinessProfile | null = null;

  isOwnProfile = false;
  isEditing = false;

  // Base edit form
  editForm: {
    name: string;
    bio: string;
    location: string;
    website: string;
    accountPrivacy: 'PUBLIC' | 'PRIVATE';
  } = { name: '', bio: '', location: '', website: '', accountPrivacy: 'PUBLIC' };

  // Creator edit model (with parsed arrays)
  editCreator: CreatorProfile = {
    parsedSocialLinks: [],
    parsedExternalLinks: []
  };

  // Business edit model (with parsed arrays)
  editBusiness: BusinessProfile = {
    parsedSocialLinks: [],
    parsedBusinessHours: {},
    parsedExternalLinks: []
  };

  // Temp inputs for adding new items
  newSocialLink: SocialLink = { platform: '', url: '' };
  newExternalLink: ExternalLink = { label: '', url: '' };
  newBizSocialLink: SocialLink = { platform: '', url: '' };
  newBizExternalLink: ExternalLink = { label: '', url: '' };

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly socialPlatforms = ['YouTube', 'Instagram', 'TikTok', 'Twitter/X', 'LinkedIn', 'Facebook', 'Twitch', 'Pinterest', 'Other'];

  followersCount = 0;
  followingCount = 0;
  isFollowing = false;
  connectionSent = false;

  activeTab: 'about' | 'posts' = 'about';
  posts: Post[] = [];

  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private followService: FollowService,
    private connectionService: ConnectionService,
    private creatorService: CreatorService,
    private businessService: BusinessService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => this.loadProfile(+params['id']));
  }

  loadProfile(userId: number): void {
    this.userService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.user = data.user;
        this.creatorProfile = data.creatorProfile
          ? CreatorService.parse(data.creatorProfile) : null;
        this.businessProfile = data.businessProfile
          ? BusinessService.parse(data.businessProfile) : null;

        const currentId = this.authService.getCurrentUserId();
        this.isOwnProfile = currentId === userId;

        this.loadFollowStats(userId);
        if (!this.isOwnProfile && currentId) {
          this.followService.checkFollowStatus(currentId, userId).subscribe({
            next: (r) => this.isFollowing = r.isFollowing,
            error: () => {}
          });
        }
      },
      error: () => { this.errorMessage = 'Failed to load profile'; }
    });
  }

  loadFollowStats(userId: number): void {
    this.followService.getFollowers(userId).subscribe({ next: (ids) => this.followersCount = ids.length, error: () => {} });
    this.followService.getFollowing(userId).subscribe({ next: (ids) => this.followingCount = ids.length, error: () => {} });
  }

  startEdit(): void {
    if (!this.user) return;
    this.editForm = {
      name: this.user.name || '',
      bio: this.user.bio || '',
      location: this.user.location || '',
      website: this.user.website || '',
      accountPrivacy: (this.user.accountPrivacy as 'PUBLIC' | 'PRIVATE') || 'PUBLIC'
    };

    if (this.creatorProfile) {
      this.editCreator = {
        ...this.creatorProfile,
        parsedSocialLinks: [...(this.creatorProfile.parsedSocialLinks || [])],
        parsedExternalLinks: [...(this.creatorProfile.parsedExternalLinks || [])]
      };
    } else {
      this.editCreator = { parsedSocialLinks: [], parsedExternalLinks: [] };
    }

    if (this.businessProfile) {
      this.editBusiness = {
        ...this.businessProfile,
        parsedSocialLinks: [...(this.businessProfile.parsedSocialLinks || [])],
        parsedBusinessHours: { ...(this.businessProfile.parsedBusinessHours || {}) },
        parsedExternalLinks: [...(this.businessProfile.parsedExternalLinks || [])]
      };
    } else {
      this.editBusiness = { parsedSocialLinks: [], parsedBusinessHours: {}, parsedExternalLinks: [] };
    }

    this.newSocialLink = { platform: '', url: '' };
    this.newExternalLink = { label: '', url: '' };
    this.newBizSocialLink = { platform: '', url: '' };
    this.newBizExternalLink = { label: '', url: '' };
    this.isEditing = true;
  }

  cancelEdit(): void { this.isEditing = false; }

  // ── Creator social links ──
  addCreatorSocialLink(): void {
    if (!this.newSocialLink.platform || !this.newSocialLink.url) return;
    this.editCreator.parsedSocialLinks = [...(this.editCreator.parsedSocialLinks || []), { ...this.newSocialLink }];
    this.newSocialLink = { platform: '', url: '' };
  }
  removeCreatorSocialLink(i: number): void {
    this.editCreator.parsedSocialLinks = (this.editCreator.parsedSocialLinks || []).filter((_, idx) => idx !== i);
  }

  // ── Creator external links ──
  addCreatorExternalLink(): void {
    if (!this.newExternalLink.label || !this.newExternalLink.url) return;
    this.editCreator.parsedExternalLinks = [...(this.editCreator.parsedExternalLinks || []), { ...this.newExternalLink }];
    this.newExternalLink = { label: '', url: '' };
  }
  removeCreatorExternalLink(i: number): void {
    this.editCreator.parsedExternalLinks = (this.editCreator.parsedExternalLinks || []).filter((_, idx) => idx !== i);
  }

  // ── Business social links ──
  addBizSocialLink(): void {
    if (!this.newBizSocialLink.platform || !this.newBizSocialLink.url) return;
    this.editBusiness.parsedSocialLinks = [...(this.editBusiness.parsedSocialLinks || []), { ...this.newBizSocialLink }];
    this.newBizSocialLink = { platform: '', url: '' };
  }
  removeBizSocialLink(i: number): void {
    this.editBusiness.parsedSocialLinks = (this.editBusiness.parsedSocialLinks || []).filter((_, idx) => idx !== i);
  }

  // ── Business external links ──
  addBizExternalLink(): void {
    if (!this.newBizExternalLink.label || !this.newBizExternalLink.url) return;
    this.editBusiness.parsedExternalLinks = [...(this.editBusiness.parsedExternalLinks || []), { ...this.newBizExternalLink }];
    this.newBizExternalLink = { label: '', url: '' };
  }
  removeBizExternalLink(i: number): void {
    this.editBusiness.parsedExternalLinks = (this.editBusiness.parsedExternalLinks || []).filter((_, idx) => idx !== i);
  }

  // ── Business hours ──
  getBusinessHour(day: string): string {
    return (this.editBusiness.parsedBusinessHours || {})[day] || '';
  }
  setBusinessHour(day: string, value: string): void {
    if (!this.editBusiness.parsedBusinessHours) this.editBusiness.parsedBusinessHours = {};
    this.editBusiness.parsedBusinessHours[day] = value;
  }

  // ── Save ──
  saveProfile(): void {
    if (!this.user?.id) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.updateUser(this.user.id, this.editForm).subscribe({
      next: (updated) => {
        this.user = updated;
        const stored = localStorage.getItem('user');
        if (stored) localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...updated }));

        if (this.user!.role === 'CREATOR') {
          this.creatorService.saveProfile(this.user!.id!, this.editCreator).subscribe({
            next: (cp) => { this.creatorProfile = CreatorService.parse(cp); this.finishSave(); },
            error: (e) => { this.errorMessage = e.error?.error || 'Failed to save creator profile'; this.isLoading = false; }
          });
        } else if (this.user!.role === 'BUSINESS') {
          this.businessService.saveProfile(this.user!.id!, this.editBusiness).subscribe({
            next: (bp) => { this.businessProfile = BusinessService.parse(bp); this.finishSave(); },
            error: (e) => { this.errorMessage = e.error?.error || 'Failed to save business profile'; this.isLoading = false; }
          });
        } else {
          this.finishSave();
        }
      },
      error: (e) => { this.errorMessage = e.error?.error || 'Failed to update profile'; this.isLoading = false; }
    });
  }

  private finishSave(): void {
    this.isEditing = false;
    this.isLoading = false;
    this.successMessage = 'Profile updated!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  // ── Social actions ──
  followUser(): void {
    const currentId = this.authService.getCurrentUserId();
    if (!currentId || !this.user?.id) return;
    this.followService.followUser(currentId, this.user.id).subscribe({
      next: () => { this.isFollowing = true; this.followersCount++; },
      error: (e) => { this.errorMessage = e.error?.message || 'Failed to follow'; }
    });
  }

  unfollowUser(): void {
    const currentId = this.authService.getCurrentUserId();
    if (!currentId || !this.user?.id) return;
    this.followService.unfollowUser(currentId, this.user.id).subscribe({
      next: () => { this.isFollowing = false; this.followersCount--; },
      error: (e) => { this.errorMessage = e.error?.message || 'Failed to unfollow'; }
    });
  }

  sendConnectionRequest(): void {
    const currentId = this.authService.getCurrentUserId();
    if (!currentId || !this.user?.id) return;
    this.connectionService.sendConnectionRequest(currentId, this.user.id).subscribe({
      next: () => { this.connectionSent = true; this.successMessage = 'Connection request sent!'; setTimeout(() => this.successMessage = '', 3000); },
      error: (e) => { this.errorMessage = e.error?.message || 'Failed to send request'; }
    });
  }

  // ── Tabs ──
  switchTab(tab: 'about' | 'posts'): void {
    this.activeTab = tab;
    if (tab === 'posts' && this.posts.length === 0 && this.user?.id) {
      this.loadUserPosts(this.user.id);
    }
  }

  loadUserPosts(userId: number): void {
    this.postService.getPostsByUser(userId).subscribe({
      next: (posts) => this.posts = posts,
      error: () => {}
    });
  }

  onPostDeleted(postId: number): void {
    this.posts = this.posts.filter(p => p.id !== postId);
  }

  onPostUpdated(updated: Post): void {
    const idx = this.posts.findIndex(p => p.id === updated.id);
    if (idx !== -1) this.posts[idx] = updated;
  }

  // ── Helpers ──
  parsedSocialLinks(jsonStr?: string): SocialLink[] {
    if (!jsonStr) return [];
    try { return JSON.parse(jsonStr); } catch { return []; }
  }

  parsedExternalLinks(jsonStr?: string): ExternalLink[] {
    if (!jsonStr) return [];
    try { return JSON.parse(jsonStr); } catch { return []; }
  }

  parsedBusinessHoursEntries(jsonStr?: string): { day: string; hours: string }[] {
    if (!jsonStr) return [];
    try {
      const obj = JSON.parse(jsonStr);
      return DAYS_OF_WEEK.filter(d => obj[d]).map(d => ({ day: d, hours: obj[d] }));
    } catch { return []; }
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
