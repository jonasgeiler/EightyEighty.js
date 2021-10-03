import { u16, u8 } from 'typed-numbers';

export class ConditionCodes {

	/**
	 * Z (zero).
	 * Set to true when the result is equal to zero.
	 * @protected
	 */
	public z: boolean = false;

	/**
	 * S (sign).
	 * Set to true when bit 7 (the most significant bit or MSB) of the math instruction is set.
	 * @protected
	 */
	public s: boolean = false;

	/**
	 * CY (carry).
	 * Set to true when the instruction resulted in a carry out or borrow into the high order bit.
	 * @protected
	 */
	public cy: boolean = false;

	/**
	 * P (parity).
	 * Set to true when the answer has even parity, clear when odd parity.
	 * @protected
	 */
	public p: boolean = false;

	/**
	 * AC (auxillary carry).
	 * Is used mostly for BCD (binary coded decimal) math.
	 * @protected
	 */
	public ac: boolean = false;


	/**
	 * Set the Z (zero) flag.
	 * @param answer - Result from an operation.
	 */
	public setZ(answer: u16) {
		this.z = (answer & 0xff) == 0;
	}

	/**
	 * Set the S (sign) flag.
	 * @param answer - Result from an operation.
	 */
	public setS(answer: u16) {
		this.s = (answer & 0x80) != 0;
	}

	/**
	 * Set the CY (carry) flag.
	 * @param answer - Result from an operation.
	 */
	public setCY(answer: u16) {
		this.cy = answer > 0xff;
	}

	/**
	 * Set the P (parity) flag.
	 * @param answer - Result from an operation.
	 */
	public setP(answer: u16) {
		this.p = ConditionCodes.PARITY_TABLE[u8(answer)];
	}

	/**
	 * Set the AC (auxillary carry) flag.
	 * @param acCheck
	 */
	public setAC(acCheck: u8) {
		this.ac = acCheck > 0xf;
	}

	/**
	 * Set all flags.
	 * @param answer - Result from an operation.
	 * @param acCheck
	 */
	public setAll(answer: u16, acCheck: u8) {
		this.setAllExceptCarry(answer, acCheck);
		this.setCY(answer);
	}

	/**
	 * Set all except the CY (carry) flag.
	 * @param answer - Result from an operation.
	 * @param acCheck
	 */
	public setAllExceptCarry(answer: u16, acCheck: u8) {
		this.setZ(answer);
		this.setS(answer);
		this.setP(answer);
		this.setAC(acCheck);
	}

	/**
	 * Set all except the AC (auxillary carry) flag.
	 * @param answer - Result from an operation.
	 */
	public setAllExceptAC(answer: u16) {
		this.setZ(answer);
		this.setS(answer);
		this.setP(answer);
		this.setCY(answer);
	}

	/**
	 * Parity table for the P (parity) flag.
	 * @protected
	 */
	protected static readonly PARITY_TABLE = [
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
		true, false, false, true, false, true, true, false,
		true, false, false, true, false, true, true, false,
		false, true, true, false, true, false, false, true,
	];

	/**
	 * For debug purposes.
	 */
	public toString(): string {
		return (this.z ? 'Z' : '.') +
		       (this.s ? 'S' : '.') +
		       (this.cy ? 'C' : '.') +
		       (this.p ? 'P' : '.') +
		       (this.ac ? 'A' : '.');
	}

}
