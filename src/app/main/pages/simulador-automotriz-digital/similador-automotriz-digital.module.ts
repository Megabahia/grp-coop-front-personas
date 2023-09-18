import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InicioComponent} from './inicio/inicio.component';
import {SimuladorComponent as SimuladorCreditoAutomotriz} from './simulador/simulador.component';
import {RequisitosComponent} from './requisitos/requisitos.component';
import {SimiladorAutomotrizDigitalRoutingModule} from './similador-automotriz-digital-routing.module';
import {CoreCommonModule} from '../../../../@core/common.module';
import {ContentHeaderModule} from '../../../layout/components/content-header/content-header.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
import {AuthenticationModule} from '../authentication/authentication.module';
import {MiscellaneousModule} from '../miscellaneous/miscellaneous.module';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
    declarations: [
        InicioComponent,
        SimuladorCreditoAutomotriz,
        RequisitosComponent,
    ],
    imports: [
        CommonModule,
        SimiladorAutomotrizDigitalRoutingModule,
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
export class SimiladorAutomotrizDigitalModule {
}
