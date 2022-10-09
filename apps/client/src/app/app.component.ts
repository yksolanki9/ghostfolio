import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import {
  primaryColorHex,
  secondaryColorHex,
  warnColorHex
} from '@ghostfolio/common/config';
import { InfoItem, User } from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { Appearance } from '@ghostfolio/common/types';
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { DataService } from './services/data.service';
import { TokenStorageService } from './services/token-storage.service';
import { UserService } from './services/user/user.service';

@Component({
  selector: 'gf-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  public canCreateAccount: boolean;
  public currentRoute: string;
  public currentYear = new Date().getFullYear();
  public deviceType: string;
  public info: InfoItem;
  public user: User;
  public version = environment.version;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private deviceService: DeviceDetectorService,
    private materialCssVarsService: MaterialCssVarsService,
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private userService: UserService
  ) {
    this.initializeTheme();
    this.user = undefined;
  }

  public ngOnInit() {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const urlTree = this.router.parseUrl(this.router.url);
        const urlSegmentGroup = urlTree.root.children[PRIMARY_OUTLET];
        const urlSegments = urlSegmentGroup.segments;
        this.currentRoute = urlSegments[0].path;

        this.info = this.dataService.fetchInfo();
      });

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        this.user = state.user;

        this.canCreateAccount = hasPermission(
          this.user?.permissions,
          permissions.createUserAccount
        );

        this.initializeTheme(this.user?.settings.appearance);

        this.changeDetectorRef.markForCheck();
      });
  }

  public onCreateAccount() {
    this.tokenStorageService.signOut();
  }

  public onSignOut() {
    this.tokenStorageService.signOut();
    this.userService.remove();

    document.location.href = '/';
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private initializeTheme(userPreferredAppearance: Appearance = 'AUTO') {
    const setDarkTheme =
      userPreferredAppearance === 'DARK' ||
      (userPreferredAppearance === 'AUTO' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.materialCssVarsService.setDarkTheme(setDarkTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addListener((event) => {
      if (!this.user?.settings.appearance) {
        this.materialCssVarsService.setDarkTheme(event.matches);
      }
    });

    this.materialCssVarsService.setPrimaryColor(primaryColorHex);
    this.materialCssVarsService.setAccentColor(secondaryColorHex);
    this.materialCssVarsService.setWarnColor(warnColorHex);
  }
}
