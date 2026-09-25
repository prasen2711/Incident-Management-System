export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'support' | 'staff';
  is_active: boolean;
  created_at: string;
  department?: string;
  employee_id?: string;
  phone_number?: string;
  area_of_expertise?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  role: 'admin' | 'support' | 'staff';
  password: string;
  is_active: boolean;
  department?: string;
  employee_id?: string;
  phone_number?: string;
  area_of_expertise?: string;
}

export interface UserRegister {
  email: string;
  full_name: string;
  password: string;
  role: 'support' | 'staff';
  department?: string;
  employee_id?: string;
  phone_number?: string;
  area_of_expertise?: string;
}
