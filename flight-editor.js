var FlightEditor = {
    onAddClicked: function (index) {
        var previousRecord = records[index];

        var isPreviousFlight = RecordType.isFlight(previousRecord['Type']);

        var dialog = $('#flightEditorModal');
        dialog.action = 'add-flight';

        dialog.find('.modal-title').text('Add Flight');

        var isLast = index === records.length - 1;

        if (isLast) {
            $('#flightEditorModal-dateOfFlight').val(new Date().toISOString().split('T')[0]);
        } else {
            $('#flightEditorModal-dateOfFlight').val(undefined);
        }
        $('#flightEditorModal-callsign').val(isPreviousFlight ? previousRecord['Callsign'] : undefined);
        $('#flightEditorModal-flightNumber').val(isPreviousFlight ? previousRecord['FlightNumber'] : undefined);
        $('#flightEditorModal-aircraftType').val(isPreviousFlight ? previousRecord['AircraftType'] : undefined);
        $('#flightEditorModal-aircraftRegistration').val(isPreviousFlight ? previousRecord['AircraftRegistration'] : undefined);
        if (RecordType.isFlightOrTransfer(previousRecord['Type'])) {
            $('#flightEditorModal-departure').val(previousRecord['Destination']);
            $('#flightEditorModal-departure').prop('disabled', true);
        } else {
            $('#flightEditorModal-departure').val(undefined);
            $('#flightEditorModal-departure').prop('disabled', false);
        }
        $('#flightEditorModal-destination').val(undefined);

        dialog.modal();
    },

    updateCrowFlightDistance: function () {
        var from = nonEmpty($('#flightEditorModal-departure').val());
        var to = nonEmpty($('#flightEditorModal-destination').val());

        $.ajax({
            url: distanceUrl + '/v1/distance?from=$from$&to=$to$'.replace('$from$', from.toUpperCase()).replace('$to$', to.toUpperCase()),
            method: 'GET',
            success: function (response) {
                var distanceStr = response;
                $('#flightEditorModal-crowFlightDistance').val(distanceStr);
            },
            error: function (e) {
                $('#flightEditorModal-crowFlightDistance').val("N/A");
            }
        });
    },

    updateDuration: function () {
        var timeOut = parseHHMM(nonEmpty($('#flightEditorModal-timeOut').val()));
        var timeIn = parseHHMM(nonEmpty($('#flightEditorModal-timeIn').val()));

        var durationStr = null;
        if (timeOut !== undefined && timeIn !== undefined) {
            var durationMinutes = timeIn['total'] - timeOut['total'];  // todo code duplication
            if (durationMinutes < 0) {
                durationMinutes += 24 * 60;
            }
            durationStr = formatMinutesAsHMM(durationMinutes);
        }
        $('#flightEditorModal-duration').val(durationStr);
    },


    apply: function () {
        var dialog = $('#flightEditorModal');
        var action = dialog.action;

        var form = $('#flightEditorModal-form')[0];
        var valid = form.checkValidity();
        form.classList.add('was-validated');
        if (!valid) {
            return;
        }

        dialog.modal('hide');

        var flight = {
            "UserID": 1,
            "BeginningDT": $('#flightEditorModal-dateOfFlight').val() + 'T' + $('#flightEditorModal-timeOut').val() + ':00',
            "Type": "flight",
            "Date": $('#flightEditorModal-dateOfFlight').val(),
            "Callsign": nonEmptyUpperCase($('#flightEditorModal-callsign').val()),
            "FlightNumber": nonEmptyUpperCase($('#flightEditorModal-flightNumber').val()),
            "AircraftType": nonEmptyUpperCase($('#flightEditorModal-aircraftType').val()),
            "AircraftRegistration": nonEmptyUpperCase($('#flightEditorModal-aircraftRegistration').val()),
            "Departure": nonEmptyUpperCase($('#flightEditorModal-departure').val()),
            "Destination": nonEmptyUpperCase($('#flightEditorModal-destination').val()),
            "TimeOut": nonEmpty($('#flightEditorModal-timeOut').val()),
            "TimeOff": nonEmpty($('#flightEditorModal-timeOff').val()),
            "TimeOn": nonEmpty($('#flightEditorModal-timeOn').val()),
            "TimeIn": nonEmpty($('#flightEditorModal-timeIn').val()),
            "Duration": nonEmpty($('#flightEditorModal-duration').val()),
            "Distance": nonEmpty($('#flightEditorModal-distance').val()),
            "Comment": nonEmpty($('#flightEditorModal-comment').val()),
            "Remarks": nonEmpty($('#flightEditorModal-remarks').val())
        };

        $.ajax({
            url: gatewayUrl,
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(flight),
            success: function (response) {
                showAlert("Flight added successfully", "success", 5000);
                // todo add flight to grid and update grid
            },
            error: function (e) {
                showAlert("Error happened!", "danger", 15000);
                console.log(e.responseText);
            }
        });
    }
}

$(document).ready(function () {
    $('#flightEditorModal-departure').keyup(function () {
        FlightEditor.updateCrowFlightDistance();
    });

    $('#flightEditorModal-destination').keyup(function () {
        FlightEditor.updateCrowFlightDistance();
    });

    $('#flightEditorModal-timeOut').change(function () {
        FlightEditor.updateDuration();
    });

    $('#flightEditorModal-timeIn').change(function () {
        FlightEditor.updateDuration();
    });
});
