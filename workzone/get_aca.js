//https://www.indivisibleguide.com/resources-2/2017/2/16/congressional-district-aca-data

var table = $('#block-yui_3_17_2_1_1487231388385_566429 > div > div > div > table > tbody')[0];
var rows = table.querySelectorAll('tr');
var list = [];

for (var i = 2; i < rows.length; i++) {
    var el = rows[i];
    var tds = el.querySelectorAll('td');
    try {
        var hash = {
            district: tds[0].textContent,
            number: tds[3].textContent
        }
    } catch (e) {
        console.log(e);
    }
    list.push(hash);
}
