import formatUnicode from "../formatUnicode";
// Assuming the `formatUnicode` function is added to the String prototype
// Add this test file after the implementation of the `formatUnicode` function

describe('formatUnicode', () => {
    it('should replace placeholders with corresponding values', () => {
        const str = 'Hello, {name}! Today is {day}.';
        const formattedStr = str.formatUnicode({ name: 'Alice', day: 'Monday' });
        expect(formattedStr).toEqual('Hello, Alice! Today is Monday.');
    });

    it('should replace multiple instances of the same placeholder', () => {
        const str = 'The color {color} is a {color}.';
        const formattedStr = str.formatUnicode({ color: 'red' });
        expect(formattedStr).toEqual('The color red is a red.');
    });

    it('should handle placeholders with numeric values', () => {
        const str = 'The number is {0}.';
        const formattedStr = str.formatUnicode(42);
        expect(formattedStr).toEqual('The number is 42.');
    });

    it('should handle missing placeholders', () => {
        const str = 'This is a {0} string.';
        const formattedStr = str.formatUnicode();
        expect(formattedStr).toEqual('This is a {0} string.');
    });
});

