import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserCreate } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('/users/');
  }

  create(data: UserCreate): Observable<User> {
    return this.api.post<User>('/users/', data);
  }

  update(id: string, data: Partial<UserCreate>): Observable<User> {
    return this.api.put<User>(`/users/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete<any>(`/users/${id}`);
  }

  getPending(): Observable<User[]> {
    return this.api.get<User[]>('/users/pending');
  }

  approve(id: string): Observable<User> {
    return this.api.post<User>(`/users/${id}/approve`, {});
  }

  reject(id: string, reason: string): Observable<User> {
    return this.api.post<User>(`/users/${id}/reject`, { reason });
  }
}
