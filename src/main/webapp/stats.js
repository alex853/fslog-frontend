
const StatsModel= {
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
        Count: function () {
            return 1;
        },

        TotalTime: function (each) {
            const parsed = parseHHMM(each.Flight.TotalTime);
            return parsed ? parsed.total / 60 : 0;
        }
    }
}

const StatsCharts = {
    'flights-by-type': {
        label: 'Flights by aircraft type',
        filter: StatsModel.Filter.FlightsOnly,
        dimension: StatsModel.Dimension.AircraftType,
        metric: StatsModel.Metric.Count
    },
    'hours-by-type': {
        label: 'Hours by aircraft type',
        filter: StatsModel.Filter.FlightsOnly,
        dimension: StatsModel.Dimension.AircraftType,
        metric: StatsModel.Metric.TotalTime
    },
    'flights-by-tail': {
        label: 'Flights by aircraft tail #',
        filter: StatsModel.Filter.FlightsOnly,
        dimension: StatsModel.Dimension.AircraftRegistration,
        metric: StatsModel.Metric.Count
    },
    'flights-by-year': {
        label: 'Flights by year',
        filter: StatsModel.Filter.FlightsOnly,
        dimension: StatsModel.Dimension.Year,
        metric: StatsModel.Metric.Count
    },
    'flights-by-year-month': {
        label: 'Flights by year/month',
        filter: StatsModel.Filter.FlightsOnly,
        dimension: StatsModel.Dimension.YearMonth,
        metric: StatsModel.Metric.Count
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

function statsCalcDataByChartId(chartId) {
    const chart = StatsCharts[chartId];
    return {
        label: chart.label,
        data: calcStats(records,
            chart.filter,
            chart.dimension,
            chart.metric)
    };
}

function statsOpenModal() {
    statsDrawChart('flights-by-type');

    $('#chartsModal').modal();
}

let statsShownChart;

function statsDrawChart(chartId) {
    const stats = statsCalcDataByChartId(chartId);

    const data = [];

    Object.keys(stats.data).sort().forEach(function (category) {
        data.push({ category: category, value: stats.data[category] });
    });

    if (statsShownChart) {
        statsShownChart.destroy();
    }

    statsShownChart = new Chart(
        document.getElementById('chartCanvas'),
        {
            type: 'bar',
            data: {
                labels: data.map(row => row.category),
                datasets: [
                    {
                        label: stats.label,
                        data: data.map(row => row.value)
                    }
                ]
            }
        }
    );
}
