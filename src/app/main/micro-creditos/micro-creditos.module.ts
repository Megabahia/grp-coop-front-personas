import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreCommonModule} from '@core/common.module';
import {RouterModule} from '@angular/router';
import {AuthGuard} from '../../auth/helpers/auth.guards';
import {CreditosPreaprobadosComponent} from './creditos-preaprobados/creditos-preaprobados.component';
import {Role} from '../../auth/models';

const routes = [
  {path: '', redirectTo: 'preaprobados', pathMatch: 'full'},
  {
    path: 'preaprobados',
    component: CreditosPreaprobadosComponent,
    data: {roles: [Role.SuperMonedas], activacion: [8]},
    canActivate: [AuthGuard],
    // data: { animation: 'auth' }
  },
];

@NgModule({
  declarations: [
    CreditosPreaprobadosComponent
  ],
  imports: [
    CoreCommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    CreditosPreaprobadosComponent
  ]
})
export class MicroCreditosModule {
}
