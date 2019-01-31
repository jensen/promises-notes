module.exports = (input) => input.split('').map((c, i) => i === 0 ? c.toUpperCase() : c).join('');
