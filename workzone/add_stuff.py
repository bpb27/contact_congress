import json

with open('../data/sens.json') as f:
    reps = json.load(f)

with open('./pres_election.json') as f:
    states = json.load(f)

def findMatch (state):
    results = list(filter(lambda x: x['state'] == state, states))
    if not len(results):
        print(abbr)
        return ''
    return results[0]

for rep in reps:
    district = findMatch(rep['stateDisplay'])
    rep['voteTrump'] = district['trump']
    rep['voteClinton'] = district['clinton']
    rep['votePersonal'] = float(rep['threshold'])
    del rep['threshold']

with open('../data/sens2.json', 'w') as outfile:
    json.dump(reps, outfile)
