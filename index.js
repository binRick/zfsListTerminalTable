var Table = require("terminal-table"),
    humanTime = require('humanize-time'),
    moment = require('moment'),
    pb = require('pretty-bytes'),
    c = require('chalk'),
    child = require('child_process'),
    trim = require('trim'),
    _ = require('underscore');

child.execSync = child.execSync || require('exec-sync');

var cmd = 'ssh beo ssh crux zfs list -s used -H -o name | tail -n 10';
var FSs = child.execSync(cmd).toString().split('\n').map(function(f) {
    return trim(f);
}).filter(function(f) {
    return f.length > 0 && f.split('/').length > 1;
});

var t = new Table({
    borderStyle: 3,
    horizontalLine: true,
    rightPadding: 0,
    leftPadding: 1
});
var Bytes = function(i) {
    return pb(parseInt(i));
};
var renders = {
    creation: function(i) {
        return i;
        return moment(parseInt(i)).format('YYYY MM DD');
    },
    diff: function(i) {
        return humanTime(parseInt(i));
    },
    used: Bytes,
    available: Bytes,
    referenced: Bytes,
    usedbysnapshots: Bytes,
    logicalused: Bytes,
};

var cols = ['creation', 'used', 'available', 'referenced', 'compressratio', 'mounted', 'quota', 'mountpoint', 'usedbysnapshots', 'version', 'logicalused'];
var dCols = ['State', 'Filesystem', 'Creation', 'used', 'available', 'referenced', 'compressratio', 'mounted', 'quota', 'mountpoint', 'usedbysnapshots', 'version', 'logicalused'];

t.push(dCols);
_.each(FSs, function(fs, index, arr) {
    var Row = ["✓", c.green.bold(fs)];
    t.push(Row);
    var cmd = 'ssh beo ssh crux zfs get -H -p -o value ' + cols.join(',') + ' ' + fs;
    var fsValues = child.execSync(cmd).toString().split('\n');
    var O = {};
    var Orender = {};
    _.each(cols, function(c, ind) {
        Orender[c] = O[c] = fsValues[ind];
        if (_.contains(_.keys(renders), c))
            Orender[c] = renders[c](fsValues[ind]);
        t.cell(index + 1, ind + 2, Orender[c]);
    });
});


t.attrRange({
    row: [0, 1]
}, {
    align: "center",
    color: "blue",
    bg: "black"
});

t.attrRange({
    column: [0, 1]
}, {
    color: "green"
});
t.attrRange({
    column: [5, 6],
}, {
    color: "green"
});




t.attrRange({
    column: [1, 2]
}, {
    color: "red",
});

t.attrRange({
    row: [1],
    column: [1]
}, {
    leftPadding: 5
});

console.log("" + t);
