/**
 * Converts a number into a hex string with zero-padding.
 * @param num - The number to convert.
 * @param minLength - Minimum length of the resulting string.
 */
export function toHexStr(num: number, minLength = 2) {
	const numStr = num.toString(16).toUpperCase();

	if (numStr.startsWith('-')) return '-' + numStr.substr(1).padStart(minLength, '0');
	return numStr.padStart(minLength, '0');
}
