import { PipeTransform, Pipe } from '@angular/core';
import { RegexService } from './regex.service';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  constructor(private regexService: RegexService) { }

  transform(text: string, search): string {
    let sanitizedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (search) {
      let regexResult = this.regexService.regexQuery(search);
      let pattern = '';
      let regex;
      // Regex search
      if (regexResult) {
        regex = regexResult;
      }
      // Normal search
      else {
        pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        regex = new RegExp(pattern, 'gi');
      }
      return sanitizedText.replace(regex, (match) => `<span class="search-highlight">${match}</span>`);
    } else {
      return sanitizedText;
    }
  }
}
