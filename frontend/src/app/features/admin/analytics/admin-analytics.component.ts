import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../../core/services/incident.service';
import { DashboardStats } from '../../../models/incident.model';

declare const Chart: any;

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css'
})
export class AdminAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChartRef!: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  loading = true;
  private charts: any[] = [];

  constructor(private incidentService: IncidentService) {}

  ngOnInit() {
    this.incidentService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit() {}

  renderCharts() {
    if (!this.stats) return;

    const isDynamic = typeof window !== 'undefined' && (window as any).Chart;
    import('chart.js/auto').then(({ default: ChartLib }) => {
      this.charts.forEach(c => c.destroy());
      this.charts = [];

      if (this.statusChartRef?.nativeElement) {
        const statusCtx = this.statusChartRef.nativeElement.getContext('2d');
        if (statusCtx) {
          this.charts.push(new ChartLib(statusCtx, {
            type: 'doughnut',
            data: {
              labels: Object.keys(this.stats!.status_distribution).map(k => k.replace('_', ' ')),
              datasets: [{
                data: Object.values(this.stats!.status_distribution),
                backgroundColor: ['rgba(37,99,235,0.8)', 'rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)', 'rgba(100,116,139,0.8)'],
                borderColor: 'rgba(30,41,59,0.8)',
                borderWidth: 2,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#94a3b8', padding: 16, font: { size: 12 } }
                }
              },
              cutout: '65%'
            }
          }));
        }
      }

      if (this.priorityChartRef?.nativeElement) {
        const prioCtx = this.priorityChartRef.nativeElement.getContext('2d');
        if (prioCtx) {
          this.charts.push(new ChartLib(prioCtx, {
            type: 'bar',
            data: {
              labels: Object.keys(this.stats!.priority_distribution).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
              datasets: [{
                label: 'Incidents',
                data: Object.values(this.stats!.priority_distribution),
                backgroundColor: ['rgba(148,163,184,0.7)', 'rgba(37,99,235,0.7)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)'],
                borderRadius: 6,
                borderSkipped: false,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', stepSize: 1 } }
              }
            }
          }));
        }
      }
    });
  }

  getStatusKeys(): string[] { return Object.keys(this.stats?.status_distribution || {}); }
  getPriorityKeys(): string[] { return Object.keys(this.stats?.priority_distribution || {}); }
}
