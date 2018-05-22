// Straight Jasmine testing without Angular's testing support
import { RegexService } from './regex.service';

describe('ValueService', () => {
    let service: RegexService;
    beforeEach(() => { service = new RegexService(); });
   
    it('Regex query should return null if search query is a normal string', () => {
      expect(service.regexQuery("hello")).toBe(null);
    });
   
  });