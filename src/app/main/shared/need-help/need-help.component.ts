import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.scss']
})
export class NeedHelpComponent implements OnInit {

  @Input() href: string;

  constructor() {
    console.log("href",this.href)
  }

  ngOnInit(): void {
  }

}
