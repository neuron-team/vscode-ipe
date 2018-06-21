import { PipeTransform, Pipe } from '@angular/core';
import { RegexService } from './regex.service';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  constructor(private regexService: RegexService) { }

  /**
   * Highlights characters that matches the search query
   * @param search  User inputted string in search box
   * @param text    Text from card output and title
   * @returns       Replaces matching characters with search highlight class
   */
  transform(text: string, search): string {
    //Sanitize special HTML characters
    let sanitizedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (search) {
      let regexResult = this.regexService.regexQuery(search);
      let pattern = '';
      let regex;
      //User enters regex
      if (regexResult) {
        regex = regexResult;
      }
      //User enters normal text
      else {
        pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        regex = new RegExp(pattern, 'gi');
      }
      return sanitizedText.replace(regex, (match) => `<span class="search-highlight">${match}</span>`);
    } else {
      //If user doesn't enter search query, keep text the same
      return sanitizedText;
    }
  }
}
