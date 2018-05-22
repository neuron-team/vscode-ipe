import { Injectable } from '@angular/core';

@Injectable()
export class RegexService {
  regexQuery(search: string): RegExp {
    //If there is match between slash
    if (/\/([\s\S]*?)\//.test(search)) {
        //Get expression between slashes and get regex flags
      return new RegExp(/\/([\s\S]*?)\//.exec(search)[0].slice(1, -1), /[^/]*$/.exec(search)[0])
    }
    return null;
  }
}
