import re
import urllib.request
import urllib.parse
import json

# Offline Location Coordinates Catalog for instant high-speed geocoding
OFFLINE_LOCATIONS = {
    "rajasthan": {
        "name": "State of Rajasthan, India",
        "center": [74.2179, 27.0238],
        "bbox": [69.4800, 23.5000, 78.2700, 30.2000],
        "zoom": 6.8,
        "elevation_base": 250.0
    },
    "india": {
        "name": "Republic of India",
        "center": [78.9629, 20.5937],
        "bbox": [68.1100, 6.7500, 97.4100, 35.5000],
        "zoom": 5.0,
        "elevation_base": 350.0
    },
    "maharashtra": {
        "name": "State of Maharashtra, India",
        "center": [75.7139, 19.7515],
        "bbox": [72.6000, 15.6000, 80.9000, 22.0000],
        "zoom": 7.0,
        "elevation_base": 550.0
    },
    "california": {
        "name": "State of California, USA",
        "center": [-119.4179, 36.7783],
        "bbox": [-124.4000, 32.5000, -114.1000, 42.0000],
        "zoom": 6.2,
        "elevation_base": 400.0
    },
    "ajmer": {
        "name": "Ajmer, Rajasthan, India",
        "center": [74.6399, 26.4499],
        "bbox": [74.5500, 26.3500, 74.7500, 26.5500],
        "zoom": 12.8,
        "elevation_base": 480.0
    },
    "jaipur": {
        "name": "Jaipur & Ramgarh Lake, Rajasthan, India",
        "center": [75.7873, 26.9124],
        "bbox": [75.6800, 26.8000, 75.9000, 27.0200],
        "zoom": 12.5,
        "elevation_base": 430.0
    },
    "washington": {
        "name": "Washington DC, United States",
        "center": [-77.0369, 38.9072],
        "bbox": [-77.1200, 38.8200, -76.9500, 38.9800],
        "zoom": 12.2,
        "elevation_base": 25.0
    },
    "los angeles": {
        "name": "Los Angeles, California, USA",
        "center": [-118.2437, 34.0522],
        "bbox": [-118.4000, 33.9000, -118.1000, 34.2000],
        "zoom": 11.5,
        "elevation_base": 89.0
    },
    "delhi": {
        "name": "Delhi NCR Fluvial Corridor, India",
        "center": [77.1025, 28.7041],
        "bbox": [76.8400, 28.4000, 77.3500, 28.8800],
        "zoom": 12.0,
        "elevation_base": 216.0
    },
    "mumbai": {
        "name": "Mumbai Metropolitan Region, India",
        "center": [72.8777, 19.0760],
        "bbox": [72.7500, 18.8900, 72.9900, 19.2700],
        "zoom": 12.0,
        "elevation_base": 14.0
    },
    "assam": {
        "name": "Brahmaputra Basin, Assam, India",
        "center": [92.9376, 26.2006],
        "bbox": [89.7000, 24.1000, 96.0000, 28.0000],
        "zoom": 9.5,
        "elevation_base": 110.0
    },
    "brahmaputra": {
        "name": "Brahmaputra River Corridor, Assam",
        "center": [92.5000, 26.5000],
        "bbox": [91.0000, 25.8000, 94.5000, 27.2000],
        "zoom": 10.0,
        "elevation_base": 95.0
    },
    "kerala": {
        "name": "Kerala Coastal Wetlands, India",
        "center": [76.2711, 10.8505],
        "bbox": [74.8500, 8.2800, 77.4000, 12.8000],
        "zoom": 9.0,
        "elevation_base": 30.0
    },
    "uttarakhand": {
        "name": "Uttarakhand Himalayan River System",
        "center": [79.0193, 30.0668],
        "bbox": [77.5800, 28.7200, 81.0500, 31.4500],
        "zoom": 9.0,
        "elevation_base": 1850.0
    },
    "bengaluru": {
        "name": "Bengaluru Plateau, Karnataka, India",
        "center": [77.5946, 12.9716],
        "bbox": [77.4500, 12.8000, 77.7500, 13.1500],
        "zoom": 12.0,
        "elevation_base": 920.0
    },
    "chennai": {
        "name": "Chennai Coastal Zone, Tamil Nadu",
        "center": [80.2707, 13.0827],
        "bbox": [80.1200, 12.9000, 80.3500, 13.2500],
        "zoom": 12.0,
        "elevation_base": 6.0
    },
    "kolkata": {
        "name": "Kolkata & Sunderbans Delta, West Bengal",
        "center": [88.3639, 22.5726],
        "bbox": [88.1500, 22.3000, 88.5500, 22.8000],
        "zoom": 11.5,
        "elevation_base": 9.0
    }
}

def geocode_online_nominatim(place_name):
    """Queries OSM Nominatim API for dynamic global geocoding of any place, city, or country."""
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(place_name)}&format=json&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'SatQueryAI-EO-Workstation/2026'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data and len(data) > 0:
                item = data[0]
                lat = float(item['lat'])
                lon = float(item['lon'])
                boundingbox = item.get('boundingbox', [lat-0.05, lat+0.05, lon-0.05, lon+0.05])
                miny, maxy, minx, maxx = float(boundingbox[0]), float(boundingbox[1]), float(boundingbox[2]), float(boundingbox[3])
                return {
                    "name": item.get('display_name', place_name),
                    "center": [lon, lat],
                    "bbox": [minx, miny, maxx, maxy],
                    "zoom": 12.5,
                    "elevation_base": 350.0
                }
    except Exception:
        pass
    return None

def extract_location_from_query(query):
    """Extracts target location from user prompt text and returns center coordinates + bounding box."""
    q_lower = query.lower()

    # 1. Offline Catalog Check
    for key, loc in OFFLINE_LOCATIONS.items():
        if re.search(rf'\b{key}\b', q_lower):
            minx, miny, maxx, maxy = loc["bbox"]
            highlight_geojson = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy], [minx, miny]]]
                    },
                    "properties": {"name": loc["name"], "type": "Target Region Boundary"}
                }]
            }
            return {
                "matched": True,
                "name": loc["name"],
                "center": loc["center"],
                "bbox": loc["bbox"],
                "zoom": loc["zoom"],
                "elevation_base": loc.get("elevation_base", 300.0),
                "geojson": highlight_geojson
            }

    # 2. Dynamic Online Geocoding Fallback for any location
    words = re.findall(r'\b[A-Z][a-z]+\b', query)
    for word in words:
        if word.lower() not in ['analyze', 'satellite', 'imagery', 'identify', 'calculate', 'show', 'where', 'what', 'find']:
            res = geocode_online_nominatim(word)
            if res:
                minx, miny, maxx, maxy = res["bbox"]
                highlight_geojson = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy], [minx, miny]]]
                        },
                        "properties": {"name": res["name"], "type": "Target Region Boundary"}
                    }]
                }
                return {
                    "matched": True,
                    "name": res["name"],
                    "center": res["center"],
                    "bbox": res["bbox"],
                    "zoom": res["zoom"],
                    "elevation_base": res.get("elevation_base", 300.0),
                    "geojson": highlight_geojson
                }

    # Default fallback
    return {
        "matched": False,
        "name": "Cartosat/RISAT Reference Region",
        "center": [77.125, 28.625],
        "bbox": [77.10, 28.60, 77.15, 28.65],
        "zoom": 12.8,
        "elevation_base": 216.0,
        "geojson": None
    }
