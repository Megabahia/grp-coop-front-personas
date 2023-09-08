import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SimiladorMicrocreditosRoutingModule} from './similador-microcreditos-routing.module';
import {CoreCommonModule} from '../../../../@core/common.module';
import {ContentHeaderModule} from '../../../layout/components/content-header/content-header.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
import {AuthenticationModule} from '../authentication/authentication.module';
import {MiscellaneousModule} from '../miscellaneous/miscellaneous.module';
import {SharedModule} from '../../shared/shared.module';
import {CreditRequestComponent} from './credit-request/credit-request.component';
import {CreditRequirementsComponent} from './credit-requirements/credit-requirements.component';
import {SimulatorCrediCompraComponent} from './simulator-credi-compra/simulator-credi-compra.component';


@NgModule({
    declarations: [
        CreditRequestComponent,
        CreditRequirementsComponent,
        SimulatorCrediCompraComponent
    ],
    imports: [
        CommonModule,
        SimiladorMicrocreditosRoutingModule,
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
export class SimiladorMicrocreditosModule {
}
