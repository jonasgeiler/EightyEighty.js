import { u8 } from 'typed-numbers';

/**
 * Handles bit operations.
 */
export class Bit {

	/**
	 * Get bit in `num` at `position`.
	 * @param num - The number to read.
	 * @param position - The position of the bit to return.
	 * @return - The bit as boolean (`0` = `false`, `1` = `true`).
	 */
	public static get(num: u8, position: number): boolean {
		return (num & (1 << position)) != 0;
	}

	/**
	 * Sets the bit in `num` at `position` to `value`.
	 * @param num - The number to modify.
	 * @param position - The position of the bit to set.
	 * @param value - The new bit as boolean (`0` = `false`, `1` = `true`).
	 * @return - The resulting number.
	 */
	public static set(num: u8, position: number, value: boolean): u8 {
		if (value) {
			return u8(num | (1 << position));
		} else {
			return u8(num & ~(1 << position));
		}
	}

	/**
	 * Returns the number of ones in the binary representation of a number.
	 * @param num - The number.
	 * @return - The number of ones.
	 */
	public static countOnes(num: number): number {
		let count = 0;
		while (num) {
			count += num & 1;
			num >>= 1;
		}

		return count;
	}

}
