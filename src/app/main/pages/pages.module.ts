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
import {
    PreApprovedCreditConsumerDigtalComponent
} from './pre-approved-credit-consumer-digital/pre-approved-credit-consumer-digtal.component';
import {ConfirmacionGaranteComponent} from './confirmacion-garante/confirmacion-garante.component';
import {
    SimulatorCrediCompraDigitalComponent
} from './simulador-microcreditos-digitales/simulator-credi-compra-digital/simulator-credi-compra-digital.component';
import {
    CreditRequirementsDigitalComponent
} from './simulador-microcreditos-digitales/credit-requirements-digital/credit-requirements-digital.component';
import {CreditRequestDigitalComponent} from './simulador-microcreditos-digitales/credit-request-digital/credit-request-digital.component';
import {
    PreApprovedCreditConsumoAutomotrizDigitalBpComponent
} from './pre-approved-credit-consumo-automotriz-digital-bp/pre-approved-credit-consumo-automotriz-digital-bp.component';
import {
    PreApprovedCreditLineDigitalComponent
} from './pre-approved-credit-consumer-line-digital/pre-approved-credit-line-digital.component';

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
        path: 'credito-consumo-digital',
        loadChildren: () =>
            import('./simulador-consumo-digital/similador-conusmo.module').then((m) => m.SimiladorConusmoModule)
    },
    {
        path: 'microcreditos',
        loadChildren: () =>
            import('./simulador-microcreditos/similador-microcreditos.module').then((m) => m.SimiladorMicrocreditosModule)
    },
    {
        path: 'microcreditos-digitales',
        loadChildren: () =>
            import('./simulador-microcreditos-digitales/similador-microcreditos-digital.module').then((m) => m.SimiladorMicrocreditosDigitalModule)
    },
    {
        path: 'preApprovedCreditLine',
        component: PreApprovedCreditLineComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'preApprovedCreditLineDigital',
        component: PreApprovedCreditLineDigitalComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'preApprovedCreditDigital',
        component: PreApprovedCreditConsumerDigtalComponent,
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
    {
        path: 'confirmacion-garante/:id',
        component: ConfirmacionGaranteComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'credito-automotriz-digital',
        loadChildren: () =>
            import('./simulador-automotriz-digital/similador-automotriz-digital.module').then((m) => m.SimiladorAutomotrizDigitalModule)
    },
    {
        path: 'preApprovedAutomotrizDigital',
        component: PreApprovedCreditConsumoAutomotrizDigitalBpComponent,
        data: {animation: 'misc'},
    },
];

@NgModule({
    declarations: [
        PagesViewsComponent,
        MensajeProductosComponent,
        MensajeProductosFreeComponent,
        PreApprovedCreditLineComponent,
        PreApprovedCreditLineDigitalComponent,
        PreApprovedCreditConsumerDigtalComponent,
        ApprovedEndConsumerComponent,
        CreditRequestBpComponent,
        SimulatorCrediCompraBpComponent,
        CreditRequirementsBpComponent,
        ApprovedEndConsumerBpComponent,
        PreApprovedCreditConsumerBpComponent,
        ConfirmacionGaranteComponent,
        PreApprovedCreditConsumoAutomotrizDigitalBpComponent,
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
