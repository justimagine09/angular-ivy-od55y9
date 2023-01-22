import { HostBinding, HostListener, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagClassificationComponent } from './tag-classification.component';
import { TooltipModule } from '../tooltip/tooltip/tooltip.module';

@NgModule({
  imports: [CommonModule, TooltipModule],
  declarations: [TagClassificationComponent],
  exports: [TagClassificationComponent],
})
export class TagClassificationModule {}
