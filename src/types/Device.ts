import { u8 } from 'typed-numbers';

/**
 * TODO: Description
 */
export interface Device {

	/**
	 * Handle input
	 * @param port
	 */
	input(port: u8): u8;

	/**
	 * Handle output
	 * @param port
	 * @param byte
	 */
	output(port: u8, byte: u8): void;

}
