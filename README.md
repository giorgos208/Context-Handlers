# Context Handlers Repository

This repository contains **two distinct context handlers** for geolocation purposes:

1. [GPS Coordinates Radius Checker](#gps-coordinates-radius-checker)  
2. [IP City Checker (Cross-Check)](#ip-city-checker-cross-check)  

Both are implemented in plain HTML/JavaScript, requiring only a modern web browser. No additional dependencies beyond the included external APIs (for IP checks) and JavaScript’s `fetch()` are needed.

---

## 1. GPS Coordinates Radius Checker

This project provides a simple _context handler_ (or radius-checking module) for verifying whether a given test coordinate is within a specified distance from a center coordinate. It uses the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) to accurately calculate the distance over the Earth's surface.

### Overview

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
  
  - \( R \) is the Earth's radius (~6371 km). In this code, we use **6371e3** meters to get a result in meters.

### How to Use

1. **Copy the HTML** into a file (e.g., `gps-radius-checker.html`).
2. **Open** that file in any modern web browser.
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
5. **Interpret** the `"isWithinRadius"` property to determine if the test coordinate is inside (`true`) or outside (`false`) the specified circle.

### Feedback

- **Likes**:
  - Uses Haversine for realistic Earth distance.
  - No external libraries needed—pure JavaScript and browser-based.
- **Potential Improvements**:
  - Option to switch units (meters, kilometers, miles).
  - Enhanced form/UI validation.

---

## 2. IP City Checker (Cross-Check)

This project verifies whether an IP address is located in a user-provided city (or its broader area) by cross-checking **multiple free IP geolocation APIs**. It aggregates the results and decides whether the majority of successful lookups match the expected city (or are within ~20 km).

### Overview

- **Functionality**:
  1. The user inputs:
     - An IP address (IPv4 or IPv6).
     - An expected city name (e.g., “Athens”).
  2. The script makes **parallel requests** to several free IP geolocation APIs:
     - [ip-api.com](https://ip-api.com/)
     - [ipapi.co](https://ipapi.co/)
     - [ipwho.is](https://ipwho.is/)
     - [freeipapi.com](https://freeipapi.com/)
     - [geoplugin.net](https://www.geoplugin.com/)
  3. Each response is parsed for:
     - `city`, `lat`, `lon`.
     - Checks if `city` matches a known **synonym** of the expected city.
     - If needed, uses the **Haversine distance** to verify it’s within ~20 km of the known city coordinates.
  4. If more than half of the **successful** lookups confirm the city, final result is **`true`**; otherwise, **`false`**.

- **Security**:
  - A **Content Security Policy** is configured in the HTML using a `nonce`, restricting script and connection sources to the known IP APIs.

### How to Use

1. **Copy the HTML** into a file (e.g., `ip-city-checker.html`).
2. **Open** the file in a modern web browser (with JavaScript enabled).
3. **Enter** an IP (e.g., `62.103.147.55` for Athens) and an expected city (e.g., `Athens`).
4. **Click** the **Check** button to see:
   - **true** or **false** based on majority match
   - A detailed breakdown per API call.

### Key Details

- **City Synonyms**: Built-in support (e.g., “Marousi” maps to “Athens”).  
- **Distance Threshold**: 20 km from known city coordinates.  
- **Result**:
  - In the UI, you see **`true`** if the match ratio is greater than 50%, else **`false`**.  
  - Additional lines show each API’s city guess and how it contributed to the final conclusion.

### Feedback

- **Likes**:
  - Cross-checking multiple APIs prevents reliance on a single possibly incorrect data source.
  - Includes synonyms + distance matching for robust results.
- **Potential Improvements**:
  - Could incorporate more synonyms or city data.
  - The distance threshold could be configurable.
  - Additional error-handling for rate limits or unreachable APIs.

---
