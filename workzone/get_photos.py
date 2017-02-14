import urllib2
import json

with open('/Users/brendanbrown27/Desktop/congress/data/sens.json') as f:
    reps = json.load(f)

existing_photos = {}

for rep in reps:

    url = rep['photoUrl']

    if not len(url):
        continue

    # photo = urllib2.urlopen(url)
    ext = '.' + url.split('.')[len(url.split('.')) - 1]

    if rep['state'] + '_sen' in existing_photos.keys():
        filename = rep['state'] + '_sen2' + ext
    else:
        filename = rep['state'] + '_sen1' + ext

    existing_photos[rep['state'] + '_sen'] = True
    rep['photoFilename'] = filename
    # filepath = '/Users/brendanbrown27/Desktop/congress/images/' + filename
    #
    # with open(filepath, 'wb') as output:
    #   output.write(photo.read())

with open('/Users/brendanbrown27/Desktop/congress/data/sens2.json', 'w') as outfile:
    json.dump(reps, outfile)


# import urllib2
# import json
#
# with open('/Users/brendanbrown27/Desktop/congress/data/reps.json') as f:
#     reps = json.load(f)
#
# for rep in reps:
#
#     url = rep['photoUrl']
#
#     if not len(url):
#         continue
#
#     # photo = urllib2.urlopen(url)
#     ext = '.' + url.split('.')[len(url.split('.')) - 1]
#     filename = rep['state'] + rep['district'] + ext
#     rep['photoFilename'] = filename
#     # filepath = '/Users/brendanbrown27/Desktop/congress/images/' + filename
#     #
#     # with open(filepath, 'wb') as output:
#     #   output.write(photo.read())
#
# with open('/Users/brendanbrown27/Desktop/congress/data/reps2.json', 'w') as outfile:
#     json.dump(reps, outfile)
