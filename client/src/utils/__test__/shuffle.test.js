// Assuming the `shuffle` function is added to the Array prototype
// Add this test file after the implementation of the `shuffle` function
import "../shuffle";

describe('shuffle', () => {
    it('should shuffle the elements of the array', () => {
        const input = [1, 2, 3, 4, 5];
        const originalArray = [...input];
        input.shuffle();

        // Check if the array is still the same length
        expect(input.length).toBe(originalArray.length);

        // Check if the array contains the same elements, regardless of the order
        input.forEach(element => {
            expect(originalArray).toContain(element);
        });

        // Check if the array is actually shuffled by comparing it to the original
        expect(input).not.toEqual(originalArray);
    });

    it('should handle an empty array', () => {
        const input = [];
        input.shuffle();
        expect(input).toEqual([]);
    });

    it('should handle arrays with a single element', () => {
        const input = ['apple'];
        const originalArray = [...input];
        input.shuffle();
        expect(input).toEqual(originalArray);
    });
});

