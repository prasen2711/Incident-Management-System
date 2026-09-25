import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';
import { Incident } from '../../../models/incident.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-my-incidents',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, BadgeComponent],
  templateUrl: './my-incidents.component.html',
  styleUrl: './my-incidents.component.css'
})
export class MyIncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  loading = true;
  generatingReportFor: string | null = null;

  constructor(
    private incidentService: IncidentService,
    private reportService: ReportService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.incidentService.getAll().subscribe({
      next: (data) => { this.incidents = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  generateSummary(incident: Incident) {
    this.generatingReportFor = incident.id;
    this.reportService.generateSummary(incident.id).subscribe({
      next: (report) => {
        this.generatingReportFor = null;
        this.toast.success('Summary generated successfully!');
        this.reportService.downloadReport(report.storage_url, report.file_name);
      },
      error: (err) => {
        this.generatingReportFor = null;
        this.toast.error(err.error?.detail || 'Failed to generate report');
      }
    });
  }
}
