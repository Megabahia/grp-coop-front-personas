import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {InicioComponent} from './inicio/inicio.component';
import {SimuladorComponent as SimuladorCreditoAutomotriz} from './simulador/simulador.component';
import {RequisitosComponent} from './requisitos/requisitos.component';

const routes: Routes = [
    {path: '', redirectTo: 'inicio', pathMatch: 'full'},
    {
        path: 'inicio',
        component: InicioComponent,
        data: {animation: 'misc'},
    },
    {
        path: 'simulador',
        component: SimuladorCreditoAutomotriz,
        data: {animation: 'misc'},
    },
    {
        path: 'requisitos',
        component: RequisitosComponent,
        data: {animation: 'misc'},
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SimiladorAutomotrizDigitalRoutingModule {
}
