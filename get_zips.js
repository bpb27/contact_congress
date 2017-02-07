//http://www.unitedstateszipcodes.org/wy/
var links = $$('.table-hover tr td:first-child a');

var zips = [];
for (var i = 0; i < links.length; i++) {
    zips.push(links[i].textContent)
}
console.log(zips);


//https://en.wikipedia.org/wiki/Current_members_of_the_United_States_House_of_Representatives
var reps = [];
var rows = $('#mw-content-text > table:nth-child(19) tr');
for (var i = 1; i < rows.length; i++) {

    var el = rows[i];
    var vacant = false;
    var state = el.querySelector('td:first-child').textContent.replace(/\d/g, "").replace('At Large', '').trim().toLowerCase().split(' ').join('_');
    var district = el.querySelector('td:first-child').textContent.includes('At Large') ? '1' : el.querySelector('td:first-child').textContent.match(/\d+/)[0];
    var rep = el.querySelector('td:nth-child(2) .vcard');

    try {
        rep = rep.textContent
    } catch (e) {
        rep = 'Vacant Seat'
        vacant = true;
    }

    var party = 'NA'
    var year = 'NA'
    var link = '';
    var photoUrl = '';

    if (!vacant) {
        party = el.querySelector('td:nth-child(4)').textContent;
        year = el.querySelector('td:nth-child(7)').textContent;
        link = 'https://en.wikipedia.org' + el.querySelector('td:nth-child(2) .vcard a').getAttribute('href');
        photoUrl = 'https://en.wikipedia.org' + el.querySelector('td:nth-child(2) a').getAttribute('href');
    }

    reps.push({
        "state": state,
        "district": district,
        "rep": rep,
        "party": party,
        "year": year,
        "link": link,
        "photoUrl": photoUrl
    });
}
console.log(reps);


//https://en.wikipedia.org/wiki/List_of_current_United_States_Senators
var senators = [];
var rows = $('#mw-content-text > table.sortable.wikitable.sortable.jquery-tablesorter tr');
for (var i = 1; i < rows.length; i++) {
    try {
        senators.push({
            "state": rows[i].querySelector('td:nth-child(2)').textContent.replace(' ', '_').toLowerCase(),
            "name": rows[i].querySelector('td:nth-child(5) .vcard').textContent,
            "party": rows[i].querySelector('td:nth-child(6)').textContent,
            "yearElected": rows[i].querySelector('td:nth-child(10)').textContent.split(',')[1].trim(),
            "linkWikipedia": 'https://en.wikipedia.org' + rows[i].querySelector('td:nth-child(5) .vcard a').getAttribute('href'),
            "photoUrl": 'https:' + rows[i].querySelector('td:nth-child(4) a img').getAttribute('src'),
            "yearReelection": rows[i].querySelector('td:nth-child(12)').textContent,
            "socialFacebook": "",
            "socialTwitter": "",
            "socialYoutube": "",
            "socialInstagram": "",
            "linkContact": "",
            "linkMeeting": "",
            "contact": [
                {
                    "address": "",
                    "name": "Washington DC Office",
                    "phone": "",
                    "fax": ""
              },
                {
                    "address": "",
                    "name": "Office",
                    "phone": "",
                    "fax": ""
              },
                {
                    "address": "",
                    "name": "Office",
                    "phone": "",
                    "fax": ""
              },
                {
                    "address": "",
                    "name": "Office",
                    "phone": "",
                    "fax": ""
              }
            ]
        });
    } catch (e) {
        console.log(e, rows[i].querySelector('td:nth-child(5) .vcard').textContent);
    }

}
console.log(senators);

//https://en.wikipedia.org/wiki/United_States_Senate_Committee_on_Appropriations

function getMembers(selector) {
    var names = [];
    var els = $$(selector + ' li');
    for (var i = 0; i < els.length; i++) {
        names.push(els[i].textContent.split(',')[0])
    }
    return names;
}
var a = getMembers(s);
copy(a);

function assign(sens, comms) {
    return sens.map(function (sen) {
        var a = [];
        comms.forEach(function (comm) {
            if (comm.members.includes(sen.name)) {
                a.push(comm.name);
            }
        });
        sen.committees = a;
        return sen;
    });
}

function allcomms(comms) {
    var all = [];
    comms.forEach(function (comm) {
        all.push(comm.name);
    });
    console.log(all);
}
