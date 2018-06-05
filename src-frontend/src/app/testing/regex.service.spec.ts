import { RegexService } from '../classes/regex.service';

describe('RegexService', () => {
    let service: RegexService;
    beforeEach(() => { service = new RegexService(); });
   
    it('Regex query should return null if search query is a normal string', () => {
      expect(service.regexQuery("hello")).toBe(null);
    });
    it('Regex query should return null if search query is a normal string, even with slash at front', () => {
      expect(service.regexQuery("/hello")).toBe(null);
    });
    it('Regex query should return null if search query is a normal string, even with slash at end', () => {
      expect(service.regexQuery("hello/")).toBe(null);
    });

    it('Regex query should return regex expression if search query is enclosed /.../, with no flags', () => {
      expect(service.regexQuery("/exp/")).toEqual(/exp/);
    });

    it('Regex query should return regex expression and flags if search query is enclosed /.../flags', () => {
      expect(service.regexQuery("/this/gi")).toEqual(/this/gi);
    });

 
  });