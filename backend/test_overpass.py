import urllib.request, json, urllib.parse

def test_overpass(name, lat, lng):
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:15];
    (
      nwr["tourism"~"attraction|museum|viewpoint|gallery"](around:8000, {lat}, {lng});
      nwr["historic"~"monument|castle|memorial|ruins"](around:8000, {lat}, {lng});
    );
    out center 15;
    """
    post_data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    req = urllib.request.Request(overpass_url, data=post_data, headers={'User-Agent': 'SmartTouristPlanner/2.0 (contact@example.com)'})
    try:
        res = urllib.request.urlopen(req)
        status = res.status
        content_type = res.headers.get('content-type', '')
        print(f"Overpass {name} -> Status: {status}, Content-Type: {content_type}")
        if status == 200 and 'json' in content_type:
            data = json.loads(res.read().decode('utf-8'))
            elements = data.get('elements', [])
            print(f"  Found {len(elements)} attractions for {name}:")
            for el in elements[:4]:
                tags = el.get('tags', {})
                el_lat = el.get('lat', el.get('center', {}).get('lat'))
                el_lng = el.get('lon', el.get('center', {}).get('lon'))
                print(f"    * {tags.get('name')} | {tags.get('tourism', tags.get('historic'))} ({el_lat}, {el_lng})")
        else:
            print(f"  Non-JSON or error: {res.read()[:100]}")
    except Exception as e:
        print(f"Overpass error for {name}: {e}")

test_overpass("Paris", 48.8534, 2.3488)
test_overpass("Ooty", 11.4126, 76.7030)
test_overpass("Coimbatore", 11.0018, 76.9628)
test_overpass("Virudhachalam", 11.5164, 79.3287)
