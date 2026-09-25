import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast toast-{{ toast.type }}"
        (click)="toastService.dismiss(toast.id)"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      min-width: 280px;
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .toast-success { background: rgba(16,185,129,0.2); color: #34d399; border-color: rgba(52,211,153,0.3); }
    .toast-error { background: rgba(239,68,68,0.2); color: #f87171; border-color: rgba(248,113,113,0.3); }
    .toast-warning { background: rgba(245,158,11,0.2); color: #fbbf24; border-color: rgba(251,191,36,0.3); }
    .toast-info { background: rgba(37,99,235,0.2); color: #60a5fa; border-color: rgba(96,165,250,0.3); }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(public toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return icons[type] || 'ℹ';
  }
}
