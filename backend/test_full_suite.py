import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request, json, urllib.parse

def test_autocomplete(q):
    encoded = urllib.parse.quote(q)
    url = f"http://127.0.0.1:8000/api/places/autocomplete?query={encoded}"
    req = urllib.request.Request(url)
    res = urllib.request.urlopen(req)
    assert res.status == 200, f"Status code was {res.status}"
    data = json.loads(res.read().decode('utf-8'))
    suggestions = data.get('suggestions', [])
    print(f"[AUTOCOMPLETE] '{q}' -> Found {len(suggestions)} suggestions:")
    for s in suggestions[:3]:
        print(f"   * {s['name']} | {s['secondary_text']} [{s['type']}]")
    assert len(suggestions) > 0, f"Expected suggestions for '{q}'"
    return suggestions

def test_search(city, coords=None):
    encoded = urllib.parse.quote(city)
    url = f"http://127.0.0.1:8000/api/places/search?location={encoded}"
    if coords:
        url += f"&lat={coords['lat']}&lng={coords['lng']}"
    req = urllib.request.Request(url)
    res = urllib.request.urlopen(req)
    assert res.status == 200, f"Status code was {res.status}"
    data = json.loads(res.read().decode('utf-8'))
    assert data.get('success') is True, f"Search failed for {city}: {data.get('message')}"
    results = data.get('results', [])
    print(f"[SEARCH] '{city}' -> Success: {data.get('success')} | Found {len(results)} places | Center: {data.get('center')}")
    for p in results[:3]:
        print(f"   * {p['name']} | {p['formatted_address']} | Rating: {p.get('rating')}★")
    assert len(results) > 0, f"Expected places for '{city}'"
    print()

print("==================================================")
print("1. TESTING AUTOCOMPLETE FIX (vir, virudh, Coimbatore, Ooty, Marina Beach)")
print("==================================================")
test_autocomplete('vir')
test_autocomplete('virudh')
test_autocomplete('Coimbatore')
test_autocomplete('Ooty')
test_autocomplete('Marina Beach')

print("\n==================================================")
print("2. TESTING SEARCH & JSON PARSER FIX (Paris, Ooty, Coimbatore, Virudhachalam)")
print("==================================================")
test_search('Paris')
test_search('Ooty')
test_search('Coimbatore')
test_search('Virudhachalam')

print("\n==================================================")
print("3. TESTING COORDINATE-BASED AUTOCOMPLETE SELECTION (Marina Beach)")
print("==================================================")
test_search('Marina Beach', coords={'lat': 13.0532752, 'lng': 80.2833106})

print("ALL VERIFICATION CHECKS PASSED PERFECTLY!")
