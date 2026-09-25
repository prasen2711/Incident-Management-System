import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;background:#0f172a;color:#f8fafc;font-family:Inter,sans-serif;text-align:center;padding:2rem;">
      <div style="font-size:4rem;">🚫</div>
      <h1 style="font-size:2rem;font-weight:700;">Access Denied</h1>
      <p style="color:#94a3b8;max-width:400px;">You don't have permission to access this page. Please contact your administrator.</p>
      <a routerLink="/login" style="padding:0.75rem 1.5rem;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600;margin-top:1rem;">Back to Login</a>
    </div>
  `
})
export class UnauthorizedComponent {}
