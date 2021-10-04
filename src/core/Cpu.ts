import { u16, u8 } from 'typed-numbers';
import { Bit, Debug, Opcode } from '../helpers';
import { Device } from '../types';
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

	/** Whether Flip-Flop instructions are interrupted. */
	public intEnabled = false;

	/** Whether debugging is enabled. */
	public debugEnabled = false;

	/** Device that handles input/output operations. */
	public device: Device;


	/** Keeps track of the amount CPU cycles of the current step. */
	protected stepCycles = 0;

	/** Keeps track of the start time of a step. */
	protected stepZero = Date.now();


	/**
	 * Constructor.
	 * @param mem - An instance of the Memory class, with the program already loaded in.
	 * @param device - A class that implements Device.
	 * @param [debugEnabled = false] - Enable debugging.
	 */
	constructor(mem: Memory, device: Device, debugEnabled: boolean = false) {
		this.mem = mem;
		this.device = device;
		this.debugEnabled = debugEnabled;
	}

	public next() {
		if (this.halted) return 0;

		const opcode = this.getNextByte();

		if (this.debugEnabled) Debug.printOperation(opcode, this);

		let extraCycles = 0;
		switch (opcode) {

			/**********************
			 * NOP - No Operation *
			 **********************/

			case 0x00:
			case 0x08:
			case 0x10:
			case 0x18:
			case 0x20:
			case 0x28:
			case 0x30:
			case 0x38:
				break;


			/**************************
			 * Carry Bit Instructions *
			 **************************/

			case 0x3f:
				this.reg.setFlagC(!this.reg.getFlagC());
				break;

			case 0x37:
				this.reg.setFlagC(true);
				break;


			/**************************************
			 * INR - Increment Register or Memory *
			 **************************************/

			case 0x04:
				this.reg.b = this.inr(this.reg.b);
				break;

			case 0x0c:
				this.reg.c = this.inr(this.reg.c);
				break;

			case 0x14:
				this.reg.d = this.inr(this.reg.d);
				break;

			case 0x1c:
				this.reg.e = this.inr(this.reg.e);
				break;

			case 0x24:
				this.reg.h = this.inr(this.reg.h);
				break;

			case 0x2c:
				this.reg.l = this.inr(this.reg.l);
				break;

			case 0x34: {
				const regM = this.getM();
				const result = this.inr(regM);
				this.setM(result);
				break;
			}

			case 0x3c:
				this.reg.a = this.inr(this.reg.a);
				break;


			/**************************************
			 * DCR - Decrement Register or Memory *
			 **************************************/

			case 0x05:
				this.reg.b = this.dcr(this.reg.b);
				break;

			case 0x0d:
				this.reg.c = this.dcr(this.reg.c);
				break;

			case 0x15:
				this.reg.d = this.dcr(this.reg.d);
				break;

			case 0x1d:
				this.reg.e = this.dcr(this.reg.e);
				break;

			case 0x25:
				this.reg.h = this.dcr(this.reg.h);
				break;

			case 0x2d:
				this.reg.l = this.dcr(this.reg.l);
				break;

			case 0x35: {
				const regM = this.getM();
				const result = this.dcr(regM);
				this.setM(result);
				break;
			}

			case 0x3d:
				this.reg.a = this.dcr(this.reg.a);
				break;


			/********************************
			 * CMA - Complement Accumulator *
			 ********************************/

			case 0x2f:
				this.reg.a = u8(~this.reg.a);
				break;


			/************************************
			 * DAA - Decimal Adjust Accumulator *
			 ************************************/

			case 0x27:
				this.daa();
				break;


			/***************************
			 * MOV - Move Instructions *
			 ***************************/

			case 0x40:
				// this.reg.b = this.reg.b;
				break;

			case 0x41:
				this.reg.b = this.reg.c;
				break;

			case 0x42:
				this.reg.b = this.reg.d;
				break;

			case 0x43:
				this.reg.b = this.reg.e;
				break;

			case 0x44:
				this.reg.b = this.reg.h;
				break;

			case 0x45:
				this.reg.b = this.reg.l;
				break;

			case 0x46:
				this.reg.b = this.getM();
				break;

			case 0x47:
				this.reg.b = this.reg.a;
				break;

			case 0x48:
				this.reg.c = this.reg.b;
				break;

			case 0x49:
				// this.reg.c = this.reg.c;
				break;

			case 0x4a:
				this.reg.c = this.reg.d;
				break;

			case 0x4b:
				this.reg.c = this.reg.e;
				break;

			case 0x4c:
				this.reg.c = this.reg.h;
				break;

			case 0x4d:
				this.reg.c = this.reg.l;
				break;

			case 0x4e:
				this.reg.c = this.getM();
				break;

			case 0x4f:
				this.reg.c = this.reg.a;
				break;

			case 0x50:
				this.reg.d = this.reg.b;
				break;

			case 0x51:
				this.reg.d = this.reg.c;
				break;

			case 0x52:
				// this.reg.d = this.reg.d;
				break;

			case 0x53:
				this.reg.d = this.reg.e;
				break;

			case 0x54:
				this.reg.d = this.reg.h;
				break;

			case 0x55:
				this.reg.d = this.reg.l;
				break;

			case 0x56:
				this.reg.d = this.getM();
				break;

			case 0x57:
				this.reg.d = this.reg.a;
				break;

			case 0x58:
				this.reg.e = this.reg.b;
				break;

			case 0x59:
				this.reg.e = this.reg.c;
				break;

			case 0x5a:
				this.reg.e = this.reg.d;
				break;

			case 0x5b:
				// this.reg.e = this.reg.e;
				break;

			case 0x5c:
				this.reg.e = this.reg.h;
				break;

			case 0x5d:
				this.reg.e = this.reg.l;
				break;

			case 0x5e:
				this.reg.e = this.getM();
				break;

			case 0x5f:
				this.reg.e = this.reg.a;
				break;

			case 0x60:
				this.reg.h = this.reg.b;
				break;

			case 0x61:
				this.reg.h = this.reg.c;
				break;

			case 0x62:
				this.reg.h = this.reg.d;
				break;

			case 0x63:
				this.reg.h = this.reg.e;
				break;

			case 0x64:
				// this.reg.h = this.reg.h;
				break;

			case 0x65:
				this.reg.h = this.reg.l;
				break;

			case 0x66:
				this.reg.h = this.getM();
				break;

			case 0x67:
				this.reg.h = this.reg.a;
				break;

			case 0x68:
				this.reg.l = this.reg.b;
				break;

			case 0x69:
				this.reg.l = this.reg.c;
				break;

			case 0x6a:
				this.reg.l = this.reg.d;
				break;

			case 0x6b:
				this.reg.l = this.reg.e;
				break;

			case 0x6c:
				this.reg.l = this.reg.h;
				break;

			case 0x6d:
				// this.reg.l = this.reg.l;
				break;

			case 0x6e:
				this.reg.l = this.getM();
				break;

			case 0x6f:
				this.reg.l = this.reg.a;
				break;

			case 0x70:
				this.setM(this.reg.b);
				break;

			case 0x71:
				this.setM(this.reg.c);
				break;

			case 0x72:
				this.setM(this.reg.d);
				break;

			case 0x73:
				this.setM(this.reg.e);
				break;

			case 0x74:
				this.setM(this.reg.h);
				break;

			case 0x75:
				this.setM(this.reg.l);
				break;

			case 0x77:
				this.setM(this.reg.a);
				break;

			case 0x78:
				this.reg.a = this.reg.b;
				break;

			case 0x79:
				this.reg.a = this.reg.c;
				break;

			case 0x7a:
				this.reg.a = this.reg.d;
				break;

			case 0x7b:
				this.reg.a = this.reg.e;
				break;

			case 0x7c:
				this.reg.a = this.reg.h;
				break;

			case 0x7d:
				this.reg.a = this.reg.l;
				break;

			case 0x7e:
				this.reg.a = this.getM();
				break;

			case 0x7f:
				// this.reg.a = this.reg.a;
				break;


			/****************************
			 * STAX - Store Accumulator *
			 ****************************/

			case 0x02:
				this.mem.set(this.reg.getBC(), this.reg.a);
				break;

			case 0x12:
				this.mem.set(this.reg.getDE(), this.reg.a);
				break;


			/***************************
			 * LDAX - Load Accumulator *
			 ***************************/

			case 0x0a:
				this.reg.a = this.mem.get(this.reg.getBC());
				break;

			case 0x1a:
				this.reg.a = this.mem.get(this.reg.getDE());
				break;


			/***********************************************
			 * ADD - Add Register or Memory to Accumulator *
			 ***********************************************/

			case 0x80:
				this.add(this.reg.b);
				break;

			case 0x81:
				this.add(this.reg.c);
				break;

			case 0x82:
				this.add(this.reg.d);
				break;

			case 0x83:
				this.add(this.reg.e);
				break;

			case 0x84:
				this.add(this.reg.h);
				break;

			case 0x85:
				this.add(this.reg.l);
				break;

			case 0x86:
				this.add(this.getM());
				break;

			case 0x87:
				this.add(this.reg.a);
				break;


			/**********************************************************
			 * ADC - Add Register or Memory to Accumulator with Carry *
			 **********************************************************/

			case 0x88:
				this.adc(this.reg.b);
				break;

			case 0x89:
				this.adc(this.reg.c);
				break;

			case 0x8a:
				this.adc(this.reg.d);
				break;

			case 0x8b:
				this.adc(this.reg.e);
				break;

			case 0x8c:
				this.adc(this.reg.h);
				break;

			case 0x8d:
				this.adc(this.reg.l);
				break;

			case 0x8e:
				this.adc(this.getM());
				break;

			case 0x8f:
				this.adc(this.reg.a);
				break;


			/******************************************************
			 * SUB - Subtract Register or Memory from Accumulator *
			 ******************************************************/

			case 0x90:
				this.sub(this.reg.b);
				break;

			case 0x91:
				this.sub(this.reg.c);
				break;

			case 0x92:
				this.sub(this.reg.d);
				break;

			case 0x93:
				this.sub(this.reg.e);
				break;

			case 0x94:
				this.sub(this.reg.h);
				break;

			case 0x95:
				this.sub(this.reg.l);
				break;

			case 0x96:
				this.sub(this.getM());
				break;

			case 0x97:
				this.sub(this.reg.a);
				break;


			/******************************************************************
			 * SBB - Subtract Register or Memory from Accumulator with Borrow *
			 ******************************************************************/

			case 0x98:
				this.sbb(this.reg.b);
				break;

			case 0x99:
				this.sbb(this.reg.c);
				break;

			case 0x9a:
				this.sbb(this.reg.d);
				break;

			case 0x9b:
				this.sbb(this.reg.e);
				break;

			case 0x9c:
				this.sbb(this.reg.h);
				break;

			case 0x9d:
				this.sbb(this.reg.l);
				break;

			case 0x9e:
				this.sbb(this.getM());
				break;

			case 0x9f:
				this.sbb(this.reg.a);
				break;


			/*********************************************************
			 * ANA - Logical AND Register or Memory with Accumulator *
			 *********************************************************/

			case 0xa0:
				this.ana(this.reg.b);
				break;

			case 0xa1:
				this.ana(this.reg.c);
				break;

			case 0xa2:
				this.ana(this.reg.d);
				break;

			case 0xa3:
				this.ana(this.reg.e);
				break;

			case 0xa4:
				this.ana(this.reg.h);
				break;

			case 0xa5:
				this.ana(this.reg.l);
				break;

			case 0xa6:
				this.ana(this.getM());
				break;

			case 0xa7:
				this.ana(this.reg.a);
				break;


			/*******************************************************************************************
			 * XRA - Logical XOR (exclusive-or) Register or Memory with Accumulator (Zero Accumulator) *
			 *******************************************************************************************/

			case 0xa8:
				this.xra(this.reg.b);
				break;

			case 0xa9:
				this.xra(this.reg.c);
				break;

			case 0xaa:
				this.xra(this.reg.d);
				break;

			case 0xab:
				this.xra(this.reg.e);
				break;

			case 0xac:
				this.xra(this.reg.h);
				break;

			case 0xad:
				this.xra(this.reg.l);
				break;

			case 0xae:
				this.xra(this.getM());
				break;

			case 0xaf:
				this.xra(this.reg.a);
				break;


			/********************************************************
			 * ORA - Logical OR Register or Memory with Accumulator *
			 ********************************************************/

			case 0xb0:
				this.ora(this.reg.b);
				break;

			case 0xb1:
				this.ora(this.reg.c);
				break;

			case 0xb2:
				this.ora(this.reg.d);
				break;

			case 0xb3:
				this.ora(this.reg.e);
				break;

			case 0xb4:
				this.ora(this.reg.h);
				break;

			case 0xb5:
				this.ora(this.reg.l);
				break;

			case 0xb6:
				this.ora(this.getM());
				break;

			case 0xb7:
				this.ora(this.reg.a);
				break;


			/*****************************************************
			 * CMP - Compare Register or Memory with Accumulator *
			 *****************************************************/

			case 0xb8:
				this.cmp(this.reg.b);
				break;

			case 0xb9:
				this.cmp(this.reg.c);
				break;

			case 0xba:
				this.cmp(this.reg.d);
				break;

			case 0xbb:
				this.cmp(this.reg.e);
				break;

			case 0xbc:
				this.cmp(this.reg.h);
				break;

			case 0xbd:
				this.cmp(this.reg.l);
				break;

			case 0xbe:
				this.cmp(this.getM());
				break;

			case 0xbf:
				this.cmp(this.reg.a);
				break;


			/*********************************
			 * RLC - Rotate Accumulator Left *
			 *********************************/

			case 0x07:
				this.rlc();
				break;


			/*********************************
			 * RRC - Rotate Accumulator Right *
			 *********************************/

			case 0x0f:
				this.rrc();
				break;


			/***********************************************
			 * RAL - Rotate Accumulator Left Through Carry *
			 ***********************************************/

			case 0x17:
				this.ral();
				break;


			/************************************************
			 * RAR - Rotate Accumulator Right Through Carry *
			 ************************************************/

			case 0x1f:
				this.rar();
				break;


			/*******************************
			 * PUSH - Push Data Onto Stack *
			 *******************************/

			case 0xc5:
				this.stackAdd(this.reg.getBC());
				break;

			case 0xd5:
				this.stackAdd(this.reg.getDE());
				break;

			case 0xe5:
				this.stackAdd(this.reg.getHL());
				break;

			case 0xf5:
				this.stackAdd(this.reg.getAF());
				break;


			/****************************
			 * POP - Pop Data Off Stack *
			 ****************************/

			case 0xc1:
				this.reg.setBC(this.stackPop());
				break;

			case 0xd1:
				this.reg.setDE(this.stackPop());
				break;

			case 0xe1:
				this.reg.setHL(this.stackPop());
				break;

			case 0xf1:
				this.reg.setAF(this.stackPop());
				break;


			/********************
			 * DAD - Double Add *
			 ********************/

			case 0x09:
				this.dad(this.reg.getBC());
				break;

			case 0x19:
				this.dad(this.reg.getDE());
				break;

			case 0x29:
				this.dad(this.reg.getHL());
				break;

			case 0x39:
				this.dad(this.reg.sp);
				break;


			/*********************************
			 * INX - Increment Register Pair *
			 *********************************/

			case 0x03:
				this.reg.setBC(u16(this.reg.getBC() + 1));
				break;

			case 0x13:
				this.reg.setDE(u16(this.reg.getDE() + 1));
				break;

			case 0x23:
				this.reg.setHL(u16(this.reg.getHL() + 1));
				break;

			case 0x33:
				this.reg.sp = u16(this.reg.sp + 1);
				break;


			/*********************************
			 * DCX - Decrement Register Pair *
			 *********************************/

			case 0x0b:
				this.reg.setBC(u16(this.reg.getBC() - 1));
				break;

			case 0x1b:
				this.reg.setDE(u16(this.reg.getDE() - 1));
				break;

			case 0x2b:
				this.reg.setHL(u16(this.reg.getHL() - 1));
				break;

			case 0x3b:
				this.reg.sp = u16(this.reg.sp - 1);
				break;


			/*****************************
			 * XCHG - Exchange Registers *
			 *****************************/

			case 0xeb: {
				const regH = this.reg.h;
				this.reg.h = this.reg.d;
				this.reg.d = regH;

				const regL = this.reg.l;
				this.reg.l = this.reg.e;
				this.reg.e = regL;
				break;
			}


			/*************************
			 * XTHL - Exchange Stack *
			 *************************/

			case 0xe3: {
				const memSP = this.mem.getWord(this.reg.sp);
				const regHL = this.reg.getHL();
				this.reg.setHL(memSP);
				this.mem.setWord(this.reg.sp, regHL);
				break;
			}


			/*******************************
			 * SPHL - Load SP from H and L *
			 *******************************/

			case 0xf9:
				this.reg.sp = this.reg.getHL();
				break;


			/*****************************
			 * LXI - Load Immediate Data *
			 *****************************/

			case 0x01:
				this.reg.setBC(this.getNextWord());
				break;

			case 0x11:
				this.reg.setDE(this.getNextWord());
				break;

			case 0x21:
				this.reg.setHL(this.getNextWord());
				break;

			case 0x31:
				this.reg.sp = this.getNextWord();
				break;


			/*****************************
			 * MVI - Move Immediate Data *
			 *****************************/

			case 0x06:
				this.reg.b = this.getNextByte();
				break;

			case 0x0e:
				this.reg.c = this.getNextByte();
				break;

			case 0x16:
				this.reg.d = this.getNextByte();
				break;

			case 0x1e:
				this.reg.e = this.getNextByte();
				break;

			case 0x26:
				this.reg.h = this.getNextByte();
				break;

			case 0x2e:
				this.reg.l = this.getNextByte();
				break;

			case 0x36:
				this.setM(this.getNextByte());
				break;

			case 0x3e:
				this.reg.a = this.getNextByte();
				break;


			/**************************************
			 * ADI - Add Immediate Data to Accumulator *
			 **************************************/

			case 0xc6:
				this.add(this.getNextByte());
				break;


			/*************************************************
			 * ACI - Add Immediate Data to Accumulator with Carry *
			 *************************************************/

			case 0xce:
				this.adc(this.getNextByte());
				break;


			/*********************************************
			 * SUI - Subtract Immediate Data from Accumulator *
			 *********************************************/

			case 0xd6:
				this.sub(this.getNextByte());
				break;


			/*********************************************************
			 * SBI - Subtract Immediate Data from Accumulator with Borrow *
			 *********************************************************/

			case 0xde:
				this.sbb(this.getNextByte());
				break;


			/************************************************
			 * ANI - Logical AND Immediate Data with Accumulator *
			 ************************************************/

			case 0xe6:
				this.ana(this.getNextByte());
				break;


			/***************************************************************
			 * XRI - Logical XOR (exclusive-or) Immediate Data with Accumulator *
			 ***************************************************************/

			case 0xee:
				this.xra(this.getNextByte());
				break;


			/****************************************************
			 * ORI - Logical OR Immediate Data with Accumulator *
			 ****************************************************/

			case 0xf6:
				this.ora(this.getNextByte());
				break;


			/*************************************************
			 * CPI - Compare Immediate Data with Accumulator *
			 *************************************************/

			case 0xfe:
				this.cmp(this.getNextByte());
				break;


			/************************************
			 * STA - Store Accumulator Directly *
			 ************************************/

			case 0x32:
				this.mem.set(this.getNextWord(), this.reg.a);
				break;


			/***********************************
			 * LDA - Load Accumulator Directly *
			 ***********************************/

			case 0x3a:
				this.reg.a = this.mem.get(this.getNextWord());
				break;


			/********************************
			 * SHLD - Store Hand L Directly *
			 ********************************/

			case 0x22:
				this.mem.setWord(this.getNextWord(), this.reg.getHL());
				break;


			/*******************************
			 * LHLD - Load Hand L Directly *
			 *******************************/

			case 0x2a:
				this.reg.setHL(this.mem.getWord(this.getNextWord()));
				break;


			/*******************************
			 * PCHL - Load Program Counter *
			 *******************************/

			case 0xe9:
				this.reg.pc = this.reg.getHL();
				break;


			/*********************
			 * Jump Instructions *
			 *********************/

			case 0xc3:
			case 0xda:
			case 0xd2:
			case 0xca:
			case 0xc2:
			case 0xfa:
			case 0xf2:
			case 0xea:
			case 0xe2: {
				const address = this.getNextWord();
				if (this.checkBranchCondition(opcode)) {
					this.reg.pc = address;
				}
				break;
			}


			/********************************
			 * Call Subroutine Instructions *
			 ********************************/

			case 0xcd:
			case 0xdc:
			case 0xd4:
			case 0xcc:
			case 0xc4:
			case 0xec:
			case 0xe4:
			case 0xfc:
			case 0xf4: {
				const address = this.getNextWord();
				if (this.checkBranchCondition(opcode)) {
					extraCycles = 6;
					this.stackAdd(this.reg.pc);
					this.reg.pc = address;
				}
				break;
			}


			/***************************************
			 * Return from Subroutine Instructions *
			 ***************************************/

			case 0xc9:
			case 0xd8:
			case 0xd0:
			case 0xc8:
			case 0xc0:
			case 0xf8:
			case 0xf0:
			case 0xe8:
			case 0xe0:
				if (this.checkBranchCondition(opcode)) {
					extraCycles = 6;
					this.reg.pc = this.stackPop();
				}
				break;


			/****************************
			 * RST - Reset Instructions *
			 ****************************/

			case 0xc7:
			case 0xcf:
			case 0xd7:
			case 0xdf:
			case 0xe7:
			case 0xef:
			case 0xf7:
			case 0xff:
				this.stackAdd(this.reg.pc);
				this.reg.pc = u16(opcode & 0x38);
				break;


			/************************************
			 * Interrupt Flip-Flop Instructions *
			 ************************************/

			case 0xfb:
				this.intEnabled = true;
				break;

			case 0xf3:
				this.intEnabled = false;
				break;


			/********************
			 * I/O Instructions *
			 ********************/

			case 0xdb:
				this.reg.a = this.device.input(this.getNextByte());
				break;

			case 0xd3:
				this.device.output(this.getNextByte(), this.reg.a);
				break;


			/**************************
			 * HLT - Halt Instruction *
			 **************************/

			case 0x76:
				this.halted = true;
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
	 * Add a value to the top of the stack.
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


	/*****************************
	 * BRANCH CONDITION CHECKING *
	 *****************************/

	/**
	 * Checks branching condition for Jump/Call/Return operations
	 * @param opcode - The opcode of the operation.
	 */
	public checkBranchCondition(opcode: u8): boolean {
		switch (opcode) {
			case 0xc3: // JMP - Jump
			case 0xcd: // CALL - Call
			case 0xc9: // RET - Return
				return true;

			case 0xda: // JC - Jump if Carry
			case 0xdc: // CC - Call if Carry
			case 0xd8: // RC - Return if Carry
				return this.reg.getFlagC();

			case 0xd2: // JNC - Jump if No Carry
			case 0xd4: // CNC - Call if No Carry
			case 0xd0: // RNC - Return if No Carry
				return !this.reg.getFlagC();

			case 0xca: // JZ - Jump if Zero
			case 0xcc: // CZ - Call if Zero
			case 0xc8: // RZ - Return if Zero
				return this.reg.getFlagZ();

			case 0xc2: // JNZ - Jump if Not Zero
			case 0xc4: // CNZ - Call if Not Zero
			case 0xc0: // RNZ - Return if Not Zero
				return !this.reg.getFlagZ();

			case 0xfa: // JM - Jump if Minus
			case 0xfc: // CM - Call if Minus
			case 0xf8: // RM - Return if Minus
				return this.reg.getFlagS();

			case 0xf2: // JP - Jump if Plus
			case 0xf4: // CP - Call if Plus
			case 0xf0: // RP - Return if Plus
				return !this.reg.getFlagS();

			case 0xea: // JPE - Jump if Parity Even
			case 0xec: // CPE - Call if Parity Even
			case 0xe8: // RPE - Return if Parity Even
				return this.reg.getFlagP();

			case 0xe2: // JPO - Jump if Parity Odd
			case 0xe4: // CPO - Call if Parity Odd
			case 0xe0: // RPO - Return if Parity Odd
				return !this.reg.getFlagP();

			default:
				throw new Cpu.UnimplementedInstructionError(opcode);
		}
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
			super(`Unimplemented instruction: ${Opcode.toString(opcode)} (0x${Debug.toHexStr(opcode)})`);
			this.opcode = opcode;
		}
	}

	export class UnreachableError extends Error {
		constructor() {
			super('This code should be unreachable!');
		}
	}

}
