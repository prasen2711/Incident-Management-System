import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-support-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './support-layout.component.html',
  styleUrl: './support-layout.component.css'
})
export class SupportLayoutComponent implements OnInit {
  user: User | null = null;
  sidebarCollapsed = false;

  navItems = [
    { label: 'Dashboard', route: '/support/dashboard' },
    { label: 'Incidents', route: '/support/incidents' },
    { label: 'Write Article', route: '/support/articles/new' },
  ];

  constructor(public authService: AuthService) {}
  ngOnInit() { this.authService.currentUser$.subscribe(u => this.user = u); }
  logout() { this.authService.logout(); }
  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }
  getUserInitials(): string {
    return this.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SP';
  }
}
