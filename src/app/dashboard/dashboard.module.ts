import {NgModule, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AgmCoreModule} from '@agm/core';
import {DashboardComponent} from './dashboard.component';

import {DashboardRoutes} from './dashboard.routing';
import {HttpClient} from '@angular/common/http';
import {DashboardService} from './dashboard.service';
import {AuthService} from '../shared/authentication/auth.service';
import {finalize} from 'rxjs/operators';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v2.0/me';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule,
        AgmCoreModule.forRoot({
            apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
        })
    ],
    declarations: [DashboardComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class DashboardModule {
    profile;

    constructor() {
    }


}
