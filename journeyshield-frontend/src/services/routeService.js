// routeService.js — delegates to searchService (same backend endpoint)
import searchService from './searchService';

const getRoute = (startLat, startLon, endLat, endLon) =>
  searchService.getRoute(startLat, startLon, endLat, endLon);

export default { getRoute };