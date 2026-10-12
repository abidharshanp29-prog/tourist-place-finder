import urllib.request, json

def test_wiki():
    url = "https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=48.85341|2.3488&gsradius=10000&gslimit=25&format=json"
    headers = {
        'User-Agent': 'SmartTouristPlanner/2.0 (https://example.com/planner; contact@example.com)'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        res = urllib.request.urlopen(req)
        print("Status:", res.status)
        print("Content-Type:", res.headers.get('content-type'))
        body = res.read()
        print("Body length:", len(body))
        print("First 200 chars:", body[:200])
        parsed = json.loads(body.decode('utf-8'))
        print("JSON parse success! Keys:", parsed.keys())
    except urllib.error.HTTPError as e:
        print("HTTP Error code:", e.code)
        print("HTTP Error headers:", e.headers)
        print("HTTP Error body:", e.read()[:300])
    except Exception as e:
        print("Other exception:", e)

test_wiki()
