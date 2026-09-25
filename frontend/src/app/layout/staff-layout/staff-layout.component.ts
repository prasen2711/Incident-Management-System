import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './staff-layout.component.html',
  styleUrl: './staff-layout.component.css'
})
export class StaffLayoutComponent implements OnInit {
  user: User | null = null;
  sidebarCollapsed = false;

  navItems = [
    { label: 'Dashboard', route: '/service-desk/dashboard' },
    { label: 'Requests', route: '/service-desk/incidents' },
    { label: 'Services', route: '/service-desk/incidents/new', queryParams: { type: 'service' } },
    { label: 'Knowledge', route: '/service-desk/knowledge' },
  ];

  constructor(public authService: AuthService) {}
  ngOnInit() { this.authService.currentUser$.subscribe(u => this.user = u); }
  logout() { this.authService.logout(); }
  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }
  getUserInitials(): string {
    return this.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
  }
}
