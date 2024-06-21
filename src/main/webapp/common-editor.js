
function insertRecordAfterAndUpdateFlightlog(previousRecord, newRecord) {
    if (previousRecord === null) {
        records.splice(0, 0, newRecord);
    } else {
        const index = records.indexOf(previousRecord);
        records.splice(index+1, 0, newRecord);
    }

    const newVisibleEntries = Flightlog.buildVisibleEntries(records);
    const diff = Flightlog.buildDiff(newVisibleEntries, visibleEntries).added;

    for (let i in diff) {
        const curr = diff[i];
        const prev = newVisibleEntries[newVisibleEntries.indexOf(curr)-1]; // todo ak support when the very first element changed
        const prevElement = Flightlog.findElementByEntry(prev);
        Flightlog.insertElementAfter(curr, prevElement);
    }

    visibleEntries = newVisibleEntries;
}
