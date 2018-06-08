import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @Input() geojson: string;
  @ViewChild('map') mapDiv: ElementRef;

  constructor() {}
  ngOnInit(){
    const mapOptions = {
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: false
    }
    const map = new google.maps.Map(this.mapDiv.nativeElement, mapOptions);
    // // NOTE: This uses cross-domain XHR, and may not work on older browsers.
    map.data.addGeoJson(this.geojson);
    this.zoom(map);
  }

  private zoom(map) {
    const bounds = new google.maps.LatLngBounds();
    map.data.forEach(feature =>
      this.processPoints(feature.getGeometry(), bounds.extend, bounds)
    );
    map.fitBounds(bounds);
  }

  private processPoints(geometry, callback, thisArg) {
    if (geometry instanceof google.maps.LatLng) {
      callback.call(thisArg, geometry);
    } else if (geometry instanceof google.maps.Data.Point) {
      callback.call(thisArg, geometry.get());
    } else {
      geometry.getArray().forEach(g => {
        this.processPoints(g, callback, thisArg);
      });
    }
  }
}
