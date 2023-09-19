import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SimiladorMicrocreditosDigitalRoutingModule} from './similador-microcreditos-digital-routing.module';
import {CoreCommonModule} from '../../../../@core/common.module';
import {ContentHeaderModule} from '../../../layout/components/content-header/content-header.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
import {AuthenticationModule} from '../authentication/authentication.module';
import {MiscellaneousModule} from '../miscellaneous/miscellaneous.module';
import {SharedModule} from '../../shared/shared.module';
import {CreditRequestDigitalComponent} from './credit-request-digital/credit-request-digital.component';
import {CreditRequirementsDigitalComponent} from './credit-requirements-digital/credit-requirements-digital.component';
import {SimulatorCrediCompraDigitalComponent} from './simulator-credi-compra-digital/simulator-credi-compra-digital.component';

@NgModule({
    declarations: [
        CreditRequestDigitalComponent,
        CreditRequirementsDigitalComponent,
        SimulatorCrediCompraDigitalComponent
    ],
    imports: [
        CommonModule,
        SimiladorMicrocreditosDigitalRoutingModule,
        CoreCommonModule,
        ContentHeaderModule,
        NgbModule,
        NgSelectModule,
        FormsModule,
        AuthenticationModule,
        MiscellaneousModule,
        SharedModule,
    ]
})
export class SimiladorMicrocreditosDigitalModule {
}
