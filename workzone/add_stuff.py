import json

with open('../data/reps.json') as f:
    reps = json.load(f)

for rep in reps:
    rep['numbersAca'] = int(rep['numbersAca'].replace(',', ''))

with open('../data/reps2.json', 'w') as outfile:
    json.dump(reps, outfile)
