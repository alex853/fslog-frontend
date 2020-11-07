
function parseHHMM(timeStr) {
    if (timeStr === undefined) {
        return undefined;
    }
    var parts = timeStr.split(':');
    var hhStr = parts[0];
    var mmStr = parts[1];
    if (hhStr.length > 2 || mmStr.length !== 2) {
        return undefined;
    }
    var hh = parseInt(hhStr);
    var mm = parseInt(mmStr);
    if (!(0 <= hh && hh <= 23) || !(0 <= mm && mm <= 59)) {
        return undefined;
    }
    return { h: hh, m: mm, total: hh * 60 + mm };
}

function formatMinutesAsHMM(minutes) {
    var mm = minutes % 60;
    var h = (minutes - mm) / 60;
    return h + ':' + (mm < 10 ? '0' : '') + mm;
}

function formatMinutesAsHHMM(minutes) {
    var mm = minutes % 60;
    var hh = (minutes - mm) / 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
}

function nonEmpty(s) {
    if (!s) {
        return undefined;
    }
    if (s.trim().length === 0) {
        return undefined;
    }
    return s;
}
