export function getRourcePerf() {
    let entries = performance.getEntries();
    let result = [];
    entries.forEach(item => {
        result.push({
            url: item.name,
            duration: item.duration,
            initiatorTag: item.initiatorType,
            protocol: item.nextHopProtocol
        });
    });
}