import {MathComponent} from '../math/math.component'

describe('MathComponent', () => {
    let component:MathComponent;
    beforeEach(() => { 
        component= new MathComponent();
     });

     it('$ Characters should be replaced with space', () => {
        component.mathExpr = "$hello";
        component.ngOnInit();
        expect(component.mathExprNorm).toEqual("hello");
      });

      it('Normal Characters should not be replaced', () => {
        component.mathExpr = "hello testing 123";
        component.ngOnInit();
        expect(component.mathExprNorm).toEqual("hello testing 123");
      });

      
});
