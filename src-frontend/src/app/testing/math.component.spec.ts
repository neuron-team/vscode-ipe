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
});
