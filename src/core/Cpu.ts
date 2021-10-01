import { u16, u8 } from 'typed-numbers';
import { Machine } from '../types';
import { getOpcodeCpuCycles, getOpcodeLength, getOpcodeName, rotateBitsLeftU8, rotateBitsRightU8, toHexStr } from '../utils';
import { ConditionCodes } from './ConditionCodes';
import { Memory } from './Memory';

export class Cpu {

	protected a: u8 = u8(0);
	protected b: u8 = u8(0);
	protected c: u8 = u8(0);
	protected d: u8 = u8(0);
	protected e: u8 = u8(0);
	protected h: u8 = u8(0);
	protected l: u8 = u8(0);

	protected sp: u16 = u16(0);
	public pc: u16 = u16(0);

	protected memory: Memory = new Memory();

	protected conditions: ConditionCodes = new ConditionCodes();

	protected intEnable: boolean = false;

	public loadProgram(program: ArrayLike<number>, offset?: number) {
		this.memory.load(program, offset);
	}

	public emulate(machine: Machine) {
		const opcode = this.memory.read(this.pc);

		machine;

		console.log(`[${toHexStr(this.pc, 4)}]\t` +
		            `${toHexStr(opcode)} ` +
		            (getOpcodeLength(opcode) >= 2 ? toHexStr(this.memory.read(u16(this.pc + 1))) : '  ') +
		            ' ' +
		            (getOpcodeLength(opcode) == 3 ? toHexStr(this.memory.read(u16(this.pc + 2))) : '  ') +
		            `\t${getOpcodeName(opcode)}\t` +
		            `(Flags: ${this.conditions.toString()}, ` +
		            `A: ${toHexStr(this.a)}, ` +
		            `B: ${toHexStr(this.b)}, ` +
		            `C: ${toHexStr(this.c)}, ` +
		            `D: ${toHexStr(this.d)}, ` +
		            `E: ${toHexStr(this.e)}, ` +
		            `H: ${toHexStr(this.h)}, ` +
		            `L: ${toHexStr(this.l)}, ` +
		            `SP: ${toHexStr(this.sp, 4)})`);

		let jumped = false;
		switch (opcode) {
			case 0x00:
			case 0x08:
			case 0x20:
			case 0x28:
			case 0x30:
			case 0x38:
				break;

			case 0x01:
			case 0x11:
			case 0x21:
			case 0x31:
				this.lxi(opcode);
				break;

			case 0x02:
			case 0x12:
				this.stax(opcode);
				break;

			case 0x03:
			case 0x13:
			case 0x23:
			case 0x33:
				this.inx(opcode);
				break;

			case 0x04:
			case 0x0c:
			case 0x14:
			case 0x1c:
			case 0x24:
			case 0x2c:
			case 0x34:
			case 0x3c:
				this.inr(opcode);
				break;

			case 0x05:
			case 0x0d:
			case 0x15:
			case 0x1d:
			case 0x25:
			case 0x2d:
			case 0x35:
			case 0x3d:
				this.dcr(opcode);
				break;

			case 0x06:
			case 0x0e:
			case 0x16:
			case 0x1e:
			case 0x26:
			case 0x2e:
			case 0x36:
			case 0x3e:
				this.mvi(opcode);
				break;

			case 0x07:
				this.rlc();
				break;

			case 0x09:
			case 0x19:
			case 0x29:
			case 0x39:
				this.dad(opcode);
				break;

			case 0x0a:
			case 0x1a:
				this.ldax(opcode);
				break;

			case 0x0b:
			case 0x1b:
			case 0x2b:
			case 0x3b:
				this.dcx(opcode);
				break;

			case 0x0f:
				this.rrc();
				break;

			case 0x17:
				this.ral();
				break;

			case 0x1f:
				this.rar();
				break;

			case 0x22:
				this.shld();
				break;

			case 0x27:
				this.daa();
				break;

			case 0xc2:
				jumped = this.jnz();
				break;

			case 0xc3:
				jumped = this.jmp();
				break;

			case 0xc6:
				this.adi();
				break;

			case 0xca:
				jumped = this.jz();
				break;

			case 0xd2:
				jumped = this.jnc();
				break;

			case 0xda:
				jumped = this.jc();
				break;

			case 0xe2:
				jumped = this.jpo();
				break;

			case 0xe6:
				this.ani();
				break;

			case 0xea:
				jumped = this.jpe();
				break;

			case 0xf2:
				jumped = this.jp();
				break;

			case 0xfa:
				jumped = this.jm();
				break;

			default:
				throw new Cpu.UnimplementedInstructionError(opcode);
		}

		if (!jumped) this.pc = u16(this.pc + getOpcodeLength(opcode));

		return getOpcodeCpuCycles(opcode);
	}

	protected getOffset(): u8 {
		let offset = u16((this.h << 8) | this.l);

		return this.memory.read(offset);
	}

	protected setOffset(value: u8) {
		let offset = u16((this.h << 8) | this.l);

		this.memory.write(offset, value);
	}

	protected getData8(): u8 {
		return this.memory.read(u16(this.pc + 1));
	}

	protected getData16(): u16 {
		return u16((this.memory.read(u16(this.pc + 2)) << 8) | this.memory.read(u16(this.pc + 1)));
	}

	protected jump() {
		this.pc = this.getData16();
	}


	/***********************
	 * DATA TRANSFER GROUP *
	 ***********************/

	protected mvi(opcode: u8) {
		switch (opcode) {
			case 0x06:
				this.b = this.getData8();
				break;

			case 0x0e:
				this.c = this.getData8();
				break;

			case 0x16:
				this.d = this.getData8();
				break;

			case 0x1e:
				this.e = this.getData8();
				break;

			case 0x26:
				this.h = this.getData8();
				break;

			case 0x2e:
				this.l = this.getData8();
				break;

			case 0x36:
				this.setOffset(this.getData8());
				break;

			case 0x3e:
				this.a = this.getData8();
				break;

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected lxi(opcode: u8) {
		switch (opcode) {
			case 0x01:
				this.b = u8(this.getData16() >> 8);
				this.c = this.getData8();
				return;

			case 0x11:
				this.d = u8(this.getData16() >> 8);
				this.e = this.getData8();
				return;

			case 0x21:
				this.h = u8(this.getData16() >> 8);
				this.l = this.getData8();
				return;

			case 0x31:
				this.sp = this.getData16();
				return;

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected ldax(opcode: u8) {
		switch (opcode) {
			case 0x0a: {
				const offset = u16(this.b << 8 | this.c);
				this.a = this.memory.read(offset);
				return;
			}

			case 0x1a: {
				const offset = u16(this.d << 8 | this.e);
				this.a = this.memory.read(offset);
				return;
			}

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected stax(opcode: u8) {
		const stax = (x: u8, y: u8) => {
			const address = u16((x << 8) | y);
			this.memory.write(address, this.a);
		};

		switch (opcode) {
			case 0x02:
				stax(this.b, this.c);
				return;

			case 0x12:
				stax(this.d, this.e);
				return;

			default:
				throw new Cpu.UnreachableError();
		}
	}


	/********************
	 * ARITHMETIC GROUP *
	 ********************/

	protected adi() {
		const lhs = this.a;
		const rhs = this.getData8();
		const answer = u16(lhs + rhs);

		this.conditions.setAll(answer, u8((lhs & 0xf) + (rhs & 0xf)));
		this.a = u8(answer);
	}

	protected inr(opcode: u8) {
		switch (opcode) {
			case 0x04:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x0c:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x14:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x1c:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x24:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x2c:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x34:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x3c:
				throw new Cpu.UnimplementedInstructionError(opcode);

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected dcr(opcode: u8) {
		switch (opcode) {
			case 0x05:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x0d:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x15:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x1d:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x25:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x2d:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x35:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x3d:
				throw new Cpu.UnimplementedInstructionError(opcode);

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected inx(opcode: u8) {
		switch (opcode) {
			case 0x03:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x13:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x23:
				throw new Cpu.UnimplementedInstructionError(opcode);

			case 0x33:
				throw new Cpu.UnimplementedInstructionError(opcode);

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected dcx(opcode: u8) {
		switch (opcode) {
			case 0x0b: {
				const bc = u16((this.b << 8) | this.c);
				const answer = u16(bc - 1);

				this.b = u8(answer >> 8);
				this.c = u8(answer);
				return;
			}

			case 0x1b: {
				const de = u16((this.d << 8) | this.e);
				const answer = u16(de - 1);

				this.d = u8(answer >> 8);
				this.e = u8(answer);
				return;
			}

			case 0x2b: {
				const hl = u16((this.h << 8) | this.l);
				const answer = u16(hl - 1);

				this.h = u8(answer >> 8);
				this.l = u8(answer);
				return;
			}

			case 0x3b:
				this.sp = u16(this.sp - 1);
				return;

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected dad(opcode: u8) {
		const dad = (x: u8, y: u8) => {
			const hl = u16((this.h << 8) | this.l);
			const xy = u16((x << 8) | y);

			const answer = u16(hl + xy);

			this.conditions.setCY(answer);
			this.h = u8(answer >> 8);
			this.l = u8(answer);
		};

		switch (opcode) {
			case 0x09:
				dad(this.b, this.c);
				return;

			case 0x19:
				dad(this.d, this.e);
				return;

			case 0x29:
				dad(this.h, this.l);
				return;

			case 0x39:
				const hl = (this.h << 8) | this.l;

				const answer = u16(hl + this.sp);

				this.conditions.setCY(answer);
				this.h = u8(answer >> 8);
				this.l = u8(answer);
				return;

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected daa() {
		let l = this.a;
		let least = this.a & 0xf;

		if (this.conditions.ac || least > 9) {
			l = u8(l + 6);

			if ((l & 0xf) < least) {
				this.conditions.ac = true;
			}
		}

		least = l & 0xf;
		let most = (l >> 4) & 0xf;

		if (this.conditions.cy || most > 9) {
			most += 6;
		}

		const answer = u16((most << 4) | least);

		this.conditions.setAllExceptAC(answer);
		this.a = u8(answer);
	}

	/****************
	 * BRANCH GROUP *
	 ****************/

	protected jmp() {
		this.jump();
		return true;
	}

	protected jnc() {
		if (!this.conditions.cy) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jc() {
		if (this.conditions.cy) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jp() {
		if (!this.conditions.s) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jpo() {
		if (!this.conditions.p) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jpe() {
		if (this.conditions.p) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jz() {
		if (this.conditions.z) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jnz() {
		if (!this.conditions.z) {
			this.jump();
			return true;
		}
		return false;
	}

	protected jm() {
		if (this.conditions.s) {
			this.jump();
			return true;
		}
		return false;
	}


	/*****************
	 * LOGICAL GROUP *
	 *****************/
	protected ani() {
		const answer = u16(this.a & this.getData8());

		this.conditions.setAllExceptAC(answer);
		this.a = u8(answer);
	}

	protected rlc() {
		this.a = rotateBitsLeftU8(this.a, 1);
		this.conditions.cy = (this.a & 1) != 0;
	}

	protected ral() {
		const newCarry = (this.a & 0x80) != 0;

		this.a = u8((this.a << 1) | +this.conditions.cy);
		this.conditions.cy = newCarry;
	}

	protected rar() {
		const newCarry = (this.a & 1) != 0;

		this.a = u8((this.a >> 1) | (+this.conditions.cy << 7));
		this.conditions.cy = newCarry;
	}

	protected rrc() {
		this.a = rotateBitsRightU8(this.a, 1);
		this.conditions.cy = (this.a & 0x80) != 0;
	}

	protected shld() {
		const address = this.getData16();

		this.memory.write(address, this.l);
		this.memory.write(u16(address + 1), this.h);
	}


	/*************
	 * I/O GROUP *
	 *************/



}

export namespace Cpu {

	export class UnimplementedInstructionError extends Error {
		public opcode: u8;

		constructor(opcode: u8) {
			super(`Unimplemented instruction: ${getOpcodeName(opcode)} (0x${toHexStr(opcode)})`);
			this.opcode = opcode;
		}
	}

	export class UnreachableError extends Error {
		constructor() {
			super('This code should be unreachable!');
		}
	}

}
