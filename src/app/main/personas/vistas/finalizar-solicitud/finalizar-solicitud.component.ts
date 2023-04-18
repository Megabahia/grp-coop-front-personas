import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreConfigService} from '../../../../../@core/services/config.service';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../../../auth/service';
import {CoreMenuService} from '../../../../../@core/components/core-menu/core-menu.service';

@Component({
  selector: 'app-finalizar-solicitud',
  templateUrl: './finalizar-solicitud.component.html',
  styleUrls: ['./finalizar-solicitud.component.scss']
})
export class FinalizarSolicitudComponent implements OnInit {
    public coreConfig: any;
    private _unsubscribeAll: Subject<any>;
    public usuario;

  constructor(
      private _coreConfigService: CoreConfigService,
      private _authenticationService: AuthenticationService,
      private _coreMenuService: CoreMenuService,
      private _router: Router,
  ) {
      this.usuario = this._coreMenuService.grpPersonasUser;
      this._unsubscribeAll = new Subject();
      this._coreConfigService.config = {
          layout: {
              navbar: {
                  hidden: true,
              },
              footer: {
                  hidden: true,
              },
              menu: {
                  hidden: true,
              },
              customizer: false,
              enableLocalStorage: false,
          },
      };
      // localStorage.clear();
  }

  ngOnInit(): void {
      this._unsubscribeAll = new Subject();

      this._coreConfigService.config
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((config) => {
              this.coreConfig = config;
          });
  }

  cerrarSesion() {
      localStorage.clear();
      this._router.navigate(['/']);
  }

}
