
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

function nonEmptyUpperCase(s) {
    if (!s) {
        return undefined;
    }
    if (s.trim().length === 0) {
        return undefined;
    }
    return s.toUpperCase();
}

var RecordType = {
    isFlight: function (type) {
        return (type !== 'transfer') && (type !== 'discontinuity');
    },

    isTransfer: function (type) {
        return type === 'transfer';
    },

    isDiscontinuity: function (type) {
        return type === 'discontinuity';
    },

    isFlightOrTransfer: function (type) {
        return this.isFlight(type) || this.isTransfer(type);
    }
}

class Record {
    constructor(record) {
        this.record = record;
    }

    get range() {
        var from = new Date(this.record['BeginningDT']);
        var to;

        if (this.isFlight() || this.isTransfer()) {
            var timeOutStr = this.record['TimeOut'];
            var timeInStr = this.record['TimeIn'];

            var timeOut = parseHHMM(timeOutStr);
            var timeIn = parseHHMM(timeInStr);

            var durationMinutes = timeIn['total'] - timeOut['total'];
            if (durationMinutes < 0) {  // todo code duplication
                durationMinutes += 24 * 60;
            }

            to = new Date(from);
            to.setMinutes(to.getMinutes() + durationMinutes);
        } else if (this.isDiscontinuity()) {
            to = from;
        } else {
            throw new Error('Unknown type of record');
        }

        return new Range(from, to);
    }

    get departure() {
        if (this.isFlight() || this.isTransfer()) {
            return this.record['Departure'];
        } else {
            throw new Error('Departure is not available');
        }
    }

    get destination() {
        if (this.isFlight() || this.isTransfer()) {
            return this.record['Destination'];
        } else {
            throw new Error('Destination is not available');
        }
    }

    isFlight() {
        return RecordType.isFlight(this.record['Type'])
    }

    isTransfer() {
        return RecordType.isTransfer(this.record['Type'])
    }

    isDiscontinuity() {
        return RecordType.isDiscontinuity(this.record['Type'])
    }
}

class Range {
    #from;
    #to;

    constructor(from, to) {
        this.#from = from;
        this.#to = to;
    }

    get from() {
        return this.#from;
    }

    get to() {
        return this.#to;
    }

    isDateWithin(date) {
        return (this.#from < date) && (date < this.#to);
    }
}

const Checks = {
    const: ok = {
        success: true
    },

    checkCompatibility: function (record1, record2) {
        const locationCheck = this.doLocationCheck(record1, record2);

        const rangeCheck = this.doRangeCheck(record1, record2);

        return {
            success: locationCheck.success && rangeCheck.success,
            location: locationCheck,
            range: rangeCheck
        };
    },

    //     F  T  D
    //  F  L  L  x
    //  T  L  L  x
    //  D  x  x  x
    doLocationCheck: function (record1, record2) {
        if (record1.isDiscontinuity() || record2.isDiscontinuity()) {
            return ok;
        }

        const destination1 = record1.destination;
        const departure2 = record2.departure;

        if (destination1 === departure2) {
            return ok;
        } else {
            return {
                success: false,
                message: 'Destination ' + destination1 + ' of previous record and departure ' + departure2 + ' of next record do not match'
            };
        }
    },

    doRangeCheck: function (record1, record2) {
        const range1 = record1.range;
        const range2 = record2.range;

        if (range1.isDateWithin(range2.from)
            || range1.isDateWithin(range2.to)
            || range2.isDateWithin(range1.from)
            || range2.isDateWithin(range1.to)) {
            return {
                success: false,
                message: 'Range overlapping found'
            };
        }

        return ok;
    }
}
