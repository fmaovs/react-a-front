import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'integration',
    loadComponent: () => import('./features/integration/integration').then(m => m.IntegrationComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics').then(m => m.AnalyticsComponent)
  },
  {
    path: 'contact-rules',
    loadComponent: () => import('./features/contact-rules/contact-rules').then(m => m.ContactRulesComponent)
  },
  {
    path: 'cases',
    loadComponent: () => import('./features/cases/cases').then(m => m.CasesComponent)
  },
  {
    path: 'recaudo',
    loadComponent: () => import('./features/recaudo/recaudo').then(m => m.RecaudoComponent)
  },
  {
    path: 'reporting',
    loadComponent: () => import('./features/reporting/reporting').then(m => m.ReportingComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent)
  },
];
