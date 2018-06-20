import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
// Declare variable defined by the Google Maps API
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
/**
 * Class which manages the rendering of GeoJSON
 * coordinates on a map.
 */
export class MapComponent implements OnInit {

  /**
   * GeoJSON coordinates received from the backend.
   */
  @Input() geojson: string;
  /**
   * div contained in the html template in which
   * the map will be rendered.
   */
  @ViewChild('map') mapDiv: ElementRef;

  constructor() {}
  ngOnInit(){
    // Defined the options used for map rendering by the Google Maps API
    const mapOptions = {
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: false
    }
    // variable containing the initialised map
    const map = new google.maps.Map(this.mapDiv.nativeElement, mapOptions);
    // // NOTE: This uses cross-domain XHR, and may not work on older browsers.
    // Add GeoJSON coordinates to the map initialised
    map.data.addGeoJson(this.geojson);
    // Zoom the map onto the entered GeoJSON coordinates
    this.zoom(map);
  }

  /**
   * Zoom the given map onto the entered GeoJSON coordinates.
   * @param map Map to zoom.
   */
  private zoom(map) {
    const bounds = new google.maps.LatLngBounds();
    map.data.forEach(feature =>
      this.processPoints(feature.getGeometry(), bounds.extend, bounds)
    );
    map.fitBounds(bounds);
  }

  /**
   * Process data points on the map.
   * @param geometry  Map geometry.
   * @param callback  Callback function.
   * @param thisArg   Bounds.
   */
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
