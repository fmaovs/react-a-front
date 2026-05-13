import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { LoginComponent } from './features/login/login';
import { ChangePasswordComponent } from './features/change-password/change-password';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { HeaderComponent } from './layout/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent, ChangePasswordComponent, SidebarComponent, HeaderComponent],
  template: `
    @if (!authService.user()) {
      <app-login></app-login>
    } @else if (authService.mustChangePassword()) {
      <app-change-password></app-change-password>
    } @else {
      <div class="app-container">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <app-header></app-header>
          <div class="content-scroll">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    }
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      background-color: var(--brand-bg);
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .content-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
}
