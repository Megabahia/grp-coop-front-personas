import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreditRequestDigitalComponent} from './credit-request-digital/credit-request-digital.component';
import {SimulatorCrediCompraDigitalComponent} from './simulator-credi-compra-digital/simulator-credi-compra-digital.component';
import {CreditRequirementsDigitalComponent} from './credit-requirements-digital/credit-requirements-digital.component';

const routes: Routes = [
    {path: '', redirectTo: 'inicio', pathMatch: 'full'},
    {
        path: 'inicio',
        component: CreditRequestDigitalComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'simulador',
        component: SimulatorCrediCompraDigitalComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'requisitos',
        component: CreditRequirementsDigitalComponent,
        data: {animation: 'misc'},
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SimiladorMicrocreditosDigitalRoutingModule {
}
