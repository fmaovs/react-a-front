import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { User, UserCreateRequest, UserUpdateRequest } from '../../../models/types';
import { LucideAngularModule, User as UserIcon, Mail, Shield, Save, X } from 'lucide-angular';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LucideAngularModule
  ],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css'
})
export class UserModalComponent {
  isEditMode = false;
  userData: any = {
    username: '',
    email: '',
    fullName: '',
    password: '',
    roleId: 3, // Default AGENT
    status: 'ACTIVE'
  };

  readonly UserIcon = UserIcon;
  readonly MailIcon = Mail;
  readonly ShieldIcon = Shield;
  readonly SaveIcon = Save;
  readonly XIcon = X;

  roles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'SUPERVISOR' },
    { id: 3, name: 'AGENT' },
    { id: 4, name: 'AUDITOR' }
  ];

  statuses = [
    { id: 'ACTIVE', name: 'Activo' },
    { id: 'INACTIVE', name: 'Inactivo' },
    { id: 'BLOCKED', name: 'Bloqueado' }
  ];

  constructor(
    public dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    if (data?.user) {
      this.isEditMode = true;
      this.userData = {
        fullName: data.user.fullName,
        email: data.user.email,
        status: data.user.status,
        roleId: this.getRoleIdByName(data.user.roleName || '')
      };
    }
  }

  private getRoleIdByName(name: string): number {
    const role = this.roles.find(r => r.name === name);
    return role ? role.id : 3;
  }

  onSubmit() {
    this.dialogRef.close(this.userData);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
