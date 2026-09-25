import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardStats } from '../../../models/incident.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  users: User[] = [];
  loading = true;
  currentUser: User | null = null;
  generatingAnalytics = false;

  statCards: any[] = [];

  constructor(
    private incidentService: IncidentService,
    private userService: UserService,
    public authService: AuthService,
    private reportService: ReportService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.loadData();
  }

  loadData() {
    this.incidentService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildStatCards();
        this.loading = false;
      },
      error: () => {
        this.stats = { status_distribution: {}, priority_distribution: {}, total_incidents: 0 };
        this.buildStatCards();
        this.loading = false;
      }
    });

    this.userService.getAll().subscribe({
      next: (users) => this.users = users,
      error: () => {}
    });
  }

  buildStatCards() {
    const sd = this.stats?.status_distribution || {};
    this.statCards = [
      { label: 'Total Incidents', value: this.stats?.total_incidents || 0, color: 'blue', sub: 'All time' },
      { label: 'Open', value: sd['open'] || 0, color: 'indigo', sub: 'Awaiting assignment' },
      { label: 'In Progress', value: sd['in_progress'] || 0, color: 'amber', sub: 'Being worked on' },
      { label: 'Resolved', value: sd['resolved'] || 0, color: 'green', sub: 'Successfully closed' },
    ];
  }

  generateMonthlyReport() {
    this.generatingAnalytics = true;
    this.reportService.generateMonthlyAnalytics().subscribe({
      next: (report) => {
        this.generatingAnalytics = false;
        this.toast.success('Analytics report generated!');
        this.reportService.downloadReport(report.storage_url, report.file_name);
      },
      error: (err) => {
        this.generatingAnalytics = false;
        this.toast.error(err.error?.detail || 'Failed to generate report');
      }
    });
  }

  getStatusKeys(): string[] { return Object.keys(this.stats?.status_distribution || {}); }
  getPriorityKeys(): string[] { return Object.keys(this.stats?.priority_distribution || {}); }
  getAdminCount(): number { return this.users.filter(u => u.role === 'admin').length; }
  getSupportCount(): number { return this.users.filter(u => u.role === 'support').length; }
  getStaffCount(): number { return this.users.filter(u => u.role === 'staff').length; }
  getActiveCount(): number { return this.users.filter(u => u.is_active).length; }
}
