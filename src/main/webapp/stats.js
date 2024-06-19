
const StatsModel = {
    Filter: {
        FlightsOnly: function (each) {
            return RecordType.isFlight(each.Type);
        }
    },

    Dimension: {
        AircraftType: function (each) {
            return each.Flight.AircraftType;
        },
        AircraftRegistration: function (each) {
            return each.Flight.AircraftRegistration || 'UNKNOWN';
        },
        Year: function (each) {
            return each.Date.substring(0, 4);
        },
        YearMonth: function (each) {
            return each.Date.substring(0, 7);
        }
    },

    Metric: {
        Count: function (each) {
            return 1;
        },

        TotalTime: function (each) {
            const parsed = parseHHMM(each.Flight.TotalTime);
            return  parsed ? parsed.total/60 : 0;
        }
    }
};

function calcStats(records, filter, dimension, metric) {
    const result = {};

    records.forEach(function (each) {
        if (filter && !filter(each)) {
            return;
        }

        const category = dimension(each);
        const value = metric(each);

        result[category] = (result[category] || 0) + value;
    });

    return result;
}

function showStatsInAlert(stats) {
    let msg = '';
    let total = 0;
    Object.keys(stats).sort().forEach(function(key) {
        msg += key + " -> " + stats[key] + "\n";
        total += stats[key];
    });
    msg += "TOTAL -> " + total;
    console.log(msg);
    alert(msg);
}

function stats_flights_by_aircraft_type() {
    const result = calcStats(records,
        StatsModel.Filter.FlightsOnly,
        StatsModel.Dimension.AircraftType,
        StatsModel.Metric.Count);
    showStatsInAlert(result);
}

function stats_hours_by_aircraft_type() {
    const result = calcStats(records,
        StatsModel.Filter.FlightsOnly,
        StatsModel.Dimension.AircraftType,
        StatsModel.Metric.TotalTime);
    showStatsInAlert(result);
}

function stats_flights_by_aircraft_registration() {
    const result = calcStats(records,
        StatsModel.Filter.FlightsOnly,
        StatsModel.Dimension.AircraftRegistration,
        StatsModel.Metric.Count);
    showStatsInAlert(result);
}

function stats_flights_by_year() {
    const result = calcStats(records,
        StatsModel.Filter.FlightsOnly,
        StatsModel.Dimension.Year,
        StatsModel.Metric.Count);
    showStatsInAlert(result);
}

function stats_flights_by_year_month() {
    const result = calcStats(records,
        StatsModel.Filter.FlightsOnly,
        StatsModel.Dimension.YearMonth,
        StatsModel.Metric.Count);
    showStatsInAlert(result);
}
