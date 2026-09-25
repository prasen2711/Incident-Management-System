import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-incident-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './incident-create.component.html',
  styleUrl: './incident-create.component.css'
})
export class IncidentCreateComponent {
  incidentForm: FormGroup;
  isSubmitting: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.incidentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.incidentForm.invalid) return;

    this.isSubmitting = true;
    this.error = '';

    this.apiService.post('/incidents/', this.incidentForm.value).subscribe({
      next: () => {
        this.router.navigate(['/incidents']);
      },
      error: (err: any) => {
        this.error = err.error?.detail || 'Failed to create incident';
        this.isSubmitting = false;
      }
    });
  }
}
