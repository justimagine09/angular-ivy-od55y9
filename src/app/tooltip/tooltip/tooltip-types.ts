import { ComponentType, OverlayRef } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface TooltipConfig<COMPONENT_INPUTS> {
  title?: string;
  animationSpeed?: number; // Milliseconds
  panelClass?: string | string[];
  disableBackDrop?: boolean;
  width?: number;
  closeOnNavigation?: boolean;
  positionX: number;
  positionY: number;

  // Allow render component that has @Inputs property
  // Drawer will assign value to the component passed
  inputs?: COMPONENT_INPUTS;
}

export class TooltipReference {
  private afterClosedSubject = new Subject<unknown>();

  constructor(public overlayRef: OverlayRef) {}

  public close(result?: unknown) {
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }

  public afterClosed(): Observable<unknown> {
    return this.afterClosedSubject.asObservable();
  }
}

export interface SideDrawerData<COMPONENT_TYPE, COMPONENT_INPUTS> {
  component: ComponentType<COMPONENT_TYPE>;
  config: TooltipConfig<COMPONENT_INPUTS>;
}

export const SIDE_DRAWER_DATA_TOKEN = new InjectionToken<
  SideDrawerData<unknown, unknown>
>('side-drawer-data-token');

export interface Tool<COMPONENT_TYPE, COMPONENT_INPUTS> {
  component: ComponentType<COMPONENT_TYPE>;
  config: TooltipConfig<COMPONENT_INPUTS>;
}
