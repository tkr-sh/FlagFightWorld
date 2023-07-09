const capitalize = str => str ? str.toString().charAt(0).toUpperCase() + str.toString().slice(1).toLowerCase() : undefined;

export default capitalize;