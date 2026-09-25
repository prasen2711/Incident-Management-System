import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;

  roles = [
    { value: 'staff', label: 'Staff Member', desc: 'Raise and track incidents' },
    { value: 'support', label: 'Support Agent', desc: 'Manage and resolve tickets' }
  ];

  expertiseOptions = [
    'Software', 'Application Development', 'Service Request', 
    'Internal Audit Policy', 'Endpoint Security', 'Server Onboarding', 
    'Review of IT Asset Storage', 'Risk Register', 'Vendor Evaluation', 
    'Hardware', 'Network', 'Other'
  ];

  get isOtherSelected(): boolean {
    const selected = this.signupForm.get('area_of_expertise')?.value || [];
    return selected.includes('Other');
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.signupForm = this.fb.group({
      role: ['staff', Validators.required],
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: [''],
      employee_id: [''],
      phone_number: [''],
      area_of_expertise: [[]],
      other_expertise: ['']
    });

    this.signupForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'support') {
        this.signupForm.get('area_of_expertise')?.setValidators([Validators.required]);
      } else {
        this.signupForm.get('area_of_expertise')?.clearValidators();
      }
      this.signupForm.get('area_of_expertise')?.updateValueAndValidity();
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  onExpertiseChange(event: any) {
    const value = event.target.value;
    const checked = event.target.checked;
    const currentValues = this.signupForm.get('area_of_expertise')?.value || [];
    
    if (checked) {
      currentValues.push(value);
    } else {
      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1);
      }
    }
    this.signupForm.get('area_of_expertise')?.setValue(currentValues);
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formValue = { ...this.signupForm.value };
    
    if (formValue.role === 'support') {
      let finalExpertise = [...formValue.area_of_expertise];
      if (finalExpertise.includes('Other') && formValue.other_expertise) {
        finalExpertise = finalExpertise.filter(e => e !== 'Other');
        finalExpertise.push(formValue.other_expertise);
      }
      formValue.area_of_expertise = finalExpertise.join(', ');
    } else {
      formValue.area_of_expertise = null;
    }
    delete formValue.other_expertise;

    this.authService.register(formValue).subscribe({
      next: (user) => {
        if (user.role === 'support') {
          this.toast.success('Registration successful! Awaiting admin approval.');
          this.router.navigate(['/login']);
        } else {
          this.toast.success('Registration successful! Please login.');
          this.router.navigate(['/login']);
        }
      },
      error: (err: any) => {
        this.toast.error(err.error?.detail || 'Registration failed. Please try again.');
        this.isLoading = false;
      }
    });
  }

  getFieldError(field: string): string {
    const control = this.signupForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Enter a valid email address';
      if (control.errors['minlength']) return 'Password must be at least 6 characters';
    }
    return '';
  }
}
