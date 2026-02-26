// Test this in your code or in a separate test file
const isValidPHLocalDateTime = (value) => {
    if (!value) return false;
    const str = String(value).trim();
    const phDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;
    
    console.log('Input:', value);
    console.log('String:', str);
    console.log('Regex test:', phDateRegex.test(str));
    
    return phDateRegex.test(str);
};

// Test
console.log(isValidPHLocalDateTime("2026-02-05T14:42")); // Should be TRUE