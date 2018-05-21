import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  /* Search regex using /.../flags */
  isRegex(search: string): { isRegex: boolean, flags: string, regexp: string } {
    //If there is regex match
    if (/\/([\s\S]*?)\//.test(search)) {
      // Return string with regex flags, after last /
      let flags = /[^/]*$/.exec(search)[0];
      //Get regex between first 2 /.../
      let regexp = /\/([\s\S]*?)\//.exec(search)[0];
      //Scrub slashes
      regexp = regexp.slice(1, -1);
      //If there is a match between slashes

      return { isRegex: true, flags: flags, regexp: regexp };
    }

    return { isRegex: false, flags: '', regexp: '' };

  }

  transform(text: string, search): string {
    let sanitizedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (search) {
      let regexResult = this.isRegex(search);
      let pattern = '';
      let regex;
      // Regex search
      if (regexResult.isRegex) {
        regex = new RegExp(regexResult.regexp, regexResult.flags);
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
