import { AnsiColorizePipe } from '../classes/ansi-colorize.pipe'

describe('AnsiColorizePipe', () => {
  let pipe = new AnsiColorizePipe();
 
  it('Does not modify string', () => {
    expect(pipe.transform('sample text')).toBe('sample text');
  });
  it('Does not modify plain text', () => {
    expect(pipe.transform('sample text\nsample text\n')).toBe('sample text\nsample text\n');
  });
  it('Renders foreground colors', () => {
    expect(pipe.transform('\x1b[30mblack')).toBe('<span class="ansi-black-fg">black</span>');
  });
  it('Renders multi-attribute sequences', () => {
    expect(pipe.transform('\x1b[30mblack\x1b[37mwhite')).toBe('<span class="ansi-black-fg">black</span><span class="ansi-white-fg">white</span>');
  });

});
