import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { User, RoleOption } from '../../../models/types';
import { UserService } from '../../../features/settings/user.service';
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
export class UserModalComponent implements OnInit {
  private userService = inject(UserService);

  isEditMode = false;
  initialRoleName = '';
  userData: any = {
    username: '',
    email: '',
    fullName: '',
    password: '',
    roleId: null,
    status: 'ACTIVE'
  };

  readonly UserIcon = UserIcon;
  readonly MailIcon = Mail;
  readonly ShieldIcon = Shield;
  readonly SaveIcon = Save;
  readonly XIcon = X;

  roles = signal<RoleOption[]>([]);

  statuses = [
    { id: 'ACTIVE', name: 'Activo' },
    { id: 'INACTIVE', name: 'Inactivo' },
    { id: 'BLOCKED', name: 'Bloqueado' }
  ];

  constructor(
    public dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User; roles?: RoleOption[] }
  ) {
    if (data?.roles?.length) {
      this.roles.set(data.roles);
    }

    if (data?.user) {
      this.isEditMode = true;
      this.initialRoleName = data.user.roleName || '';
      this.userData = {
        fullName: data.user.fullName,
        email: data.user.email,
        status: data.user.status
      };
    }
  }

  ngOnInit() {
    if (!this.roles().length) {
      this.userService.getRoles().subscribe({
        next: roles => {
          this.roles.set(roles);
          this.resolveInitialRoleSelection();
        },
        error: () => {
          this.roles.set([]);
        }
      });
      return;
    }

    this.resolveInitialRoleSelection();
  }

  private resolveInitialRoleSelection() {
    const availableRoles = this.roles();
    if (!availableRoles.length) {
      return;
    }

    if (this.isEditMode) {
      const roleId = this.getRoleIdByName(this.initialRoleName);
      this.userData.roleId = roleId > 0 ? roleId : availableRoles[0].id;
      return;
    }

    const agentRole = availableRoles.find(r => this.normalizeRoleName(r.name) === 'AGENT');
    this.userData.roleId = agentRole ? agentRole.id : availableRoles[0].id;
  }

  private normalizeRoleName(name: string): string {
    if (!name) return '';
    const normalized = name.trim().toUpperCase();
    return normalized === 'AUDITOR' ? 'AUDIT' : normalized;
  }

  private getRoleIdByName(name: string): number {
    const normalizedName = this.normalizeRoleName(name);
    const role = this.roles().find(r => this.normalizeRoleName(r.name) === normalizedName);
    return role ? role.id : 0;
  }

  onSubmit() {
    this.dialogRef.close(this.userData);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
