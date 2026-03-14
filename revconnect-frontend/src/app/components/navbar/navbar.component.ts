import { Component, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());
  unreadCount = 0;

  private pollInterval: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Start polling immediately — also handles cases where auth signal
    // is already true when component initializes
    this.startPolling();
  }

  private startPolling(): void {
    if (this.pollInterval) return; // already polling
    this.loadUnreadCount();
    this.pollInterval = setInterval(() => {
      if (this.isAuthenticated()) {
        this.loadUnreadCount();
      }
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadUnreadCount(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;
    this.notificationService.getUnreadCount(userId).subscribe({
      next: (count) => this.unreadCount = count,
      error: () => {}
    });
  }

  isCreatorOrBusiness(): boolean {
    return this.authService.isCreatorOrBusiness();
  }

  isBusiness(): boolean {
    return this.authService.getUserRole() === 'BUSINESS';
  }

  logout(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.authService.logout();
  }

  navigateToProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }
}