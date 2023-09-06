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
import {CreditRequestBpComponent} from './credit-request-bp/credit-request-bp.component';
import {SimulatorCrediCompraBpComponent} from './simulator-credi-compra-bp/simulator-credi-compra-bp.component';
import {CreditRequirementsBpComponent} from './credit-requirements-bp/credit-requirements-bp.component';
import {SharedModule} from '../shared/shared.module';
import {
    PreApprovedCreditConsumerBpComponent
} from './pre-approved-credit-consumer-bp/pre-approved-credit-consumer-bp.component';
import {ApprovedEndConsumerBpComponent} from './approved-end-consumer-bp/approved-end-consumer-bp.component';

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
    {
        path: 'solicitud-credito-bp',
        component: CreditRequestBpComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'simulador-de-credito-bp',
        component: SimulatorCrediCompraBpComponent,
        data: {animation: 'misc', activacion: [8]},
    },

    {
        path: 'requisitos-de-credito-bp',
        component: CreditRequirementsBpComponent,
        data: {animation: 'misc', activacion: [8]},
    },
    {
        path: 'preApprovedCreditConsumer',
        component: PreApprovedCreditConsumerBpComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'preApprovedEndConsumer-bp',
        component: ApprovedEndConsumerBpComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'credito-automotriz',
        loadChildren: () =>
            import('./simulador-automotriz/similador-automotriz.module').then((m) => m.SimiladorAutomotrizModule)
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
        CreditRequestBpComponent,
        SimulatorCrediCompraBpComponent,
        CreditRequirementsBpComponent,
        ApprovedEndConsumerBpComponent,
        PreApprovedCreditConsumerBpComponent,
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
        SharedModule,
    ],

    providers: [],
})
export class PagesModule {
}
