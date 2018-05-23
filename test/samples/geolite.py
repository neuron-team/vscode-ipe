from IPython.display import GeoJSON

GeoJSON(      
	{
        "type": "FeatureCollection",
        "features": [
        {
          "type": "Feature",
          "properties": {
          "name": "Van Dorn Street",
          "marker-color": "#0000ff",
          "marker-symbol": "rail-metro",
          "line": "blue"
          },
          "geometry": {
          "type": "Point",
          "coordinates": [
            -77.12911152370515,
            38.79930767201779
          ]
          }
        }]
    }
)