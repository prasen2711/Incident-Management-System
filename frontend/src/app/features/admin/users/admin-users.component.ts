import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserCreate } from '../../../models/user.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, BadgeComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  showModal = false;
  searchQuery = '';
  roles = ['admin', 'support', 'staff'];
  userForm: FormGroup;

  activeTab: 'users' | 'approvals' = 'users';
  pendingUsers: User[] = [];

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['staff', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_active: [true]
    });
  }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => { 
        this.users = data; 
        this.applyFilter(); 
        
        this.userService.getPending().subscribe({
          next: (pendingData) => {
            this.pendingUsers = pendingData;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    this.filteredUsers = this.users.filter(u =>
      !this.searchQuery ||
      u.full_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onSearch(e: any) { this.searchQuery = e.target.value; this.applyFilter(); }

  setTab(tab: 'users' | 'approvals') { this.activeTab = tab; }

  openModal() { this.userForm.reset({ role: 'staff', is_active: true }); this.showModal = true; }
  closeModal() { this.showModal = false; }

  createUser() {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.userService.create(this.userForm.value as UserCreate).subscribe({
      next: () => {
        this.toast.success('User created successfully');
        this.closeModal();
        this.loadData();
      },
      error: (err: any) => this.toast.error(err.error?.detail || 'Failed to create user')
    });
  }

  approveUser(id: string) {
    this.userService.approve(id).subscribe({
      next: () => {
        this.toast.success('User approved successfully');
        this.loadData();
      },
      error: () => this.toast.error('Failed to approve user')
    });
  }

  rejectUser(id: string) {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason === null) return; // User cancelled

    this.userService.reject(id, reason).subscribe({
      next: () => {
        this.toast.success('User rejected');
        this.loadData();
      },
      error: () => this.toast.error('Failed to reject user')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
