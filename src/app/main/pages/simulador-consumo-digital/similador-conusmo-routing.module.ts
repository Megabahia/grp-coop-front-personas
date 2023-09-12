import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreditRequestComponent} from './credit-request/credit-request.component';
import {SimulatorCrediCompraComponent} from './simulator-credi-compra/simulator-credi-compra.component';
import {CreditRequirementsComponent} from './credit-requirements/credit-requirements.component';

const routes: Routes = [
    {path: '', redirectTo: 'inicio', pathMatch: 'full'},
    {
        path: 'inicio',
        component: CreditRequestComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'simulador',
        component: SimulatorCrediCompraComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'requisitos',
        component: CreditRequirementsComponent,
        data: {animation: 'misc'},
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SimiladorConusmoRoutingModule {
}
