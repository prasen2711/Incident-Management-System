import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-incident',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-incident.component.html',
  styleUrl: './create-incident.component.css'
})
export class CreateIncidentComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  categories = [
    'Software',
    'Application Development',
    'Service Request',
    'Internal Audit Policy',
    'Endpoint Security',
    'Server Onboarding',
    'Review of IT Asset Storage',
    'Risk Register',
    'Vendor Evaluation',
    'Hardware',
    'Network',
    'Other'
  ];
  priorities = ['low', 'medium', 'high', 'critical'];

  constructor(
    private fb: FormBuilder,
    private incidentService: IncidentService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'service') {
        this.form.patchValue({ category: 'Service Request' });
      }
    });
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (c?.errors && c.touched) {
      if (c.errors['required']) return 'Required';
      if (c.errors['maxlength']) return `Max ${c.errors['maxlength'].requiredLength} characters`;
      if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  selectedFile: File | null = null;

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.incidentService.create(this.form.value).subscribe({
      next: (incident) => {
        if (this.selectedFile) {
          this.incidentService.uploadAttachment(incident.id, this.selectedFile).subscribe({
            next: () => {
              this.toast.success('Incident and attachment uploaded successfully!');
              this.router.navigate(['/staff/incidents']);
            },
            error: () => {
              this.toast.error('Incident created, but failed to upload attachment');
              this.router.navigate(['/staff/incidents']);
            }
          });
        } else {
          this.toast.success('Incident raised successfully!');
          this.router.navigate(['/staff/incidents']);
        }
      },
      error: (err: any) => {
        this.toast.error(err.error?.detail || 'Failed to create incident');
        this.isSubmitting = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('File size must be less than 5MB');
        event.target.value = null;
        return;
      }
      this.selectedFile = file;
    }
  }
}
