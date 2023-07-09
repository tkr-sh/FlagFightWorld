import randomChoice from '../randomChoice';

describe('randomChoice', () => {
    it('should return a random element from the array', () => {
        const input = [1, 2, 3, 4, 5];
        const output = randomChoice(input);
        expect(input).toContain(output);
    });

    it('should return undefined for an empty array', () => {
        const input = [];
        const output = randomChoice(input);
        expect(output).toBeUndefined();
    });

    it('should handle string arrays', () => {
        const input = ['apple', 'banana', 'orange'];
        const output = randomChoice(input);
        expect(input).toContain(output);
    });

    it('should handle object arrays', () => {
        const input = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 3, name: 'Alice' }
        ];
        const output = randomChoice(input);
        expect(input).toContain(output);
    });
});

