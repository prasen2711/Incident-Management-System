import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  user: User | null = null;
  sidebarCollapsed = false;

  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Incidents', route: '/admin/incidents' },
    { label: 'Users', route: '/admin/users' },
    { label: 'Analytics', route: '/admin/analytics' },
    { label: 'Write Article', route: '/admin/articles/new' },
  ];

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  logout() { this.authService.logout(); }
  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }
  getUserInitials(): string {
    return this.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
  }
}
