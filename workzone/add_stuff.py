import json

with open('../data/sens.json') as f:
    reps = json.load(f)

with open('aca_by_state.json') as f:
    states = json.load(f)

def findMatch(state):
    result = list(filter(lambda x: x['state'] == state, states))
    if len(result):
        return result[0]
    else:
        print("failed", state)
        return {}

for rep in reps:
    state = findMatch(rep['stateDisplay'])
    print(state)
    rep['numbersMedicaid'] = int(state['total_medicaid_enrollment'])
    rep['numbersMedicaidAca'] = int(state['medicaid_enrollment_due_to_aca'])

with open('../data/sens2.json', 'w') as outfile:
    json.dump(reps, outfile)
