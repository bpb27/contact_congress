var table = $('#mw-content-text > div:nth-child(160) > table')[0];
var rows = table.querySelectorAll('tr');
var list = [];

function numify(str) {
    return parseFloat(parseFloat(str).toFixed(1))
}

for (var i = 2; i < rows.length; i++) {
    var el = rows[i];
    var tds = el.querySelectorAll('td');
    try {
        var hash = {
            state: tds[0] && tds[0].textContent ? tds[0].textContent.replace('%', '') : '',
            clinton: tds[3] && tds[3].textContent ? numify(tds[3].textContent.replace('%', '')) : '',
            trump: tds[6] && tds[6].textContent ? numify(tds[6].textContent.replace('%', '')) : '',
            johnson: tds[9] && tds[9].textContent ? numify(tds[9].textContent.replace('%', '')) : '',
            stein: tds[12] && tds[12].textContent ? numify(tds[12].textContent.replace('%', '')) : ''
        }
    } catch (e) {
        console.log(e);
    }
    list.push(hash);
}
