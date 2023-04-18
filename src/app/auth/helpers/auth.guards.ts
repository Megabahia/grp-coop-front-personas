import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import {AuthenticationService} from 'app/auth/service';
import moment from 'moment';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    /**
     *
     * @param {Router} _router
     * @param {AuthenticationService} _authenticationService
     */
    constructor(private _router: Router, private _authenticationService: AuthenticationService) {
    }

    // canActivate
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const grpPersonasUser = this._authenticationService.grpPersonasUserValue;
        let activacion = false;
        if (grpPersonasUser) {
            // check if route is restricted by role
            let rolEncontrado = false;
            let expiracionToken = Number(grpPersonasUser.tokenExpiracion);
            let fechaActual = Date.now();
            if (expiracionToken - fechaActual <= 0) {
                this._authenticationService.logout();
            }


            // console.log(fechaActual.diff());

            grpPersonasUser.roles.map(rol => {
                if (route.data.roles && route.data.roles.indexOf(rol.nombre) != -1) {
                    rolEncontrado = true;
                }
            });


            if (route.data.activacion) {
                if (route.data.activacion.indexOf(Number(grpPersonasUser.estado)) != -1) {
                    activacion = true;
                }
            }

            // if (route.data?.activacion[0] === 8) {
            if (grpPersonasUser.creditoAprobado === route.data?.activacion[0]) {
                this._router.navigate(['/personas/estado-solicitud-credito']);
                return true;
            }

            const creditoNegado = route.data?.activacion.includes(grpPersonasUser.creditoAprobado);
            if (creditoNegado) {
                console.log('if');
                this._router.navigate(['/personas/estado-solicitud-credito']);
                return true;
            }


            switch (Number(grpPersonasUser.estado)) {
                case 1: {
                    if (!activacion) {
                        this._router.navigate(['/personas/bienvenido']);
                    }
                    return true;
                }
                // case 2: {
                //     if (!activacion) {
                //         // this._router.navigate(['/personas/completarPerfil']);
                //         this._router.navigate(['/pages/solicitud-credito']);
                //     }
                //     return true;
                // }
                // case 3: {
                //     if (!activacion) {
                //         // this._router.navigate(['/personas/completarPerfil']);
                //         this._router.navigate(['/personas/perfil-completar']);
                //     }
                //     return true;
                // }
                case 4: {
                    if (!activacion) {
                        this._router.navigate(['/personas/felicidadesRegistro']);
                    }
                    return true;
                }
                case 7: {
                    if (!activacion) {
                        this._router.navigate(['/personas/registroDatosPagosProvedores']);
                    }
                    return true;
                }
                default: {
                    return true;
                }
            }

            if (route.data.roles && !rolEncontrado) {
                // role not authorised so redirect to not-authorized page
                this._router.navigate(['/pages/miscellaneous/not-authorized']);
                return false;
            }


            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this._router.navigate(['/grp/login'],
            {
                // queryParams: { returnUrl: state.url }
            }
        );
        return false;
    }
}
