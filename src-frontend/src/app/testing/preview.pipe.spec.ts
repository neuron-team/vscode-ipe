import { PreviewPipe } from '../classes/preview.pipe'

describe('PreviewPipe', () => {
  let pipe = new PreviewPipe();

  it('Case length = 0', () => {
    expect(pipe.transform('')).toBe('');
  });
  it('Case length = 50', () => {
    expect(pipe.transform('12345678901234567890123456789012345678901234567890')).toBe('12345678901234567890123456789012345678901234567890');
  });
  it('Case length = 51', () => {
    expect(pipe.transform('123456789012345678901234567890123456789012345678901')).toBe('12345678901234567890123456789012345678901234567890...');
  });
  it('Case length = 101', () => {
    expect(pipe.transform('12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901')).toBe('12345678901234567890123456789012345678901234567890...');
  });

});
