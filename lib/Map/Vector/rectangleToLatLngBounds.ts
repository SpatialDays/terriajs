import L from "leaflet";
import { Math as CesiumMath } from "cesium";
import { Rectangle as Rectangle } from "cesium";

/**
 * Converts a Cesium Rectangle into a Leaflet LatLngBounds.
 * @param {Rectangle} rectangle The rectangle to convert.
 * @return {L.latLngBounds} The equivalent Leaflet latLngBounds.
 */
export default function rectangleToLatLngBounds(rectangle: Rectangle) {
  var west = CesiumMath.toDegrees(rectangle.west);
  var south = CesiumMath.toDegrees(rectangle.south);
  var east = CesiumMath.toDegrees(rectangle.east);
  var north = CesiumMath.toDegrees(rectangle.north);
  return L.latLngBounds([south, west], [north, east]);
}
