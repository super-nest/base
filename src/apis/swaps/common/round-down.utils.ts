export const roundDown = (value: number) => {
    const factor = Math.pow(10, 9);

    return Math.floor(value * factor) / factor;
};
