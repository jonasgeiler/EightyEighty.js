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

		console.log(`[${toHexStr(this.pc, 4)}]  ` +
		            `${toHexStr(opcode)} ` +
		            (getOpcodeLength(opcode) >= 2 ? toHexStr(this.memory.read(u16(this.pc + 1))) : '  ') +
		            ' ' +
		            (getOpcodeLength(opcode) == 3 ? toHexStr(this.memory.read(u16(this.pc + 2))) : '  ') +
		            `\t${getOpcodeName(opcode).padEnd(8, ' ')}\t` +
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

			case 0x76:
				console.log('Exiting...');
				process.exit(0);
				break;


			/***********************
			 * DATA TRANSFER GROUP *
			 ***********************/

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

			case 0x0a:
			case 0x1a:
				this.ldax(opcode);
				break;

			case 0x40:
			case 0x41:
			case 0x42:
			case 0x43:
			case 0x44:
			case 0x45:
			case 0x46:
			case 0x47:
			case 0x48:
			case 0x49:
			case 0x4a:
			case 0x4b:
			case 0x4c:
			case 0x4d:
			case 0x4e:
			case 0x4f:
			case 0x50:
			case 0x51:
			case 0x52:
			case 0x53:
			case 0x54:
			case 0x55:
			case 0x56:
			case 0x57:
			case 0x58:
			case 0x59:
			case 0x5a:
			case 0x5b:
			case 0x5c:
			case 0x5d:
			case 0x5e:
			case 0x5f:
			case 0x60:
			case 0x61:
			case 0x62:
			case 0x63:
			case 0x64:
			case 0x65:
			case 0x66:
			case 0x67:
			case 0x68:
			case 0x69:
			case 0x6a:
			case 0x6b:
			case 0x6c:
			case 0x6d:
			case 0x6e:
			case 0x6f:
			case 0x70:
			case 0x71:
			case 0x72:
			case 0x73:
			case 0x74:
			case 0x75:
			case 0x77:
			case 0x78:
			case 0x79:
			case 0x7a:
			case 0x7b:
			case 0x7c:
			case 0x7d:
			case 0x7e:
			case 0x7f:
				this.mov(opcode);
				break;

			case 0xe3:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.xthl();
				break;

			case 0xe9:
				throw new Cpu.UnimplementedInstructionError(opcode); // jumped = this.pchl();
				break;

			case 0xeb:
				this.xchg();
				break;

			case 0xee:
				this.xri();
				break;

			case 0xf9:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.sphl();
				break;


			/********************
			 * ARITHMETIC GROUP *
			 ********************/

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

			case 0x09:
			case 0x19:
			case 0x29:
			case 0x39:
				this.dad(opcode);
				break;

			case 0x0b:
			case 0x1b:
			case 0x2b:
			case 0x3b:
				this.dcx(opcode);
				break;

			case 0x27:
				this.daa();
				break;

			case 0x80:
			case 0x81:
			case 0x82:
			case 0x83:
			case 0x84:
			case 0x85:
			case 0x86:
			case 0x87:
				this.add(opcode);
				break;

			case 0x88:
			case 0x89:
			case 0x8a:
			case 0x8b:
			case 0x8c:
			case 0x8d:
			case 0x8e:
			case 0x8f:
				this.adc(opcode);
				break;

			case 0x90:
			case 0x91:
			case 0x92:
			case 0x93:
			case 0x94:
			case 0x95:
			case 0x96:
			case 0x97:
				this.sub(opcode);
				break;

			case 0x98:
			case 0x99:
			case 0x9a:
			case 0x9b:
			case 0x9c:
			case 0x9d:
			case 0x9e:
			case 0x9f:
				this.sbb(opcode);
				break;

			case 0xb8:
			case 0xb9:
			case 0xba:
			case 0xbb:
			case 0xbc:
			case 0xbd:
			case 0xbe:
			case 0xbf:
				this.cmp(opcode);
				break;

			case 0xc6:
				this.adi();
				break;

			case 0xce:
				this.aci();
				break;

			case 0xd6:
				this.sui();
				break;

			case 0xde:
				this.sbi();
				break;


			/****************
			 * BRANCH GROUP *
			 ****************/

			case 0xc2:
				jumped = this.jnz();
				break;

			case 0xc3:
				jumped = this.jmp();
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

			case 0xea:
				jumped = this.jpe();
				break;

			case 0xf2:
				jumped = this.jp();
				break;

			case 0xfa:
				jumped = this.jm();
				break;

			case 0xdc:
				jumped = this.cc();
				break;

			case 0xcc:
				jumped = this.cz();
				break;

			case 0xd4:
				jumped = this.cnc();
				break;

			case 0xec:
				jumped = this.cpe();
				break;

			case 0xe4:
				jumped = this.cpo();
				break;

			case 0xfc:
				jumped = this.cm();
				break;

			case 0xf4:
				jumped = this.cp();
				break;

			case 0xc4:
				jumped = this.cnz();
				break;

			case 0xd8:
				jumped = this.rc();
				break;

			case 0xd0:
				jumped = this.rnc();
				break;

			case 0xc8:
				jumped = this.rz();
				break;

			case 0xc0:
				jumped = this.rnz();
				break;

			case 0xf8:
				jumped = this.rm();
				break;

			case 0xf0:
				jumped = this.rp();
				break;

			case 0xe8:
				jumped = this.rpe();
				break;

			case 0xe0:
				jumped = this.rpo();
				break;


			/*****************
			 * LOGICAL GROUP *
			 *****************/

			case 0xe6:
				this.ani();
				break;

			case 0xa0:
			case 0xa1:
			case 0xa2:
			case 0xa3:
			case 0xa4:
			case 0xa5:
			case 0xa6:
			case 0xa7:
				this.ana(opcode);
				break;

			case 0x07:
				this.rlc();
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

			case 0xb0:
			case 0xb1:
			case 0xb2:
			case 0xb3:
			case 0xb4:
			case 0xb5:
			case 0xb6:
			case 0xb7:
				this.ora(opcode);
				break;

			case 0xf6:
				this.ori();
				break;

			case 0x37:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.stc();
				break;

			case 0x2f:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.cma();
				break;

			case 0x3f:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.cmc();
				break;

			case 0x22:
				this.shld();
				break;

			case 0x2a:
				this.lhld();
				break;

			case 0x3a:
				this.lda();
				break;

			case 0x32:
				this.sta();
				break;

			case 0xfe:
				this.cpi();
				break;

			case 0xa8:
			case 0xa9:
			case 0xaa:
			case 0xab:
			case 0xac:
			case 0xad:
			case 0xae:
			case 0xaf:
				this.xra(opcode);
				break;


			/*************
			 * I/O GROUP *
			 *************/

			case 0xc7:
			case 0xcf:
			case 0xd7:
			case 0xdf:
			case 0xe7:
			case 0xef:
			case 0xf7:
			case 0xff:
				throw new Cpu.UnimplementedInstructionError(opcode); // jumped = this.rst(opcode);
				break;

			case 0xc5:
			case 0xd5:
			case 0xe5:
			case 0xf5:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.push(opcode);
				break;

			case 0xc1:
			case 0xd1:
			case 0xe1:
			case 0xf1:
				throw new Cpu.UnimplementedInstructionError(opcode); // this.pop(opcode);
				break;

			case 0xfb:
				this.ei();
				break;

			case 0xf3:
				this.di();
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

	protected getRegisterByNum(registerNum: number): u8 {
		switch (registerNum) {
			case 0:
				return this.b;

			case 1:
				return this.c;

			case 2:
				return this.d;

			case 3:
				return this.e;

			case 4:
				return this.h;

			case 5:
				return this.l;

			case 6:
				return this.getOffset();

			case 7:
				return this.a;

			default:
				throw new Cpu.UnreachableError();
		}
	}

	protected setRegisterByNum(registerNum: number, newValue: u8) {
		switch (registerNum) {
			case 0:
				return this.b = newValue;

			case 1:
				return this.c = newValue;

			case 2:
				return this.d = newValue;

			case 3:
				return this.e = newValue;

			case 4:
				return this.h = newValue;

			case 5:
				return this.l = newValue;

			case 6:
				return this.setOffset(newValue);

			case 7:
				return this.a = newValue;

			default:
				throw new Cpu.UnreachableError();
		}
	}


	/***********************
	 * DATA TRANSFER GROUP *
	 ***********************/

	protected mov(opcode: u8) {
		const src = opcode & 7;
		const dest = (opcode >> 3) & 7;

		this.setRegisterByNum(dest, this.getRegisterByNum(src));
	}

	protected mvi(opcode: u8) {
		const dest = opcode >> 3;

		this.setRegisterByNum(dest, this.getData8());
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
				const offset = u16((this.b << 8) | this.c);
				this.a = this.memory.read(offset);
				return;
			}

			case 0x1a: {
				const offset = u16((this.d << 8) | this.e);
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

	protected xri() {
		const rhs = this.getData8();
		const lhs = this.a;

		this.a = u8(lhs ^ rhs);
		this.conditions.setAll(u16(this.a), this.a);
	}

	protected xchg() {
		const l = this.l;
		this.l = this.e;
		this.e = l;

		const h = this.h;
		this.h = this.d;
		this.d = h;
	}


	/********************
	 * ARITHMETIC GROUP *
	 ********************/

	protected add(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = this.getRegisterByNum(reg);
		const answer = u16(lhs + rhs);

		this.a = u8(answer);
		this.conditions.setAll(answer, u8((lhs & 0xf) + (rhs & 0xf)));
	}

	protected adc(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = u16(this.getRegisterByNum(reg) + +this.conditions.cy);
		const answer = u16(lhs + rhs);

		this.a = u8(answer);
		this.conditions.setAll(answer, u8((lhs & 0xf) + (rhs & 0xf)));
	}

	protected adi() {
		const lhs = this.a;
		const rhs = this.getData8();
		const answer = u16(lhs + rhs);

		this.conditions.setAll(answer, u8((lhs & 0xf) + (rhs & 0xf)));
		this.a = u8(answer);
	}

	protected aci() {
		const lhs = this.a;
		const rhs = u8(this.getData8() + +this.conditions.cy);
		const answer = u16(lhs + rhs);

		this.conditions.setAll(answer, u8((lhs & 0xf) + (rhs & 0xf)));
		this.a = u8(answer);
	}

	protected cmp(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = this.getRegisterByNum(reg);
		const answer = u16(lhs - rhs);

		this.conditions.setAll(answer, u8((lhs & 0xf) - (rhs & 0xf)));
	}

	protected sub(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = this.getRegisterByNum(reg);
		const answer = u16(lhs - rhs);

		this.a = u8(answer);
		this.conditions.setAll(answer, u8((lhs & 0xf) - (rhs & 0xf)));
	}

	protected sbb(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = u16(this.getRegisterByNum(reg) + +this.conditions.cy);
		const answer = u16(lhs - rhs);

		this.a = u8(answer);
		this.conditions.setAll(answer, u8((lhs & 0xf) - (rhs & 0xf)));
	}

	protected sui() {
		const lhs = this.a;
		const rhs = this.getData8();
		const answer = u16(lhs - rhs);

		this.conditions.setAll(answer, u8((lhs & 0xf) - (rhs & 0xf)));
		this.a = u8(answer);
	}

	protected sbi() {
		const lhs = this.a;
		const rhs = u8(this.getData8() + +this.conditions.cy);
		const answer = u16(lhs - rhs);

		this.conditions.setAll(answer, u8((lhs & 0xf) - (rhs & 0xf)));
		this.a = u8(answer);
	}

	protected inr(opcode: u8) {
		const reg = opcode >> 3;
		const answer = u8(this.getRegisterByNum(reg) + 1);

		if (opcode === 0x34) {
			this.conditions.setAllExceptCarry(u16(answer), u8((answer & 0xf) + 1));
			this.setOffset(answer);
		} else {
			this.setRegisterByNum(reg, answer);
			this.conditions.setAllExceptCarry(u16(answer), answer);
		}
	}

	protected dcr(opcode: u8) {
		const reg = opcode >> 3;
		const answer = u8(this.getRegisterByNum(reg) - 1);

		if (opcode === 0x35) {
			this.conditions.setAllExceptCarry(u16(answer), answer);
			this.setOffset(answer);
		} else {
			this.setRegisterByNum(reg, answer);
			this.conditions.setAllExceptCarry(u16(answer), answer);
		}
	}

	protected inx(opcode: u8) {
		switch (opcode) {
			case 0x03: {
				const bc = u16((this.b << 8) | this.c);
				const answer = u16(bc + 1);

				this.b = u8(answer >> 8);
				this.c = u8(answer);
				return;
			}

			case 0x13: {
				const de = u16((this.d << 8) | this.e);
				const answer = u16(de + 1);

				this.d = u8(answer >> 8);
				this.e = u8(answer);
				return;
			}

			case 0x23: {
				const hl = u16((this.h << 8) | this.l);
				const answer = u16(hl + 1);

				this.h = u8(answer >> 8);
				this.l = u8(answer);
				return;
			}

			case 0x33:
				this.sp = u16(this.sp + 1);
				return;

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
		this.pc = this.getData16();
		return true;
	}

	protected jnc() {
		if (!this.conditions.cy) return this.jmp();
		return false;
	}

	protected jc() {
		if (this.conditions.cy) return this.jmp();
		return false;
	}

	protected jp() {
		if (!this.conditions.s) return this.jmp();
		return false;
	}

	protected jpo() {
		if (!this.conditions.p) return this.jmp();
		return false;
	}

	protected jpe() {
		if (this.conditions.p) return this.jmp();
		return false;
	}

	protected jz() {
		if (this.conditions.z) return this.jmp();
		return false;
	}

	protected jnz() {
		if (!this.conditions.z) return this.jmp();
		return false;
	}

	protected jm() {
		if (this.conditions.s) return this.jmp();
		return false;
	}

	protected call() {
		const ret = u16(this.pc + 3);

		this.memory.write(u16(this.sp - 1), u8(ret >> 8));
		this.memory.write(u16(this.sp - 2), u8(ret));
		this.sp = u16(this.sp - 2);
		this.jmp();

		return true;
	}

	protected cz() {
		if (this.conditions.z) return this.call();
		return false;
	}

	protected cnz() {
		if (!this.conditions.z) return this.call();
		return false;
	}

	protected cc() {
		if (this.conditions.cy) return this.call();
		return false;
	}

	protected cnc() {
		if (!this.conditions.cy) return this.call();
		return false;
	}

	protected cpe() {
		if (this.conditions.p) return this.call();
		return false;
	}

	protected cpo() {
		if (!this.conditions.p) return this.call();
		return false;
	}

	protected cm() {
		if (this.conditions.s) return this.call();
		return false;
	}

	protected cp() {
		if (!this.conditions.s) return this.call();
		return false;
	}

	protected ret() {
		const low = this.memory.read(this.sp);
		const high = this.memory.read(u16(this.sp + 1));

		this.pc = u16((high << 8) | low);
		this.sp = u16(this.sp + 2);

		return true;
	}

	protected rc() {
		if (this.conditions.cy) return this.ret();
		return false;
	}

	protected rnc() {
		if (!this.conditions.cy) return this.ret();
		return false;
	}

	protected rz() {
		if (this.conditions.z) return this.ret();
		return false;
	}

	protected rnz() {
		if (!this.conditions.z) return this.ret();
		return false;
	}

	protected rm() {
		if (this.conditions.s) return this.ret();
		return false;
	}

	protected rp() {
		if (!this.conditions.s) return this.ret();
		return false;
	}

	protected rpe() {
		if (this.conditions.p) return this.ret();
		return false;
	}

	protected rpo() {
		if (!this.conditions.p) return this.ret();
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

	protected ana(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = this.getRegisterByNum(reg);
		const answer = u8(lhs & rhs);

		this.a = answer;
		this.conditions.setAll(u16(answer), answer);
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

	protected ora(opcode: u8) {
		const reg = opcode & 0x07;
		const answer = u16(this.a | this.getRegisterByNum(reg));

		this.conditions.setAll(answer, u8(0));
		this.a = u8(answer);
	}

	protected ori() {
		const answer = u16(this.a | this.getData8());

		this.conditions.setAllExceptAC(answer);
		this.a = u8(answer);
	}

	protected shld() {
		const address = this.getData16();

		this.memory.write(address, this.l);
		this.memory.write(u16(address + 1), this.h);
	}

	protected lhld() {
		const address = this.getData16();

		this.l = this.memory.read(address);
		this.h = this.memory.read(u16(address + 1));
	}

	protected lda() {
		const address = this.getData16();

		this.a = this.memory.read(address);
	}

	protected sta() {
		const address = this.getData16();

		this.memory.write(address, this.a);
	}

	protected cpi() {
		const data = this.getData8();
		const answer = u16(this.a - data);

		this.conditions.setAllExceptCarry(answer, u8((this.a & 0xf) - (data & 0xf)));
		this.conditions.cy = this.a < data;
	}

	protected xra(opcode: u8) {
		const reg = opcode & 0x07;

		const lhs = this.a;
		const rhs = this.getRegisterByNum(reg);
		const answer = u16(lhs ^ rhs);

		this.a = u8(answer);
		this.conditions.setAll(answer, u8((lhs & 0xf) ^ (rhs & 0xf)));
	}


	/*************
	 * I/O GROUP *
	 *************/

	protected ei() {
		this.intEnable = true;
	}

	protected di() {
		this.intEnable = false;
	}
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
