import { u8 } from 'typed-numbers';

/**
 * Shifts the bits to the left by a specified amount, wrapping the truncated bits to the end of the resulting integer.
 * Please note this isn’t the same operation as the `<<` shifting operator!
 * @param num - The bits (number) to rotate.
 * @param amount - The amount of times to rotate the bits.
 * @param bitLength - The length of the bits.
 */
function rotateBitsLeft(num: number, amount: number, bitLength: 8 | 16 | 32 | 64 | 128) {
	for (let i = 0; i < amount; i++) {
		num = ((num << 1) & ((2 ** bitLength) - 1)) | ((num >> bitLength - 1) & 1);
	}

	return num;
}

export const rotateBitsLeftU8 = (num: u8, amount: number): u8 => u8(rotateBitsLeft(num, amount, 8));

/**
 * Shifts the bits to the right by a specified amount, wrapping the truncated bits to the beginning of the resulting integer.
 * Please note this isn’t the same operation as the `>>` shifting operator!
 * @param num - The bits (number) to rotate.
 * @param amount - The amount of times to rotate the bits.
 * @param bitLength - The length of the bits.
 */
function rotateBitsRight(num: number, amount: number, bitLength: 8 | 16 | 32 | 64 | 128) {
	for (let i = 0; i < amount; i++) {
		num = ((num >>> 1) & ((2 ** bitLength) - 1)) | ((num & 1) << bitLength - 1);
	}

	return num;
}

export const rotateBitsRightU8 = (num: u8, amount: number): u8 => u8(rotateBitsRight(num, amount, 8));
