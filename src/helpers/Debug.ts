import { u8 } from 'typed-numbers';
import { Cpu } from '../core';
import { Opcode } from './Opcode';

export class Debug {

	/**
	 * Converts a number into a hex string with zero-padding.
	 * @param num - The number to convert.
	 * @param minLength - Minimum length of the resulting string.
	 */
	public static toHexStr(num: number, minLength = 2) {
		const numStr = num.toString(16).toUpperCase();

		if (numStr.startsWith('-')) return '-' + numStr.substr(1).padStart(minLength, '0');
		return numStr.padStart(minLength, '0');
	}

	/**
	 * Print a CPU operation in a readable way.
	 * Call this method AFTER the next Program Counter advanced.
	 * @param opcode
	 * @param cpu
	 */
	public static printOperation(opcode: u8, cpu: Cpu) {
		console.log(
			`[${Debug.toHexStr(cpu.reg.pc - 1, 4)}]  ` +
			`${Opcode.toString(opcode).padEnd(15, ' ')}` +
			`(SP=${Debug.toHexStr(cpu.reg.sp, 4)} ` +
			`A=${Debug.toHexStr(cpu.reg.a)} ` +
			`F=${Debug.toHexStr(cpu.reg.f)} ` +
			`B=${Debug.toHexStr(cpu.reg.b)} ` +
			`C=${Debug.toHexStr(cpu.reg.c)} ` +
			`D=${Debug.toHexStr(cpu.reg.d)} ` +
			`E=${Debug.toHexStr(cpu.reg.e)} ` +
			`H=${Debug.toHexStr(cpu.reg.h)} ` +
			`L=${Debug.toHexStr(cpu.reg.l)} ` +
			`FLAGS=${cpu.reg.getFlagS() ? 'S' : '.'}` +
			`${cpu.reg.getFlagZ() ? 'Z' : '.'}` +
			`${cpu.reg.getFlagA() ? 'A' : '.'}` +
			`${cpu.reg.getFlagP() ? 'P' : '.'}` +
			`${cpu.reg.getFlagC() ? 'C' : '.'})`,
		);
	}

}
