import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    ReactiveFormsModule,
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
  private fb = inject(FormBuilder);

  isEditMode = false;
  initialRoleName = '';
  userForm: FormGroup;

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

    this.isEditMode = !!data?.user;
    if (data?.user) {
      this.initialRoleName = data.user.roleName || '';
    }

    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      username: [{ value: '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', this.isEditMode ? [] : [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(255),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/)
      ]],
      roleId: [null, Validators.required],
      status: ['ACTIVE', Validators.required]
    });

    if (data?.user) {
      this.userForm.patchValue({
        fullName: data.user.fullName,
        email: data.user.email,
        status: data.user.status
      });
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
      this.userForm.patchValue({ roleId: roleId > 0 ? roleId : availableRoles[0].id });
      return;
    }

    const agentRole = availableRoles.find(r => this.normalizeRoleName(r.name) === 'AGENT');
    this.userForm.patchValue({ roleId: agentRole ? agentRole.id : availableRoles[0].id });
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
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.getRawValue());
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasPatternError(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.hasError('pattern') && (control.dirty || control.touched));
  }
}
