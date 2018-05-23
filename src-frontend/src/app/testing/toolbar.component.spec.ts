import { ToolbarComponent } from '../toolbar/toolbar.component';

describe('ToolbarComponent', () => {
    let toolbar: ToolbarComponent;
    beforeEach(() => { toolbar = new ToolbarComponent(); });
   
    it('Filters should be initialized to all true at startup', () => {
      expect(toolbar.filterState).toEqual({text:true,rich:true,error:true});
    });

    // it('EventEmitter should be fired on search bar change', () => {
    //     toolbar.onSearchChanged.subscribe(g => {
    //         expect(g).toEqual({greeting:'hello'});
    //      });
    //   });
    
    
  });