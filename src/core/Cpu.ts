import { u16, u8 } from 'typed-numbers';
import { Bit, Opcode } from '../helpers';
import { toHexStr } from '../utils';
import { Memory } from './Memory';
import { Register } from './Register';

/**
 * Represents the Intel 8080 CPU.
 */
export class Cpu {

	/** Clock Frequency. */
	public static readonly CLOCK_FREQUENCY = 2_000_000;

	/** Time a single step takes in milliseconds. */
	public static readonly STEP_TIME = 16;

	/** Amount of CPU cycles a single step takes. */
	public static readonly STEP_CYCLES = (Cpu.STEP_TIME / (1000 / Cpu.CLOCK_FREQUENCY));


	/** CPU Register. */
	public reg = new Register();

	/** CPU Memory. */
	public mem: Memory;

	/** Whether the CPU is halted. */
	public halted = false;

	/** TODO: Description */
	public intEnabled = false;


	/** Keeps track of the amount CPU cycles of the current step. */
	protected stepCycles = 0;

	/** Keeps track of the start time of a step. */
	protected stepZero = Date.now();


	/**
	 * Constructor.
	 * @param mem - An instance of the Memory class, with the program already loaded in.
	 */
	constructor(mem: Memory) {
		this.mem = mem;
	}

	public next() {
		if (this.halted) return 0;

		const opcode = this.getNextByte();

		console.log(
			`[${toHexStr(this.reg.pc - 1, 4)}]  ` +
			`${Opcode.toString(opcode).padEnd(15, ' ')}` +
			`(SP=${toHexStr(this.reg.sp, 4)} ` +
			`A=${toHexStr(this.reg.a)} ` +
			`F=${toHexStr(this.reg.f)} ` +
			`B=${toHexStr(this.reg.b)} ` +
			`C=${toHexStr(this.reg.c)} ` +
			`D=${toHexStr(this.reg.d)} ` +
			`E=${toHexStr(this.reg.e)} ` +
			`H=${toHexStr(this.reg.h)} ` +
			`L=${toHexStr(this.reg.l)} ` +
			`FLAGS=${this.reg.getFlagS() ? 'S' : '.'}` +
			`${this.reg.getFlagZ() ? 'Z' : '.'}` +
			`${this.reg.getFlagA() ? 'A' : '.'}` +
			`${this.reg.getFlagP() ? 'P' : '.'}` +
			`${this.reg.getFlagC() ? 'C' : '.'})`,
		);

		let extraCycles = 0;
		switch (opcode) {
			/** NOP */
			case 0x00:
			case 0x08:
			case 0x10:
			case 0x18:
			case 0x20:
			case 0x28:
			case 0x30:
			case 0x38:
				break;

			default:
				throw new Cpu.UnimplementedInstructionError(opcode);
		}

		return Opcode.getCycles(opcode) + extraCycles;
	}

	/**
	 * Simulates a real CPU step with the Intel 8080's speed.
	 */
	public async step() {
		if (this.stepCycles > Cpu.STEP_CYCLES) {
			this.stepCycles -= Cpu.STEP_CYCLES;

			const duration = Date.now() - this.stepZero;
			const delay = Cpu.STEP_TIME - duration;

			console.log(`CPU: sleep ${delay}ms`);
			await new Promise(resolve => setTimeout(resolve, delay)); // Delay

			this.stepZero = this.stepZero + Cpu.STEP_TIME;
		}

		const cycles = this.next();
		this.stepCycles += cycles;

		return cycles;
	}

	public handleIntEnabled(address: u16) {
		if (this.intEnabled) {
			this.intEnabled = false;
			this.stackAdd(this.reg.pc);
			this.reg.pc = address;
			this.stepCycles += Opcode.getCycles(0xcd as u8);
		}
	}


	/************************
	 * IMMEDIATE ADDRESSING *
	 ************************/

	/**
	 * Returns the byte at the program counter and moves the program counter forwards by 1.
	 */
	public getNextByte(): u8 {
		const value = this.mem.get(this.reg.pc);
		this.reg.pc = u16(this.reg.pc + 1);

		return value;
	}

	/**
	 * Returns the word at the program counter and moves the program counter forwards by 2.
	 */
	public getNextWord(): u16 {
		const value = this.mem.getWord(this.reg.pc);
		this.reg.pc = u16(this.reg.pc + 2);

		return value;
	}


	/*******************
	 * MEMORY REGISTER *
	 *******************/

	/**
	 * Get value of register M, which is just the memory.
	 */
	public getM(): u8 {
		const address = this.reg.getHL();

		return this.mem.get(address);
	}

	/**
	 * Set value of register M, which is just the memory.
	 * @param value - The new value.
	 */
	public setM(value: u8) {
		const address = this.reg.getHL();

		this.mem.set(address, value);
	}


	/********************
	 * STACK OPERATIONS *
	 ********************/

	/**
	 * Add a value to the top stack.
	 * @param value - The value to add.
	 */
	public stackAdd(value: u16) {
		this.reg.sp = u16(this.reg.sp - 2);
		this.mem.setWord(this.reg.sp, value);
	}

	/**
	 * Pop a value from the top of the stack.
	 * @return - The value from the stack.
	 */
	public stackPop(): u16 {
		const value = this.mem.getWord(this.reg.sp);
		this.reg.sp = u16(this.reg.sp + 2);

		return value;
	}


	/******************
	 * ALU OPERATIONS *
	 ******************/

	/** */
	public inr(num: u8): u8 {
		const result = u8(num + 1);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA((num & 0x0f) + 0x01 > 0x0f);

		return result;
	}

	public dcr(num: u8): u8 {
		const result = u8(num - 1);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA((result & 0x0f) != 0x0f);

		return result;
	}

	public daa() {
		let accumulator = 0 as u8;
		let flagC = this.reg.getFlagC();

		const lsb = this.reg.a & 0xf;
		const msb = (this.reg.a >> 4) & 0xf;

		// If the least significant four bits of the accumulator represents a number greater than 9, or if the auxiliary carry flag is active, ...
		if ((lsb > 9) || this.reg.getFlagA()) {
			// ... the least significant four bits of the accumulator are incremented by six.
			accumulator = u8(accumulator + 0x06);
		}

		// If the most significant four bits of the accumulator now represent a number greater than 9, or if the carry flag is active, ...
		if ((msb > 9) || this.reg.getFlagC() || (msb >= 9 && lsb > 9)) {
			// ... the most significant four bits of the accumulator are incremented by six.
			accumulator = u8(accumulator + 0x60);
			flagC = true;
		}

		this.add(accumulator);
		this.reg.setFlagC(flagC);
	}

	public add(num: u8) {
		const regA = this.reg.a;
		const result = u8(regA + num);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA((regA & 0x0f) + (num & 0x0f) > 0x0f);
		this.reg.setFlagC(regA + num > 0xff);

		this.reg.a = result;
	}

	public adc(num: u8) {
		const flagC = +this.reg.getFlagC();
		const regA = this.reg.a;
		const result = u8(regA + num + flagC);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA((regA & 0x0f) + (num & 0x0f) + flagC > 0x0f);
		this.reg.setFlagC(regA + num + flagC > 0xff);

		this.reg.a = result;
	}

	public sub(num: u8) {
		const regA = this.reg.a;
		const result = u8(regA - num);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA((regA & 0x0f) - (num & 0x0f) >= 0x00);
		this.reg.setFlagC(regA < num);

		this.reg.a = result;
	}

	public sbb(num: u8) {
		const flagC = +this.reg.getFlagC();
		const regA = this.reg.a;
		const result = u8(regA - num - flagC);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA((regA & 0x0f) - (num & 0x0f) - flagC >= 0x00);
		this.reg.setFlagC(regA < num + flagC);

		this.reg.a = result;
	}

	public ana(num: u8) {
		const result = u8(this.reg.a & num);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA(((this.reg.a | num) & 0x08) != 0);
		this.reg.setFlagC(false);

		this.reg.a = result;
	}

	public xra(num: u8) {
		const result = u8(this.reg.a ^ num);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA(false);
		this.reg.setFlagC(false);

		this.reg.a = result;
	}

	public ora(num: u8) {
		const result = u8(this.reg.a | num);

		this.reg.setFlagS(result);
		this.reg.setFlagZ(result);
		this.reg.setFlagP(result);
		this.reg.setFlagA(false);
		this.reg.setFlagC(false);

		this.reg.a = result;
	}

	public cmp(num: u8) {
		const regA = this.reg.a;

		this.sub(num);

		this.reg.a = regA;
	}

	public rlc() {
		const flagC = Bit.get(this.reg.a, 7);
		const result = u8((this.reg.a << 1) | +flagC);

		this.reg.setFlagC(flagC);
		this.reg.a = result;
	}

	public rrc() {
		const flagC = Bit.get(this.reg.a, 0);
		const result = flagC ? u8(0x80 | (this.reg.a >> 1)) : u8(this.reg.a >> 1);

		this.reg.setFlagC(flagC);
		this.reg.a = result;
	}

	public ral() {
		const flagC = Bit.get(this.reg.a, 7);
		const result = u8((this.reg.a << 1) | +this.reg.getFlagC());

		this.reg.setFlagC(flagC);
		this.reg.a = result;
	}

	public rar() {
		const flagC = Bit.get(this.reg.a, 0);
		const result = this.reg.getFlagC() ? u8(0x80 | (this.reg.a >> 1)) : u8(this.reg.a >> 1);

		this.reg.setFlagC(flagC);
		this.reg.a = result;
	}

	public dad(num: u16) {
		const regHL = this.reg.getHL();
		const result = u16(regHL + num);

		this.reg.setFlagC(regHL > 0xffff - num);
		this.reg.setHL(result);
	}

}

export namespace Cpu {

	export class UnimplementedInstructionError extends Error {
		public opcode: u8;

		constructor(opcode: u8) {
			super(`Unimplemented instruction: ${Opcode.toString(opcode)} (0x${toHexStr(opcode)})`);
			this.opcode = opcode;
		}
	}

	export class UnreachableError extends Error {
		constructor() {
			super('This code should be unreachable!');
		}
	}

}
