import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-vdom',
  template: `VDOM output is currently not supported`
})
export class VDOMComponent implements OnInit {

  @Input() vdom;
  vdomHTML: string

  constructor() {}
  ngOnInit(){
  }

}
