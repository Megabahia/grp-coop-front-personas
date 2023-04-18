import { Component, OnInit } from "@angular/core";
import { CoreMenuService } from "@core/components/core-menu/core-menu.service";

import { NotificationsService } from "app/layout/components/navbar/navbar-notification/notifications.service";

// Interface
interface notification {
  messages: [];
  systemMessages: [];
  system: Boolean;
}

@Component({
  selector: "app-navbar-notification",
  templateUrl: "./navbar-notification.component.html",
})
export class NavbarNotificationComponent implements OnInit {
  // Public
  public notifications: notification;
  public estado;
  public mensajes: [
    {
      image: "assets/images/portrait/small/avatar-s-15.jpg";
      heading: '<span class="font-weight-bolder">Complete su perfil</span> winner!';
      text: "Haga click aquí y complete la información de su perfil.";
      href: "";
    }
  ];
  /**
   *
   * @param {NotificationsService} _notificationsService
   */
  constructor(
    private _notificationsService: NotificationsService,
    private _coreMenuService: CoreMenuService
  ) {
    this.estado = this._coreMenuService.grpPersonasUser?.estado
      ? this._coreMenuService.grpPersonasUser.estado
      : 0;
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._notificationsService.onApiDataChange.subscribe((res) => {
      this.notifications = res;
    });
  }
}
