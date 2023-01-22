import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import {
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { first, interval } from 'rxjs';
import {
  SideDrawerData,
  SIDE_DRAWER_DATA_TOKEN,
  TooltipReference,
} from './tooltip-types';
import { TooltipService } from './tooltip.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent<T> implements OnDestroy {
  @ViewChild(CdkPortalOutlet, { static: false }) portalOutlet: CdkPortalOutlet;

  componentPortal: ComponentPortal<unknown>;

  constructor(
    @Inject(SIDE_DRAWER_DATA_TOKEN) public data: SideDrawerData<T, unknown>,
    private sideDrawerReference: TooltipReference,
    private sideDrawerService: TooltipService
  ) {}

  get title(): string {
    return this.data.config.title;
  }

  ngOnDestroy(): void {
    this.portalOutlet?.detach();
    this.sideDrawerService.removeFromDrawerRefsStack(this.sideDrawerReference);
  }

  close() {
    this.sideDrawerReference.close();
  }

  displayComponent() {
    // Inject drawer data and drawer ref into the child component
    // It can be access via constructor
    const injector = Injector.create({
      providers: [
        { provide: SIDE_DRAWER_DATA_TOKEN, useValue: this.data },
        { provide: TooltipReference, useValue: this.sideDrawerReference },
      ],
    });

    // Prepare the component that we passed in the sideDrawerService.open
    this.componentPortal = new ComponentPortal(
      this.data.component,
      null,
      injector
    );

    // Render the component
    const componentPortalRef = this.portalOutlet.attachComponentPortal(
      this.componentPortal
    );

    const componentInstance = componentPortalRef.instance;

    // Let`s put the data on next tick
    // https://angular.io/errors/NG0100 (ExpressionChangedAfterItHasBeenCheckedError)
    interval(1)
      .pipe(first())
      .subscribe(() => {
        // Assign props value
        if (this.data.config.inputs) {
          Object.keys(this.data.config.inputs).forEach((key) => {
            componentInstance[key] = this.data.config.inputs[key];
          });
        }
      });
  }
}
