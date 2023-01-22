import { Point } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { delay, filter, takeUntil } from 'rxjs/operators';
import {
  SIDE_DRAWER_DATA_TOKEN,
  TooltipConfig,
  TooltipReference,
} from './tooltip-types';
import { TooltipComponent } from './tooltip.component';

const DEFAULT_CONFIG: TooltipConfig<unknown> = {
  panelClass: [],
  width: 480,
  positionX: 0,
  positionY: 0,
  disableBackDrop: false,
  closeOnNavigation: true,
};

@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  drawerRefs = [];
  constructor(private overlay: Overlay) {}

  open<COMPONENT, COMPONENT_INPUTS>(
    component: ComponentType<COMPONENT>,
    config: TooltipConfig<COMPONENT_INPUTS>
  ) {
    const tooltipConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Create new Overlay
    const overlayRef = this.overlay.create({
      width: tooltipConfig.width,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo({
          x: 100,
          y: 100,
          width: 10,
          height: 10,
        } as Point),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      panelClass: ['tooltip__panel', ...tooltipConfig.panelClass],
      backdropClass: ['tooltip__backdrop'],
      disposeOnNavigation: true,
    } as OverlayConfig);

    const drawerRef = this.createSideDrawerRef(overlayRef, tooltipConfig);
    const sideDrawerPortal = this.createSideDrawerPortal(
      component,
      tooltipConfig,
      drawerRef
    );

    overlayRef.attach(sideDrawerPortal);
    this.drawerRefs.push(drawerRef);

    return drawerRef;
  }

  // create side drawer reference so it can be dismiss in the child component
  private createSideDrawerRef(overlayRef, config: TooltipConfig<unknown>) {
    const drawerRef = new TooltipReference(overlayRef);

    // dispose overlay
    drawerRef
      .afterClosed()
      .pipe(delay(config.animationSpeed))
      .subscribe(() => {
        overlayRef.dispose();
      });

    // Remove on backdrop click if enable
    overlayRef
      .backdropClick()
      .pipe(
        takeUntil(drawerRef.afterClosed()),
        filter(() => this.peek() === drawerRef && !config.disableBackDrop)
      )
      .subscribe(() => {
        drawerRef.close();
      });

    // Close on escape key pressed
    overlayRef
      .keydownEvents()
      .pipe(
        takeUntil(drawerRef.afterClosed()),
        filter((event: KeyboardEvent) => event.key === 'Escape'),
        filter(() => this.peek() === drawerRef)
      )
      .subscribe(() => {
        drawerRef.close();
      });

    return drawerRef;
  }

  createSideDrawerPortal(component, config, sideDrawerReference) {
    const data = Injector.create({
      providers: [
        {
          provide: SIDE_DRAWER_DATA_TOKEN,
          useValue: { component, config },
        },
        {
          provide: TooltipReference,
          useValue: sideDrawerReference,
        },
      ],
    });

    return new ComponentPortal(TooltipComponent, null, data);
  }

  public removeFromDrawerRefsStack(drawerRef: TooltipReference) {
    this.drawerRefs = this.drawerRefs.filter((item) => item !== drawerRef);
  }

  private peek(): TooltipReference | undefined {
    if (this.drawerRefs.length) {
      return this.drawerRefs[this.drawerRefs.length - 1];
    }
  }
}
