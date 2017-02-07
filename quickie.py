import json

with open('./state_hash.json') as f:
    data = json.load(f)

    new_hash = {}
    for key in data:
        new_hash[key] = data[key]['state'] + ' ' + data[key]['district']

with open('./state_hash_short.json', 'w') as outfile:
    json.dump(new_hash, outfile)
