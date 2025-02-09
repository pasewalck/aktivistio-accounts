import { AlphanumericCleaned } from "./character-arrays.js";
import { getRandomCharFromString } from "./generate-secrets.js";

const tokenTemplate = "xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx"

/**
 * @description returns a recovery string in a recovery token format
 * @returns {String}
 */
export const generateRecoveryToken = () => {
    let token = [];
    for (let i = 0; i < tokenTemplate.length; i++) {
        token.push(tokenTemplate[i] != "x" ? tokenTemplate[i] : getRandomCharFromString(Object.values(AlphanumericCleaned).join('')))
    }
    return token.join('');
};
/**
 * @description returns a true or false based on if a recovery token fits the format
 * @returns {String}
 */
export const isRecoveryToken = (string) => {
    if(string.length != tokenTemplate.length)
        return false
    for (let i = 0; i < tokenTemplate.length; i++) {
        if(tokenTemplate[i] != "x" ? string[i] != tokenTemplate[i] : !Object.values(AlphanumericCleaned).join('').includes(string[i]))
            return false
    }
    return true
}