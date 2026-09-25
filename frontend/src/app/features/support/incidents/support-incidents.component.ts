import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService } from '../../../core/services/report.service';
import { Incident } from '../../../models/incident.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-support-incidents',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, BadgeComponent],
  templateUrl: './support-incidents.component.html',
  styleUrl: './support-incidents.component.css'
})
export class SupportIncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  loading = true;
  showNoteModal = false;
  selectedIncident: Incident | null = null;
  noteForm: FormGroup;
  updateForm: FormGroup;
  statuses = ['open', 'in_progress', 'resolved', 'closed'];
  isGeneratingReport = false;

  constructor(
    private incidentService: IncidentService,
    private toast: ToastService,
    public authService: AuthService,
    private reportService: ReportService,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({ note_text: ['', Validators.required] });
    this.updateForm = this.fb.group({ status: ['', Validators.required] });
  }

  ngOnInit() {
    this.incidentService.getAll().subscribe({
      next: (data) => { this.incidents = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openModal(incident: Incident) {
    this.selectedIncident = incident;
    this.updateForm.patchValue({ status: incident.status });
    this.noteForm.reset();
    this.showNoteModal = true;
  }

  closeModal() { this.showNoteModal = false; this.selectedIncident = null; }

  addNote() {
    if (this.noteForm.invalid || !this.selectedIncident) return;
    this.incidentService.addNote(this.selectedIncident.id, this.noteForm.value.note_text).subscribe({
      next: () => { this.toast.success('Note added'); this.noteForm.reset(); },
      error: () => this.toast.error('Failed to add note')
    });
  }

  updateStatus() {
    if (!this.selectedIncident) return;
    this.incidentService.update(this.selectedIncident.id, this.updateForm.value).subscribe({
      next: () => {
        this.toast.success('Status updated');
        this.selectedIncident!.status = this.updateForm.value.status;
        this.closeModal();
        this.ngOnInit();
      },
      error: () => this.toast.error('Failed to update')
    });
  }

  generatePostmortem(incident: Incident) {
    this.isGeneratingReport = true;
    this.reportService.generatePostmortem(incident.id).subscribe({
      next: (report) => {
        this.isGeneratingReport = false;
        this.toast.success('Report generated successfully!');
        this.reportService.downloadReport(report.storage_url, report.file_name);
      },
      error: (err) => {
        this.isGeneratingReport = false;
        this.toast.error(err.error?.detail || 'Failed to generate report');
      }
    });
  }
}
