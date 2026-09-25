import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-article.component.html',
  styleUrl: './create-article.component.css'
})
export class CreateArticleComponent {
  form: FormGroup;
  isSubmitting = false;

  categories = [
    'Software', 'Application Development', 'Service Request',
    'Internal Audit Policy', 'Endpoint Security', 'Server Onboarding',
    'Review of IT Asset Storage', 'Risk Register', 'Vendor Evaluation',
    'Hardware', 'Network', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      category: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (c?.errors && c.touched) {
      if (c.errors['required']) return 'Required';
      if (c.errors['maxlength']) return `Max ${c.errors['maxlength'].requiredLength} characters`;
      if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} characters for a useful article`;
    }
    return '';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;
    this.articleService.create(this.form.value).subscribe({
      next: () => {
        this.toast.success('Article published successfully!');
        // Navigate to KB for staff or back for support/admin
        this.router.navigate(['/staff/knowledge']);
      },
      error: (err: any) => {
        this.toast.error(err.error?.detail || 'Failed to publish article');
        this.isSubmitting = false;
      }
    });
  }
}
