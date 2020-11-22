var DiscontinuityEditor = {
    onAddClicked: function (index) {
        var previousRecord = records[index];

        var dialog = $('#discontinuityEditorModal');
        dialog.action = 'add-discontinuity';

        dialog.find('.modal-title').text('Add Discontinuity');

        var isLast = index === records.length - 1;

        if (isLast) {
            $('#discontinuityEditorModal-date').val(new Date().toISOString().split('T')[0]);
        } else {
            $('#discontinuityEditorModal-date').val(undefined);
        }

        dialog.modal();
    },

    apply: function () {
        var dialog = $('#discontinuityEditorModal');
        var action = dialog.action;

        var form = $('#discontinuityEditorModal-form')[0];
        var valid = form.checkValidity();
        form.classList.add('was-validated');
        if (!valid) {
            return;
        }

        dialog.modal('hide');

        var transfer = {
            "UserID": 1,
            "BeginningDT": $('#discontinuityEditorModal-date').val() + 'T' + $('#discontinuityEditorModal-time').val() + ':00',
            "Type": "discontinuity",
            "Date": $('#discontinuityEditorModal-date').val(),
            "Time": nonEmpty($('#discontinuityEditorModal-time').val()),
            "Comment": nonEmpty($('#discontinuityEditorModal-comment').val()),
            "Remarks": nonEmpty($('#discontinuityEditorModal-remarks').val())
        };

        $.ajax({
            url: gatewayUrl,
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(transfer),
            success: function (response) {
                showAlert("Discontinuity added successfully", "success", 5000);
                // todo add transfer to grid and update grid
            },
            error: function (e) {
                showAlert("Error happened!", "danger", 15000);
                console.log(e.responseText);
            }
        });
    }
}