import { Component, OnInit } from '@angular/core';
import { TooltipService } from '../tooltip/tooltip/tooltip.service';

@Component({
  selector: 'app-tag-classification',
  templateUrl: './tag-classification.component.html',
  styleUrls: ['./tag-classification.component.css'],
})
export class TagClassificationComponent implements OnInit {
  constructor(private tooltip: TooltipService) {}

  ngOnInit() {}

  public onMouseUp($event) {
    this.tooltip.open(TagClassificationComponent, {} as any);
  }
}
