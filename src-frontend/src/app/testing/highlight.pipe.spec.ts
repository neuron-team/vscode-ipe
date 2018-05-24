import { HighlightPipe } from '../classes/highlight.pipe'
import { RegexService } from '../classes/regex.service';

describe('HighlightPipe', () => {
  let pipe = new HighlightPipe(new RegexService());
 
  it('highlights single character', () => {
    expect(pipe.transform('abccba', 'b')).toBe('a<span class="search-highlight">b</span>cc<span class="search-highlight">b</span>a', 'single character');
  });
  it('highlights single word', () => {
    expect(pipe.transform('sample vscode-ipe', 'vscode')).toBe('sample <span class="search-highlight">vscode</span>-ipe', 'single word');
  });

  it('highlights case-insensitive single character', () => {
    expect(pipe.transform('abBc', 'b')).toBe('a<span class="search-highlight">b</span><span class="search-highlight">B</span>c', 'case-insensitive single character');
  });
  it('highlights case-insensitive multiple word', () => {
    expect(pipe.transform('abBaBbc', 'bB')).toBe('a<span class="search-highlight">bB</span>a<span class="search-highlight">Bb</span>c', 'case-insensitive multiple word');
  });

  it('highlight simple regex query', () => {
    expect(pipe.transform('microsoft vscode', '/microsoft/gi')).toBe('<span class="search-highlight">microsoft</span> vscode', 'simple regex query');
  });
  it('highlight simple regex query with no flags', () => {
    expect(pipe.transform('microsoft vscode', '/microsoft/')).toBe('<span class="search-highlight">microsoft</span> vscode', 'simple regex query');
  });
  it('highlight regex special characters', () => {
    expect(pipe.transform('-[]{}()*+?.\\^$|', '/[ \\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|]/gi')).toBe('<span class="search-highlight">-</span><span class="search-highlight">[</span><span class="search-highlight">]</span><span class="search-highlight">{</span><span class="search-highlight">}</span><span class="search-highlight">(</span><span class="search-highlight">)</span><span class="search-highlight">*</span><span class="search-highlight">+</span><span class="search-highlight">?</span><span class="search-highlight">.</span><span class="search-highlight">\\</span><span class="search-highlight">^</span><span class="search-highlight">$</span><span class="search-highlight">|</span>', 'special characters');
  });

});
