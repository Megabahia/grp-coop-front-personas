import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { SocialAuthService } from 'angularx-social-login';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public grpPersonasUser: Observable<User>;

  //private
  private grpPersonasUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
    
    constructor(private _http: HttpClient, private _toastrService: ToastrService,private socialAuthService: SocialAuthService,) {
    this.grpPersonasUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('grpPersonasUser')));
    this.grpPersonasUser = this.grpPersonasUserSubject.asObservable();
  }

  // getter: grpPersonasUserValue
  public get grpPersonasUserValue(): User {
    return this.grpPersonasUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  // get isAdmin() {
  //   return this.grpPersonasUser && this.grpPersonasUserSubject.value.role === Role.Admin;
  // }

  // /**
  //  *  Confirms if user is client
  //  */
  // get isClient() {
  //   return this.grpPersonasUser && this.grpPersonasUserSubject.value.role === Role.Client;
  // }

  /**
   * User login
   *
   * @param email
   * @param password
   * @returns user
   */
  login(username: string, password: string) {
    return this._http
      .post<any>(`${environment.apiUrl}/central/auth/login/`, { username, password, tipoUsuario:'core' })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            user.tokenExpiracion = Date.now() + (Number(user.tokenExpiracion) * 1000);
            localStorage.setItem('grpPersonasUser', JSON.stringify(user));
            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(
                // 'You have successfully logged in as an ' +
                //   user.role +
                //   ' user to Vuexy. Now you can start to explore. Enjoy! 🎉',
                // '👋 Welcome, ' + user.firstName + '!',
                // { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            this.grpPersonasUserSubject.next(user);
          }

          return user;
        })
      );
  }

  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    this.signOut();
    localStorage.removeItem('grpPersonasUser');
    // notify
    this.grpPersonasUserSubject.next(null);
  }
  signOut(): void {
    this.socialAuthService.signOut();
  }

}
