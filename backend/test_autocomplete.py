import urllib.request, json, urllib.parse

def format_type(osm_key, osm_val):
    val = (osm_val or osm_key or 'place').replace('_', ' ').title()
    mapping = {
        'Administrative': 'District / Region',
        'Place Of Worship': 'Temple / Place of Worship',
        'Aerodrome': 'Airport',
        'Primary': 'Landmark Road',
        'Suburb': 'Area / Locality',
        'Beach': 'Beach / Coastal Attraction',
        'Town': 'Town',
        'City': 'City',
        'Village': 'Village / Town',
        'Attraction': 'Tourist Attraction',
        'Monument': 'Historical Monument',
        'Museum': 'Museum',
        'Park': 'Park / Nature',
    }
    return mapping.get(val, val)

queries = ['vir', 'virudh', 'Coimbatore', 'Ooty', 'Marina Beach']
for q in queries:
    url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(q)}&limit=6"
    req = urllib.request.Request(url, headers={'User-Agent': 'SmartTouristPlanner/2.0'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print(f"=== Results for '{q}' ===")
    for f in data.get('features', []):
        p = f.get('properties', {})
        coords = f.get('geometry', {}).get('coordinates', [0, 0])
        name = p.get('name')
        parts = [p.get('city'), p.get('district'), p.get('state'), p.get('country')]
        secondary = ', '.join([x for x in parts if x and x != name])
        ptype = format_type(p.get('osm_key'), p.get('osm_value'))
        print(f"  [{ptype}] {name} - {secondary} ({coords[1]}, {coords[0]})")
    print()
