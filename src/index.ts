import { Command, flags } from '@oclif/command';
import { promises as fs } from 'fs';
import { u16, u8 } from 'typed-numbers';
import { Cpu } from './core';
import { toHexStr } from './utils';


class EightyEightyJs extends Command {
	public static description = 'A simple Intel 8080 emulator';

	public static flags = {

		version: flags.version({
			char:        'v',
			description: 'Show CLI version',
		}),

		help: flags.help({
			char:        'h',
			description: 'Show CLI help',
		}),

	};

	public static args = [
		{
			name:        'file',
			description: 'A compiled Intel 8080 program',
			// required:    true,
		},
	];

	public async run() {
		//const { args } = this.parse(EightyEightyJs);

		const programBuffer = await fs.readFile(__dirname + '/../machines/CPU Diagnose/cpudiag.bin');

		const cpu = new Cpu();
		cpu.loadProgram(programBuffer, 0x0100);
		cpu.pc = u16(0x100);

		while (true) {
			cpu.emulate({
				input(port: u8): u8 {
					console.log('input', toHexStr(port));

					return u8(0x00);
				},

				output(port: u8, byte: u8) {
					console.log('output', toHexStr(port), toHexStr(byte));
				},
			});
		}
	}
}

export = EightyEightyJs
