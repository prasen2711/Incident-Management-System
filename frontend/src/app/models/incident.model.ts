export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  category: string;
  creator_id: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentCreate {
  title: string;
  description: string;
  category: string;
  priority: IncidentPriority;
  status?: IncidentStatus;
  assignee_id?: string;
}

export interface IncidentNote {
  id: string;
  incident_id: string;
  user_id: string;
  note_text: string;
  created_at: string;
}

export interface DashboardStats {
  status_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
  total_incidents: number;
}
