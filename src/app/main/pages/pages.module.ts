import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';

import {CoreCommonModule} from '@core/common.module';
import {ContentHeaderModule} from 'app/layout/components/content-header/content-header.module';

import {AuthenticationModule} from './authentication/authentication.module';
import {MiscellaneousModule} from './miscellaneous/miscellaneous.module';
import {PagesViewsComponent} from './pages-views/pages-views.component';
import {RouterModule, Routes} from '@angular/router';
import {MensajeProductosComponent} from './mensaje-productos/mensaje-productos.component';
import {MensajeProductosFreeComponent} from './mensaje-productos-free/mensaje-productos-free.component';
import {CreditRequestComponent} from './credit-request/credit-request.component';
import {SimulatorCrediCompraComponent} from './simulator-credi-compra/simulator-credi-compra.component';
import {CreditRequirementsComponent} from './credit-requirements/credit-requirements.component';
import {PreApprovedCreditLineComponent} from './pre-approved-credit-consumer/pre-approved-credit-line.component';
import {ApprovedEndConsumerComponent} from './approved-end-consumer/approved-end-consumer.component';

// routing
const routes: Routes = [
    {
        path: 'pages-views',
        component: PagesViewsComponent,
        data: {roles: 'SuperMonedas', activacion: [8]},
    },
    {
        path: 'mensajes-productos/:_id',
        component: MensajeProductosComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'mensajes-productos-free',
        component: MensajeProductosFreeComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'solicitud-credito',
        component: CreditRequestComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'simulador-de-credito',
        component: SimulatorCrediCompraComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'requisitos-de-credito',
        component: CreditRequirementsComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'preApprovedCreditLine',
        component: PreApprovedCreditLineComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'preApprovedEndConsumer',
        component: ApprovedEndConsumerComponent,
        data: {animation: 'misc'},
    },
];

@NgModule({
    declarations: [
        PagesViewsComponent,
        MensajeProductosComponent,
        MensajeProductosFreeComponent,
        CreditRequestComponent,
        SimulatorCrediCompraComponent,
        CreditRequirementsComponent,
        PreApprovedCreditLineComponent,
        ApprovedEndConsumerComponent,
    ],

    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        CoreCommonModule,
        ContentHeaderModule,
        NgbModule,
        NgSelectModule,
        FormsModule,
        AuthenticationModule,
        MiscellaneousModule,
    ],

    providers: [],
})
export class PagesModule {
}
