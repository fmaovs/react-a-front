import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import {
  LucideAngularModule,
  Search,
  Bell,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  authService = inject(AuthService);

  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly XIcon = X;

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  logout() {
    this.authService.logout();
  }
}
