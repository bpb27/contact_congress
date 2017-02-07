import json
from os import walk

data_path = '/Users/brendanbrown27/Desktop/congress/data'
state_files = []
state_hash = {}

for (dirpath, dirnames, filenames) in walk(data_path):
    state_files.extend(filenames)
    break

for state_file in state_files:
    i = 0
    file_path = data_path + '/' + state_file
    for line in open(file_path, 'r'):

        i = i + 1
        if i < 5:
            continue

        state = state_file.replace('.txt', '')
        parsed_line = list(filter(lambda x: x, line.split(' ')))

        if len(parsed_line) != 2:
            continue

        zip_code = parsed_line[0]
        district = parsed_line[1].replace('\r', '').replace('\n', '')

        if zip_code not in state_hash.keys():
            o = {
                "district": district,
                "state": state
            }
            state_hash[zip_code] = o

with open('/Users/brendanbrown27/Desktop/congress/data/small_states.json') as f:
    data = json.load(f)
    for state in data:
        for zip_code in data[state]:
            o = {
                "district": "1",
                "state": state
            }
            if zip_code not in state_hash.keys():
                state_hash[zip_code] = o

with open('/Users/brendanbrown27/Desktop/congress/state_hash2.json', 'w') as outfile:
    json.dump(state_hash, outfile)


"""

entries in small_states.json:

alaska
delaware
montana
north dakota
south dakota
vermont
wyoming
"""
