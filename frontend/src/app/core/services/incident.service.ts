import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Incident, IncidentCreate, IncidentNote, DashboardStats } from '../../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  constructor(private api: ApiService) {}

  getAll(skip = 0, limit = 100): Observable<Incident[]> {
    return this.api.get<Incident[]>(`/incidents/?skip=${skip}&limit=${limit}`);
  }

  getById(id: string): Observable<Incident> {
    return this.api.get<Incident>(`/incidents/${id}`);
  }

  create(data: IncidentCreate): Observable<Incident> {
    return this.api.post<Incident>('/incidents/', data);
  }

  update(id: string, data: Partial<IncidentCreate>): Observable<Incident> {
    return this.api.put<Incident>(`/incidents/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete<any>(`/incidents/${id}`);
  }

  addNote(incidentId: string, noteText: string): Observable<IncidentNote> {
    return this.api.post<IncidentNote>(`/incidents/${incidentId}/notes`, { note_text: noteText });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/analytics/dashboard');
  }

  uploadAttachment(incidentId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postForm<any>(`/uploads/incident/${incidentId}`, formData);
  }
}
