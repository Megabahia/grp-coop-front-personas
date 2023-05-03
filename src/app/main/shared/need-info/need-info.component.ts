import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-need-info',
  templateUrl: './need-info.component.html',
  styleUrls: ['./need-info.component.scss']
})
export class NeedInfoComponent implements OnInit {

  @Input() href: string;

  constructor() {
    console.log("href",this.href)
  }

  ngOnInit(): void {
  }

}
