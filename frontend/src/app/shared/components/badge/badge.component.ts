import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge badge-{{ status }}">{{ label }}</span>`,
  styles: [`
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
      letter-spacing: 0.02em;
    }
    .badge-open { background: rgba(37,99,235,0.2); color: #60a5fa; }
    .badge-in_progress { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .badge-resolved { background: rgba(16,185,129,0.2); color: #34d399; }
    .badge-closed { background: rgba(148,163,184,0.2); color: #94a3b8; }
    .badge-low { background: rgba(148,163,184,0.2); color: #94a3b8; }
    .badge-medium { background: rgba(37,99,235,0.2); color: #60a5fa; }
    .badge-high { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .badge-critical { background: rgba(239,68,68,0.2); color: #f87171; }
    .badge-admin { background: rgba(168,85,247,0.2); color: #c084fc; }
    .badge-support { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .badge-staff { background: rgba(37,99,235,0.2); color: #60a5fa; }
  `]
})
export class BadgeComponent {
  @Input() status: string = '';
  @Input() label: string = '';
}
