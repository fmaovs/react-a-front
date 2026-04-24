import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { IntegrationComponent } from './features/integration/integration';
import { AnalyticsComponent } from './features/analytics/analytics';
import { PoliciesComponent } from './features/policies/policies';
import { OrchestrationComponent } from './features/orchestration/orchestration';
import { CasesComponent } from './features/cases/cases';
import { RecaudoComponent } from './features/recaudo/recaudo';
import { ReportingComponent } from './features/reporting/reporting';
import { SettingsComponent } from './features/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'integration', component: IntegrationComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'policies', component: PoliciesComponent },
  { path: 'orchestration', component: OrchestrationComponent },
  { path: 'cases', component: CasesComponent },
  { path: 'recaudo', component: RecaudoComponent },
  { path: 'reporting', component: ReportingComponent },
  { path: 'settings', component: SettingsComponent },
];
