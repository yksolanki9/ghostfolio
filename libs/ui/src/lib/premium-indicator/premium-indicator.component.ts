import { publicRoutes } from '@ghostfolio/common/routes/routes';

import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-premium-indicator',
  styleUrls: ['./premium-indicator.component.scss'],
  templateUrl: './premium-indicator.component.html'
})
export class GfPremiumIndicatorComponent {
  @Input() enableLink = true;

  public routerLinkPricing = publicRoutes.pricing.routerLink;
}
