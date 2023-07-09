import capitalize from '../Capitalize';

describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
        const input = 'hello';
        const expectedOutput = 'Hello';
        expect(capitalize(input)).toEqual(expectedOutput);
    });

    it('should convert the rest of the string to lowercase', () => {
        const input = 'WORLD';
        const expectedOutput = 'World';
        expect(capitalize(input)).toEqual(expectedOutput);
    });

    it('should handle empty string and return undefined', () => {
        const input = '';
        const expectedOutput = undefined;
        expect(capitalize(input)).toEqual(expectedOutput);
    });

    it('should handle numbers and convert them to string', () => {
        const input = 123;
        const expectedOutput = '123';
        expect(capitalize(input)).toEqual(expectedOutput);
    });
});

