

function joinDiscontinuityClicked(recordId) {
    const record = findRecordById(recordId);
    const index = records.indexOf(record);

    const previousRecord = records[index - 1];
    const nextRecord = records[index + 1];

    const result = Checks.checkCompatibility(new Record(previousRecord), new Record(nextRecord));
    if (!result.success) {
        alert('Unable to remove the discontinuity record due to conditions'); // todo explanation dialog
        return;
    }

    const confirmed = confirm('Please confirm that the discontinuity record should be deleted'); // todo confirmation dialog
    if (!confirmed) {
        return;
    }

    $.ajax({
        url: gatewayUrl,
        method: 'DELETE',
        dataType: 'json',
        data: JSON.stringify({
            "UserID": record["UserID"],
            "BeginningDT": record["BeginningDT"]
        }),
        success: function (response) {/**/
            showAlert("Discontinuity removed successfully", "success", 5000);

            records.splice(index, 1);

            const newVisibleEntries = Flightlog.buildVisibleEntries(records);
            const diff = Flightlog.buildDiff(newVisibleEntries, visibleEntries).removed;

            for (let i in diff) {
                const curr = diff[i];
                const currElement = Flightlog.findElementByEntry(curr);
                Flightlog.removeElement(currElement);
            }

            visibleEntries = newVisibleEntries;

        },
        error: function (e) {
            showAlert("Error happened!", "danger", 15000);
            console.log(e.responseText);
        }
    });/**/
}
