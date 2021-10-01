import { u8 } from 'typed-numbers';

/**
 * Get length of an opcode.
 * @param opcode - The opcode.
 */
export function getOpcodeLength(opcode: u8): number {
	return (LOOKUP_TABLE[opcode] ?? FALLBACK).length;
}

/**
 * Get amount of CPU cycles for an opcode.
 * @param opcode - The opcode.
 */
export function getOpcodeCpuCycles(opcode: u8): number {
	return (LOOKUP_TABLE[opcode] ?? FALLBACK).cpuCycles;
}

/**
 * Get name of an opcode.
 * @param opcode - The opcode.
 */
export function getOpcodeName(opcode: u8): string {
	return (LOOKUP_TABLE[opcode] ?? FALLBACK).name;
}

/**
 * Fallback when opcode not found in LOOKUP_TABLE.
 */
const FALLBACK = { name: 'UNKNOWN', length: 0, cpuCycles: 0 };

/**
 * Table containing the name, amount of CPU cycles and length of each opcode.
 */
const LOOKUP_TABLE = [
	{ name: 'NOP', length: 1, cpuCycles: 4 },       // 0x00
	{ name: 'LXI B', length: 3, cpuCycles: 10 },    // 0x01
	{ name: 'STAX B', length: 1, cpuCycles: 7 },    // 0x02
	{ name: 'INX B', length: 1, cpuCycles: 5 },     // 0x03
	{ name: 'INR B', length: 1, cpuCycles: 5 },     // 0x04
	{ name: 'DCR B', length: 1, cpuCycles: 5 },     // 0x05
	{ name: 'MVI B', length: 2, cpuCycles: 7 },     // 0x06
	{ name: 'RLC', length: 1, cpuCycles: 4 },       // 0x07
	{ name: '0x08', length: 1, cpuCycles: 4 },      // 0x08
	{ name: 'DAD B', length: 1, cpuCycles: 10 },    // 0x09
	{ name: 'LDAX B', length: 1, cpuCycles: 7 },    // 0x0A
	{ name: 'DCX B', length: 1, cpuCycles: 5 },     // 0x0B
	{ name: 'INR C', length: 1, cpuCycles: 5 },     // 0x0C
	{ name: 'DCR C', length: 1, cpuCycles: 5 },     // 0x0D
	{ name: 'MVI C', length: 2, cpuCycles: 7 },     // 0x0E
	{ name: 'RRC', length: 1, cpuCycles: 4 },       // 0x0F
	{ name: '0x10', length: 1, cpuCycles: 4 },      // 0x10
	{ name: 'LXI D', length: 3, cpuCycles: 10 },    // 0x11
	{ name: 'STAX D', length: 1, cpuCycles: 7 },    // 0x12
	{ name: 'INX D', length: 1, cpuCycles: 5 },     // 0x13
	{ name: 'INR D', length: 1, cpuCycles: 5 },     // 0x14
	{ name: 'DCR D', length: 1, cpuCycles: 5 },     // 0x15
	{ name: 'MVI D', length: 2, cpuCycles: 7 },     // 0x16
	{ name: 'RAL', length: 1, cpuCycles: 4 },       // 0x17
	{ name: '0x18', length: 1, cpuCycles: 4 },      // 0x18
	{ name: 'DAD D', length: 1, cpuCycles: 10 },    // 0x19
	{ name: 'LDAX D', length: 1, cpuCycles: 7 },    // 0x1A
	{ name: 'DCX D', length: 1, cpuCycles: 5 },     // 0x1B
	{ name: 'INR E', length: 1, cpuCycles: 5 },     // 0x1C
	{ name: 'DCR E', length: 1, cpuCycles: 5 },     // 0x1D
	{ name: 'MVI E', length: 2, cpuCycles: 7 },     // 0x1E
	{ name: 'RAR', length: 1, cpuCycles: 4 },       // 0x1F
	{ name: '0x20', length: 1, cpuCycles: 4 },      // 0x20
	{ name: 'LXI H', length: 3, cpuCycles: 10 },    // 0x21
	{ name: 'SHLD', length: 3, cpuCycles: 16 },     // 0x22
	{ name: 'INX H', length: 1, cpuCycles: 5 },     // 0x23
	{ name: 'INR H', length: 1, cpuCycles: 5 },     // 0x24
	{ name: 'DCR H', length: 1, cpuCycles: 5 },     // 0x25
	{ name: 'MVI H', length: 2, cpuCycles: 7 },     // 0x26
	{ name: 'DAA', length: 1, cpuCycles: 4 },       // 0x27
	{ name: '0x28', length: 1, cpuCycles: 4 },      // 0x28
	{ name: 'DAD H', length: 1, cpuCycles: 10 },    // 0x29
	{ name: 'LHLD', length: 3, cpuCycles: 16 },     // 0x2A
	{ name: 'DCX H', length: 1, cpuCycles: 5 },     // 0x2B
	{ name: 'INR L', length: 1, cpuCycles: 5 },     // 0x2C
	{ name: 'DCR L', length: 1, cpuCycles: 5 },     // 0x2D
	{ name: 'MVI L', length: 2, cpuCycles: 7 },     // 0x2E
	{ name: 'CMA', length: 1, cpuCycles: 4 },       // 0x2F
	{ name: '0x30', length: 1, cpuCycles: 4 },      // 0x30
	{ name: 'LXI SP', length: 3, cpuCycles: 10 },   // 0x31
	{ name: 'STA', length: 3, cpuCycles: 13 },      // 0x32
	{ name: 'INX SP', length: 1, cpuCycles: 5 },    // 0x33
	{ name: 'INR M', length: 1, cpuCycles: 10 },    // 0x34
	{ name: 'DCR M', length: 1, cpuCycles: 10 },    // 0x35
	{ name: 'MVI M', length: 2, cpuCycles: 10 },    // 0x36
	{ name: 'STC', length: 1, cpuCycles: 4 },       // 0x37
	{ name: '0x38', length: 1, cpuCycles: 4 },      // 0x38
	{ name: 'DAD SP', length: 1, cpuCycles: 10 },   // 0x39
	{ name: 'LDA', length: 3, cpuCycles: 13 },      // 0x3A
	{ name: 'DCX SP', length: 1, cpuCycles: 5 },    // 0x3B
	{ name: 'INR A', length: 1, cpuCycles: 5 },     // 0x3C
	{ name: 'DCR A', length: 1, cpuCycles: 5 },     // 0x3D
	{ name: 'MVI A', length: 2, cpuCycles: 7 },     // 0x3E
	{ name: 'CMC', length: 1, cpuCycles: 4 },       // 0x3F
	{ name: 'MOV B, B', length: 1, cpuCycles: 5 },  // 0x40
	{ name: 'MOV B, C', length: 1, cpuCycles: 5 },  // 0x41
	{ name: 'MOV B, D', length: 1, cpuCycles: 5 },  // 0x42
	{ name: 'MOV B, E', length: 1, cpuCycles: 5 },  // 0x43
	{ name: 'MOV B, H', length: 1, cpuCycles: 5 },  // 0x44
	{ name: 'MOV B, L', length: 1, cpuCycles: 5 },  // 0x45
	{ name: 'MOV B, M', length: 1, cpuCycles: 7 },  // 0x46
	{ name: 'MOV B, A', length: 1, cpuCycles: 5 },  // 0x47
	{ name: 'MOV C, B', length: 1, cpuCycles: 5 },  // 0x48
	{ name: 'MOV C, C', length: 1, cpuCycles: 5 },  // 0x49
	{ name: 'MOV C, D', length: 1, cpuCycles: 5 },  // 0x4A
	{ name: 'MOV C, E', length: 1, cpuCycles: 5 },  // 0x4B
	{ name: 'MOV C, H', length: 1, cpuCycles: 5 },  // 0x4C
	{ name: 'MOV C, L', length: 1, cpuCycles: 5 },  // 0x4D
	{ name: 'MOV C, M', length: 1, cpuCycles: 7 },  // 0x4E
	{ name: 'MOV C, A', length: 1, cpuCycles: 5 },  // 0x4F
	{ name: 'MOV D, B', length: 1, cpuCycles: 5 },  // 0x50
	{ name: 'MOV D, C', length: 1, cpuCycles: 5 },  // 0x51
	{ name: 'MOV D, D', length: 1, cpuCycles: 5 },  // 0x52
	{ name: 'MOV D, E', length: 1, cpuCycles: 5 },  // 0x53
	{ name: 'MOV D, H', length: 1, cpuCycles: 5 },  // 0x54
	{ name: 'MOV D, L', length: 1, cpuCycles: 5 },  // 0x55
	{ name: 'MOV D, M', length: 1, cpuCycles: 7 },  // 0x56
	{ name: 'MOV D, A', length: 1, cpuCycles: 5 },  // 0x57
	{ name: 'MOV E, B', length: 1, cpuCycles: 5 },  // 0x58
	{ name: 'MOV E, C', length: 1, cpuCycles: 5 },  // 0x59
	{ name: 'MOV E, D', length: 1, cpuCycles: 5 },  // 0x5A
	{ name: 'MOV E, E', length: 1, cpuCycles: 5 },  // 0x5B
	{ name: 'MOV E, H', length: 1, cpuCycles: 5 },  // 0x5C
	{ name: 'MOV E, L', length: 1, cpuCycles: 5 },  // 0x5D
	{ name: 'MOV E, M', length: 1, cpuCycles: 7 },  // 0x5E
	{ name: 'MOV E, A', length: 1, cpuCycles: 5 },  // 0x5F
	{ name: 'MOV H, B', length: 1, cpuCycles: 5 },  // 0x60
	{ name: 'MOV H, C', length: 1, cpuCycles: 5 },  // 0x61
	{ name: 'MOV H, D', length: 1, cpuCycles: 5 },  // 0x62
	{ name: 'MOV H, E', length: 1, cpuCycles: 5 },  // 0x63
	{ name: 'MOV H, H', length: 1, cpuCycles: 5 },  // 0x64
	{ name: 'MOV H, L', length: 1, cpuCycles: 5 },  // 0x65
	{ name: 'MOV H, M', length: 1, cpuCycles: 7 },  // 0x66
	{ name: 'MOV H, A', length: 1, cpuCycles: 5 },  // 0x67
	{ name: 'MOV L, B', length: 1, cpuCycles: 5 },  // 0x68
	{ name: 'MOV L, C', length: 1, cpuCycles: 5 },  // 0x69
	{ name: 'MOV L, D', length: 1, cpuCycles: 5 },  // 0x6A
	{ name: 'MOV L, E', length: 1, cpuCycles: 5 },  // 0x6B
	{ name: 'MOV L, H', length: 1, cpuCycles: 5 },  // 0x6C
	{ name: 'MOV L, L', length: 1, cpuCycles: 5 },  // 0x6D
	{ name: 'MOV L, M', length: 1, cpuCycles: 7 },  // 0x6E
	{ name: 'MOV L, A', length: 1, cpuCycles: 5 },  // 0x6F
	{ name: 'MOV M, B', length: 1, cpuCycles: 7 },  // 0x70
	{ name: 'MOV M, C', length: 1, cpuCycles: 7 },  // 0x71
	{ name: 'MOV M, D', length: 1, cpuCycles: 7 },  // 0x72
	{ name: 'MOV M, E', length: 1, cpuCycles: 7 },  // 0x73
	{ name: 'MOV M, H', length: 1, cpuCycles: 7 },  // 0x74
	{ name: 'MOV M, L', length: 1, cpuCycles: 7 },  // 0x75
	{ name: 'HLT', length: 1, cpuCycles: 7 },       // 0x76
	{ name: 'MOV M, A', length: 1, cpuCycles: 7 },  // 0x77
	{ name: 'MOV A, B', length: 1, cpuCycles: 5 },  // 0x78
	{ name: 'MOV A, C', length: 1, cpuCycles: 5 },  // 0x79
	{ name: 'MOV A, D', length: 1, cpuCycles: 5 },  // 0x7A
	{ name: 'MOV A, E', length: 1, cpuCycles: 5 },  // 0x7B
	{ name: 'MOV A, H', length: 1, cpuCycles: 5 },  // 0x7C
	{ name: 'MOV A, L', length: 1, cpuCycles: 5 },  // 0x7D
	{ name: 'MOV A, M', length: 1, cpuCycles: 7 },  // 0x7E
	{ name: 'MOV A, A', length: 1, cpuCycles: 5 },  // 0x7F
	{ name: 'ADD B', length: 1, cpuCycles: 4 },     // 0x80
	{ name: 'ADD C', length: 1, cpuCycles: 4 },     // 0x81
	{ name: 'ADD D', length: 1, cpuCycles: 4 },     // 0x82
	{ name: 'ADD E', length: 1, cpuCycles: 4 },     // 0x83
	{ name: 'ADD H', length: 1, cpuCycles: 4 },     // 0x84
	{ name: 'ADD L', length: 1, cpuCycles: 4 },     // 0x85
	{ name: 'ADD M', length: 1, cpuCycles: 7 },     // 0x86
	{ name: 'ADD A', length: 1, cpuCycles: 4 },     // 0x87
	{ name: 'ADC B', length: 1, cpuCycles: 4 },     // 0x88
	{ name: 'ADC C', length: 1, cpuCycles: 4 },     // 0x89
	{ name: 'ADC D', length: 1, cpuCycles: 4 },     // 0x8A
	{ name: 'ADC E', length: 1, cpuCycles: 4 },     // 0x8B
	{ name: 'ADC H', length: 1, cpuCycles: 4 },     // 0x8C
	{ name: 'ADC L', length: 1, cpuCycles: 4 },     // 0x8D
	{ name: 'ADC M', length: 1, cpuCycles: 7 },     // 0x8E
	{ name: 'ADC A', length: 1, cpuCycles: 4 },     // 0x8F
	{ name: 'SUB B', length: 1, cpuCycles: 4 },     // 0x90
	{ name: 'SUB C', length: 1, cpuCycles: 4 },     // 0x91
	{ name: 'SUB D', length: 1, cpuCycles: 4 },     // 0x92
	{ name: 'SUB E', length: 1, cpuCycles: 4 },     // 0x93
	{ name: 'SUB H', length: 1, cpuCycles: 4 },     // 0x94
	{ name: 'SUB L', length: 1, cpuCycles: 4 },     // 0x95
	{ name: 'SUB M', length: 1, cpuCycles: 7 },     // 0x96
	{ name: 'SUB A', length: 1, cpuCycles: 4 },     // 0x97
	{ name: 'SBB B', length: 1, cpuCycles: 4 },     // 0x98
	{ name: 'SBB C', length: 1, cpuCycles: 4 },     // 0x99
	{ name: 'SBB D', length: 1, cpuCycles: 4 },     // 0x9A
	{ name: 'SBB E', length: 1, cpuCycles: 4 },     // 0x9B
	{ name: 'SBB H', length: 1, cpuCycles: 4 },     // 0x9C
	{ name: 'SBB L', length: 1, cpuCycles: 4 },     // 0x9D
	{ name: 'SBB M', length: 1, cpuCycles: 7 },     // 0x9E
	{ name: 'SBB A', length: 1, cpuCycles: 4 },     // 0x9F
	{ name: 'ANA B', length: 1, cpuCycles: 4 },     // 0xA0
	{ name: 'ANA C', length: 1, cpuCycles: 4 },     // 0xA1
	{ name: 'ANA D', length: 1, cpuCycles: 4 },     // 0xA2
	{ name: 'ANA E', length: 1, cpuCycles: 4 },     // 0xA3
	{ name: 'ANA H', length: 1, cpuCycles: 4 },     // 0xA4
	{ name: 'ANA L', length: 1, cpuCycles: 4 },     // 0xA5
	{ name: 'ANA M', length: 1, cpuCycles: 7 },     // 0xA6
	{ name: 'ANA A', length: 1, cpuCycles: 4 },     // 0xA7
	{ name: 'XRA B', length: 1, cpuCycles: 4 },     // 0xA8
	{ name: 'XRA C', length: 1, cpuCycles: 4 },     // 0xA9
	{ name: 'XRA D', length: 1, cpuCycles: 4 },     // 0xAA
	{ name: 'XRA E', length: 1, cpuCycles: 4 },     // 0xAB
	{ name: 'XRA H', length: 1, cpuCycles: 4 },     // 0xAC
	{ name: 'XRA L', length: 1, cpuCycles: 4 },     // 0xAD
	{ name: 'XRA M', length: 1, cpuCycles: 7 },     // 0xAE
	{ name: 'XRA A', length: 1, cpuCycles: 4 },     // 0xAF
	{ name: 'ORA B', length: 1, cpuCycles: 4 },     // 0xB0
	{ name: 'ORA C', length: 1, cpuCycles: 4 },     // 0xB1
	{ name: 'ORA D', length: 1, cpuCycles: 4 },     // 0xB2
	{ name: 'ORA E', length: 1, cpuCycles: 4 },     // 0xB3
	{ name: 'ORA H', length: 1, cpuCycles: 4 },     // 0xB4
	{ name: 'ORA L', length: 1, cpuCycles: 4 },     // 0xB5
	{ name: 'ORA M', length: 1, cpuCycles: 7 },     // 0xB6
	{ name: 'ORA A', length: 1, cpuCycles: 4 },     // 0xB7
	{ name: 'CMP B', length: 1, cpuCycles: 4 },     // 0xB8
	{ name: 'CMP C', length: 1, cpuCycles: 4 },     // 0xB9
	{ name: 'CMP D', length: 1, cpuCycles: 4 },     // 0xBA
	{ name: 'CMP E', length: 1, cpuCycles: 4 },     // 0xBB
	{ name: 'CMP H', length: 1, cpuCycles: 4 },     // 0xBC
	{ name: 'CMP L', length: 1, cpuCycles: 4 },     // 0xBD
	{ name: 'CMP M', length: 1, cpuCycles: 7 },     // 0xBE
	{ name: 'CMP A', length: 1, cpuCycles: 4 },     // 0xBF
	{ name: 'RNZ', length: 1, cpuCycles: 11 },      // 0xC0
	{ name: 'POP B', length: 1, cpuCycles: 10 },    // 0xC1
	{ name: 'JNZ', length: 3, cpuCycles: 10 },      // 0xC2
	{ name: 'JMP', length: 3, cpuCycles: 10 },      // 0xC3
	{ name: 'CNZ', length: 3, cpuCycles: 17 },      // 0xC4
	{ name: 'PUSH B', length: 1, cpuCycles: 11 },   // 0xC5
	{ name: 'ADI', length: 2, cpuCycles: 7 },       // 0xC6
	{ name: 'RST 0', length: 1, cpuCycles: 11 },    // 0xC7
	{ name: 'RZ', length: 1, cpuCycles: 11 },       // 0xC8
	{ name: 'RET', length: 1, cpuCycles: 10 },      // 0xC9
	{ name: 'JZ', length: 3, cpuCycles: 10 },       // 0xCA
	{ name: '0xcb', length: 1, cpuCycles: 10 },     // 0xCB
	{ name: 'CZ', length: 3, cpuCycles: 10 },       // 0xCC
	{ name: 'CALL', length: 3, cpuCycles: 17 },     // 0xCD
	{ name: 'ACI', length: 2, cpuCycles: 7 },       // 0xCE
	{ name: 'RST 1', length: 1, cpuCycles: 11 },    // 0xCF
	{ name: 'RNC', length: 1, cpuCycles: 11 },      // 0xD0
	{ name: 'POP D', length: 1, cpuCycles: 10 },    // 0xD1
	{ name: 'JNC', length: 3, cpuCycles: 10 },      // 0xD2
	{ name: 'OUT', length: 2, cpuCycles: 10 },      // 0xD3
	{ name: 'CNC', length: 3, cpuCycles: 17 },      // 0xD4
	{ name: 'PUSH D', length: 1, cpuCycles: 11 },   // 0xD5
	{ name: 'SUI', length: 2, cpuCycles: 7 },       // 0xD6
	{ name: 'RST 2', length: 1, cpuCycles: 11 },    // 0xD7
	{ name: 'RC', length: 1, cpuCycles: 11 },       // 0xD8
	{ name: '0xd9', length: 1, cpuCycles: 10 },     // 0xD9
	{ name: 'JC', length: 3, cpuCycles: 10 },       // 0xDA
	{ name: 'IN', length: 2, cpuCycles: 10 },       // 0xDB
	{ name: 'CC', length: 3, cpuCycles: 10 },       // 0xDC
	{ name: '0xdd', length: 3, cpuCycles: 17 },     // 0xDD
	{ name: 'SBI', length: 2, cpuCycles: 7 },       // 0xDE
	{ name: 'RST 3', length: 1, cpuCycles: 11 },    // 0xDF
	{ name: 'RPO', length: 1, cpuCycles: 11 },      // 0xE0
	{ name: 'POP H', length: 1, cpuCycles: 10 },    // 0xE1
	{ name: 'JPO', length: 3, cpuCycles: 10 },      // 0xE2
	{ name: 'XTHL', length: 1, cpuCycles: 18 },     // 0xE3
	{ name: 'CPO', length: 3, cpuCycles: 17 },      // 0xE4
	{ name: 'PUSH H', length: 1, cpuCycles: 11 },   // 0xE5
	{ name: 'ANI', length: 2, cpuCycles: 7 },       // 0xE6
	{ name: 'RST 4', length: 1, cpuCycles: 11 },    // 0xE7
	{ name: 'RPE', length: 1, cpuCycles: 11 },      // 0xE8
	{ name: 'PCHL', length: 1, cpuCycles: 5 },      // 0xE9
	{ name: 'JPE', length: 3, cpuCycles: 10 },      // 0xEA
	{ name: 'XCHG', length: 1, cpuCycles: 5 },      // 0xEB
	{ name: 'CPE', length: 3, cpuCycles: 17 },      // 0xEC
	{ name: '0xed', length: 3, cpuCycles: 17 },     // 0xED
	{ name: 'XRI', length: 2, cpuCycles: 7 },       // 0xEE
	{ name: 'RST 5', length: 1, cpuCycles: 11 },    // 0xEF
	{ name: 'RP', length: 1, cpuCycles: 11 },       // 0xF0
	{ name: 'POP PSW', length: 1, cpuCycles: 10 },  // 0xF1
	{ name: 'JP', length: 3, cpuCycles: 10 },       // 0xF2
	{ name: 'DI', length: 1, cpuCycles: 4 },        // 0xF3
	{ name: 'CP', length: 3, cpuCycles: 17 },       // 0xF4
	{ name: 'PUSH PSW', length: 1, cpuCycles: 11 }, // 0xF5
	{ name: 'ORI', length: 2, cpuCycles: 7 },       // 0xF6
	{ name: 'RST 6', length: 1, cpuCycles: 11 },    // 0xF7
	{ name: 'RM', length: 1, cpuCycles: 11 },       // 0xF8
	{ name: 'SPHL', length: 1, cpuCycles: 5 },      // 0xF9
	{ name: 'JM', length: 3, cpuCycles: 10 },       // 0xFA
	{ name: 'EI', length: 1, cpuCycles: 4 },        // 0xFB
	{ name: 'CM', length: 3, cpuCycles: 17 },       // 0xFC
	{ name: '0xfd', length: 3, cpuCycles: 17 },     // 0xFD
	{ name: 'CPI', length: 2, cpuCycles: 7 },       // 0xFE
	{ name: 'RST 7', length: 1, cpuCycles: 11 },    // 0xFF
];
