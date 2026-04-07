import json

try:
    with open('state.json', 'r') as f:
        data = json.load(f)
    
    def anonymize(name):
        parts = name.split()
        if len(parts) > 1:
            return f"{parts[0]} {parts[-1][0]}."
        return name

    if 'users' in data:
        for uid in data['users']:
            name = data['users'][uid].get('name', '')
            data['users'][uid]['name'] = anonymize(name)
                
    if 'digest_queue' in data:
        for d in data['digest_queue']:
            name = d.get('volunteer_name', '')
            d['volunteer_name'] = anonymize(name)
                
    with open('state.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("Scrubbed")
except Exception as e:
    print('Error:', e)
