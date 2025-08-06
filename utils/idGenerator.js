const EPOCH = 1704067200000; // January 1, 2024
let sequence = 0;
let lastTimestamp = -1;
const workerId = 1;

/**
 * Generates a unique, time-sortable 53-bit ID that is safe
 * to use as a standard JavaScript Number.
 */
function nextId() {
    let timestamp = Date.now();

    if (timestamp < lastTimestamp) {
        throw new Error(`Clock moved backwards. Refusing to generate ID.`);
    }

    if (lastTimestamp === timestamp) {
        sequence = (sequence + 1) & 127; // 127 is max for 7 bits
        if (sequence === 0) {
            while (timestamp <= lastTimestamp) {
                timestamp = Date.now();
            }
        }
    } else {
        sequence = 0;
    }

    lastTimestamp = timestamp;

    const id =
        ((timestamp - EPOCH) * Math.pow(2, 12)) +
        (workerId * Math.pow(2, 7)) +
        sequence;

    return id;
}

module.exports = { nextId };