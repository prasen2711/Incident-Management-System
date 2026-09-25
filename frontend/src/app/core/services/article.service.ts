import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article } from '../../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private baseUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.baseUrl + '/');
  }

  create(article: { title: string; content: string; category: string }): Observable<Article> {
    return this.http.post<Article>(this.baseUrl + '/', article);
  }

  incrementViews(id: string): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/${id}/views`, {});
  }
}
