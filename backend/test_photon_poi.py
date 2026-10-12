import urllib.request, json, urllib.parse

def test_photon_attractions(city, lat, lng):
    # Photon supports searching with lat/lon proximity bias!
    # q=tourism or q=attraction with lat/lon
    url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(city)}+tourist+attraction&lat={lat}&lon={lng}&limit=10"
    req = urllib.request.Request(url, headers={'User-Agent': 'SmartTouristPlanner-App-v2/1.0 (travelplanner.app)'})
    try:
        res = urllib.request.urlopen(req)
        print(f"Photon {city} status: {res.status}, type: {res.headers.get('content-type')}")
        data = json.loads(res.read().decode('utf-8'))
        features = data.get('features', [])
        print(f"  Found {len(features)} attractions:")
        for f in features[:4]:
            p = f.get('properties', {})
            geom = f.get('geometry', {})
            coords = geom.get('coordinates', [0, 0])
            print(f"    * {p.get('name')} | {p.get('city', p.get('state', ''))} | {p.get('osm_value')} ({coords[1]}, {coords[0]})")
    except Exception as e:
        print(f"Photon error: {e}")

test_photon_attractions("Paris", 48.8534, 2.3488)
test_photon_attractions("Ooty", 11.4126, 76.7030)
test_photon_attractions("Coimbatore", 11.0018, 76.9628)
test_photon_attractions("Virudhachalam", 11.5164, 79.3287)
