import { u16, u8 } from 'typed-numbers';
import { Bit } from '../helpers';

export enum Flag {

	/** Sign flag. */
	S = 7,

	/** Zero flag. */
	Z = 6,

	/** Auxiliary Carry flag (also called AC). */
	A = 4,

	/** Parity flag. */
	P = 2,

	/** Carry flag. */
	C = 0,

}

/**
 * Represents the register inside the CPU.
 */
export class Register {

	/** Accumulator (register A). */
	public a = 0 as u8;

	/** F register (indirectly accessible by the programmer). */
	public f = 0b0000_0010 as u8;

	/** B register. */
	public b = 0 as u8;

	/** C register. */
	public c = 0 as u8;

	/** D register. */
	public d = 0 as u8;

	/** E register. */
	public e = 0 as u8;

	/** H register. */
	public h = 0 as u8;

	/** L register. */
	public l = 0 as u8;

	/** 16-bit stack pointer register. */
	public sp = 0 as u16;

	/** Program counter. */
	public pc = 0 as u16;


	/**
	 * Get register A and F paired.
	 * @return - The value of register A and F combined into one integer.
	 */
	public getAF(): u16 {
		return u16((this.a << 8) | this.f);
	}

	/**
	 * Get register B and C paired.
	 * @return - The value of register B and C combined into one integer.
	 */
	public getBC(): u16 {
		return u16((this.b << 8) | this.c);
	}

	/**
	 * Get register D and E paired.
	 * @return - The value of register D and E combined into one integer.
	 */
	public getDE(): u16 {
		return u16((this.d << 8) | this.e);
	}

	/**
	 * Get register H and L paired.
	 * @return - The value of register H and L combined into one integer.
	 */
	public getHL(): u16 {
		return u16((this.h << 8) | this.l);
	}


	/**
	 * Set register A and F paired.
	 * @param value - The new value of register A. The new value of register F will be calculated from it.
	 */
	public setAF(value: u16) {
		this.a = u8(value >> 8);
		this.f = u8(value & 0x00d5 | 0x0002);
	}

	/**
	 * Set register B and C paired.
	 * @param value - The new value of register B and C combined into one integer.
	 */
	public setBC(value: u16) {
		this.b = u8(value >> 8);
		this.c = u8(value & 0x00ff);
	}

	/**
	 * Set register D and E paired.
	 * @param value - The new value of register D and E combined into one integer.
	 */
	public setDE(value: u16) {
		this.d = u8(value >> 8);
		this.e = u8(value & 0x00ff);
	}

	/**
	 * Set register H and L paired.
	 * @param value - The new value of register H and L combined into one integer.
	 */
	public setHL(value: u16) {
		this.h = u8(value >> 8);
		this.l = u8(value & 0x00ff);
	}


	/**
	 * Set the value of a flag.
	 * @param flag - The flag.
	 * @param value - The new value.
	 */
	public setFlag(flag: Flag, value: boolean) {
		this.f = Bit.set(this.f, flag, value);
	}

	/**
	 * Get the value of a flag.
	 * @param flag - The flag.
	 */
	public getFlag(flag: Flag): boolean {
		return Bit.get(this.f, flag);
	}


	/**
	 * Helper for setting S flag straight from the result of a calculation.
	 * @param result - Result of a calculation.
	 */
	public setFlagS(result: u8) {
		this.setFlag(Flag.S, Bit.get(result, 7));
	}

	/**
	 * Helper for setting Z flag straight from the result of a calculation.
	 * @param result - Result of a calculation.
	 */
	public setFlagZ(result: u8) {
		this.setFlag(Flag.Z, result == 0x00);
	}

	/**
	 * Helper for setting A flag.
	 * @param value - The new value.
	 */
	public setFlagA(value: boolean) {
		this.setFlag(Flag.A, value);
	}

	/**
	 * Helper for setting P flag straight from the result of a calculation.
	 * @param result - Result of a calculation.
	 */
	public setFlagP(result: u8) {
		this.setFlag(Flag.P, (Bit.countOnes(result) & 0x01) == 0x00);
	}

	/**
	 * Helper for setting C flag.
	 * @param value - The new value.
	 */
	public setFlagC(value: boolean) {
		this.setFlag(Flag.C, value);
	}


	/**
	 * Helper for getting S flag.
	 */
	public getFlagS(): boolean {
		return this.getFlag(Flag.S);
	}

	/**
	 * Helper for getting Z flag.
	 */
	public getFlagZ(): boolean {
		return this.getFlag(Flag.Z);
	}

	/**
	 * Helper for getting A flag.
	 */
	public getFlagA(): boolean {
		return this.getFlag(Flag.A);
	}

	/**
	 * Helper for getting P flag.
	 */
	public getFlagP(): boolean {
		return this.getFlag(Flag.P);
	}

	/**
	 * Helper for getting C flag.
	 */
	public getFlagC(): boolean {
		return this.getFlag(Flag.C);
	}

}
