import { Pipe, PipeTransform } from '@angular/core';
/**
 * Creates preview of first line. Used for code preview on collasped code.
 * @example {{ string | preview }}
 */
@Pipe({
  name: 'preview'
})
export class PreviewPipe implements PipeTransform {


  /**
   * Creates a shortened string of first line on string. 
   * Appends "..." if longer than limit.
   * @param value string of code to be previewed
   * @param limit number of characters (default 50)
   * @returns string
   */
  transform(value: string, limit: number = 50) {
    const preview = value.split('\n');

    if (preview.length == 0) return '';
    if (preview[0].length <= 50 && preview.length <= 1) {
      return value;
    } else {
      return `${preview[0].slice(0, limit)}...`;
    }
  }

}
