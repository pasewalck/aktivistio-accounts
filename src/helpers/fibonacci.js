/**
 * @description Generates an array of the Fibonacci sequence
 * @param {number} limit - Generate Fibonacci sequence up to this point
 * @returns {Array<number>} An array of the Fibonacci sequence
 */
export function fibonacciArray(limit) {
    // Initialize Fibonacci array and populate up to certain point
    var fibonacciArray = [];
    for (let i = 0; limit > fibonacciArray[i]; i++) 
    {
        if(i == 0)
            fibonacciArray.push(0)
        else if(i == 1)
            fibonacciArray.push(1)
        else
            fibonacciArray.push(fibonacciArray[i - 1] + fibonacciArray[i - 2]);
    }
    return fibonacciArray;
}