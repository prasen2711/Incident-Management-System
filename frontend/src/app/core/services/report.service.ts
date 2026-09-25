import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Report {
  id: string;
  incident_id: string | null;
  report_type: string;
  generated_by: string;
  storage_url: string;
  file_name: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generatePostmortem(incidentId: string): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports/incident/${incidentId}/postmortem`, {});
  }

  generateSummary(incidentId: string): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports/incident/${incidentId}/summary`, {});
  }

  generateMonthlyAnalytics(): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports/analytics/monthly`, {});
  }

  listReports(incidentId: string): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/reports/incident/${incidentId}`);
  }

  downloadReport(url: string, fileName: string) {
    // Open the Supabase URL in a new tab — browser handles PDF download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    a.click();
  }
}
