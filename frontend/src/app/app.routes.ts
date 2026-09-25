import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'incidents', loadComponent: () => import('./features/admin/incidents/admin-incidents.component').then(m => m.AdminIncidentsComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'analytics', loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },
      { path: 'articles/new', loadComponent: () => import('./features/shared/create-article/create-article.component').then(m => m.CreateArticleComponent) },
    ]
  },
  {
    path: 'support',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['support', 'admin'] },
    loadComponent: () => import('./layout/support-layout/support-layout.component').then(m => m.SupportLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/support/dashboard/support-dashboard.component').then(m => m.SupportDashboardComponent) },
      { path: 'incidents', loadComponent: () => import('./features/support/incidents/support-incidents.component').then(m => m.SupportIncidentsComponent) },
      { path: 'articles/new', loadComponent: () => import('./features/shared/create-article/create-article.component').then(m => m.CreateArticleComponent) },
    ]
  },
  {
    path: 'service-desk',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'support', 'admin'] },
    loadComponent: () => import('./layout/staff-layout/staff-layout.component').then(m => m.StaffLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/staff/dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent) },
      { path: 'incidents', loadComponent: () => import('./features/staff/my-incidents/my-incidents.component').then(m => m.MyIncidentsComponent) },
      { path: 'incidents/new', loadComponent: () => import('./features/staff/create-incident/create-incident.component').then(m => m.CreateIncidentComponent) },
      { path: 'knowledge', loadComponent: () => import('./features/staff/knowledge/knowledge-base.component').then(m => m.KnowledgeBaseComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
