import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'preview'
})
export class PreviewPipe implements PipeTransform {

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
