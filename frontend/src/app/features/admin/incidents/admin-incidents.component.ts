import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Incident } from '../../../models/incident.model';
import { User } from '../../../models/user.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-admin-incidents',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, ReactiveFormsModule, BadgeComponent],
  templateUrl: './admin-incidents.component.html',
  styleUrl: './admin-incidents.component.css'
})
export class AdminIncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  supportUsers: User[] = [];
  loading = true;
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  showAssignModal = false;
  selectedIncident: Incident | null = null;
  assignForm: FormGroup;

  statuses = ['open', 'in_progress', 'resolved', 'closed'];
  priorities = ['low', 'medium', 'high', 'critical'];

  constructor(
    private incidentService: IncidentService,
    private userService: UserService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.assignForm = this.fb.group({
      assignee_id: ['']
    });
  }

  ngOnInit() {
    this.loadIncidents();
    this.userService.getAll().subscribe({
      next: (users) => this.supportUsers = users.filter(u => u.role === 'support'),
      error: () => {}
    });
  }

  loadIncidents() {
    this.loading = true;
    this.incidentService.getAll().subscribe({
      next: (data) => {
        this.incidents = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase();
    this.filteredIncidents = this.incidents.filter(i => {
      const matchSearch = !q ||
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q) ||
        i.priority.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || i.status === this.filterStatus;
      const matchPriority = !this.filterPriority || i.priority === this.filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }

  onSearch(e: any) { this.searchQuery = e.target.value; this.applyFilters(); }
  onStatusFilter(e: any) { this.filterStatus = e.target.value; this.applyFilters(); }
  onPriorityFilter(e: any) { this.filterPriority = e.target.value; this.applyFilters(); }

  openAssignModal(incident: Incident) {
    this.selectedIncident = incident;
    this.assignForm.patchValue({ assignee_id: incident.assignee_id || '' });
    this.showAssignModal = true;
  }

  closeModal() { this.showAssignModal = false; this.selectedIncident = null; }

  saveAssignment() {
    if (!this.selectedIncident) return;
    this.incidentService.update(this.selectedIncident.id, this.assignForm.value).subscribe({
      next: () => {
        this.toast.success('Incident updated successfully');
        this.closeModal();
        this.loadIncidents();
      },
      error: () => this.toast.error('Failed to update incident')
    });
  }
}
