import {Routes} from '@angular/router';

import {DashboardComponent} from './dashboard.component';
import {AuthGuard} from '../shared/authentication/auth.guard';

export const DashboardRoutes: Routes = [{

    path: '',
    children: [{
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    }]
}];

