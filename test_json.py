import json
import requests
try:
    with requests.get('http://localhost:8000/api/analyze?ticker=AAPL', stream=True) as r:
        for line in r.iter_lines():
            if line:
                data = json.loads(line)
                if data.get('status') == 'complete':
                    paths = data.get('monte_carlo', {}).get('paths')
                    print(f"Total simulated paths: {len(paths)}")
                    print(f"Days per path: {len(paths[0])}")
                    break
except Exception as e:
    print(e)
