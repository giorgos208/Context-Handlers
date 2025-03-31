# GPS Coordinates Radius Checker

This project provides a simple _context handler_ (or radius-checking module) for verifying whether a given test coordinate is within a specified distance from a center coordinate. It uses the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) to accurately calculate the distance over the Earth's surface.

## Overview

- **Core Functionality**  
  - You supply a center latitude/longitude.
  - You supply a test latitude/longitude.
  - You specify a radius in meters.
  - The code checks if the distance between the center and test coordinates is within that radius, returning a boolean (`true`/`false`).

- **Haversine Formula**  
  This formula calculates the great-circle distance between two points on a sphere from their latitudes and longitudes:
  \[
      \text{distance} = 2 \times R \times \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cos(\phi_2) \sin^2\left(\frac{\Delta \lambda}{2}\right)}}\right)
  \]
  - \( R \) is the Earth's radius (approximately **6371 km**). In this code, we use **6371e3** meters.

## How to Use

1. **Copy the HTML** below into a file (e.g., `index.html`).
2. **Open** the file in any modern web browser.
3. **Enter**:
   - Center Latitude & Longitude
   - Test Latitude & Longitude
   - Radius in meters
4. **Click** the **Check** button to see the result in a JSON-like format:
    ```json
    {
      "centerCoordinate": { "lat": 37.9838, "lon": 23.7275 },
      "testCoordinate":   { "lat": 37.9715, "lon": 23.7257 },
      "radiusMeters":     2000,
      "distanceMeters":   1394.51,
      "isWithinRadius":   true
    }
    ```
5. **Interpret the `isWithinRadius`** property to determine whether the test coordinate is inside (true) or outside (false) the specified circle.
