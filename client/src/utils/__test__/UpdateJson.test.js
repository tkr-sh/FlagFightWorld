import { updateJson } from "../UpdateJson.js";

describe('updateJson', () => {
  it('should update the JSON object with new properties', () => {
    const origin = { name: 'John', age: 25 };
    const to = { age: 26, city: 'New York' };

    const updatedJson = updateJson(origin, to);

    expect(updatedJson).toEqual({ name: 'John', age: 26, city: 'New York' });
  });

  it('should create a new JSON object when the origin is an empty object', () => {
    const origin = {};
    const to = { name: 'Alice', age: 30 };

    const updatedJson = updateJson(origin, to);

    expect(updatedJson).toEqual({ name: 'Alice', age: 30 });
  });

  it('should not modify the original JSON object', () => {
    const origin = { name: 'Jane', age: 35 };
    const to = { city: 'London' };

    updateJson(origin, to);

    expect(origin).toEqual({ name: 'Jane', age: 35 });
  });
});

