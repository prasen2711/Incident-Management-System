import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { AuthService } from '../../../core/services/auth.service';
import { Incident } from '../../../models/incident.model';
import { User } from '../../../models/user.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-support-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  templateUrl: './support-dashboard.component.html',
  styleUrl: './support-dashboard.component.css'
})
export class SupportDashboardComponent implements OnInit {
  incidents: Incident[] = [];
  loading = true;
  currentUser: User | null = null;

  constructor(private incidentService: IncidentService, public authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.incidentService.getAll().subscribe({
      next: (data) => { this.incidents = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get assigned() { return this.incidents.filter(i => i.assignee_id === this.currentUser?.id); }
  get pending() { return this.assigned.filter(i => i.status === 'open' || i.status === 'in_progress'); }
  get resolved() { return this.assigned.filter(i => i.status === 'resolved'); }
  get critical() { return this.assigned.filter(i => i.priority === 'critical'); }
  get recent() { return this.incidents.slice(0, 5); }
}
