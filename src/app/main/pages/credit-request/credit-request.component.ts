import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreConfigService} from '../../../../@core/services/config.service';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-credit-request',
  templateUrl: './credit-request.component.html',
  styleUrls: ['./credit-request.component.scss']
})
export class CreditRequestComponent implements OnInit, OnDestroy {

    public coreConfig: any;
    // Private
    private _unsubscribeAll: Subject<any>;

  constructor(
    private _router: Router,
      private _coreConfigService: CoreConfigService,
  ) {
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
    // Verificar dominio pagina
    // const ref = document.referrer;
    // const host = document.location.host;
    // if (ref !== 'https://credicompra.com/') {
    //   if (host !== '209.145.61.41:4201') {
    //     this._router.navigate([
    //       `/grp/login`,
    //     ]);
    //     localStorage.clear();
    //     return;
    //   }
    // }
    // localStorage.setItem('pagina', ref);
    localStorage.setItem('pagina', 'https://credicompra.com/');
    localStorage.setItem('simulador', 'ok');
  }

  ngOnInit(): void {
      // Subscribe to config changes
      this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
          this.coreConfig = config;
      });
  }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
