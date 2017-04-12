import json

with open('../data/reps.json') as f:
    reps = json.load(f)

for rep in reps:
    rep['id'] = 'R-' + rep['stateAbbreviation']

with open('../data/reps2.json', 'w') as outfile:
    json.dump(reps, outfile)
