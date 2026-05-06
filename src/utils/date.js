const convertPHLocalToUTCISOString = (value) => {
    if (!value) return null;
    
    // If already a Date object, just convert to ISO
    if (value instanceof Date) {
        return value.toISOString();
    }
    
    // If it's a string, parse it
    let dateTimeStr = String(value).trim();
    
    // Add seconds if not present
    if (dateTimeStr.split(':').length === 2) {
        dateTimeStr += ':00';
    }
    
    // Add timezone offset for PH (UTC+8)
    // This tells JavaScript to interpret the time as PH time
    const phDate = new Date(dateTimeStr + '+08:00');
    
    return phDate.toISOString();
};

module.exports = convertPHLocalToUTCISOString;