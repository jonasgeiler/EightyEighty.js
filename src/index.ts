import { Command, flags } from '@oclif/command';
import { promises as fs } from 'fs';
import * as process from 'process';
import { u16, u8 } from 'typed-numbers';
import { Cpu, Memory } from './core';

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

		const mem = new Memory();
		mem.load(programBuffer, 0x100);

		const cpu = new Cpu(mem, {
			input(port: u8): u8 {
				console.log('input', port);
				return u8(0);
			},
			output(port: u8, byte: u8) {
				console.log('output', port, byte);
			},
		});
		cpu.reg.pc = u16(0x0100);

		mainLoop: while (true) {
			if (cpu.halted) break;

			cpu.next();

			if (cpu.reg.pc == 0x0005) {
				if (cpu.reg.c == 0x09) {
					let address = cpu.reg.getDE();

					while (true) {
						const char = String.fromCharCode(mem.get(address));

						if (char == '$') {
							break mainLoop;
						} else {
							address = u16(address + 1);
						}

						process.stdout.write(char);
					}
				}

				if (cpu.reg.c == 0x02) {
					const char = String.fromCharCode(cpu.reg.e);

					process.stdout.write(char);
				}
			}

			if (cpu.reg.pc == 0x0000) {
				process.stdout.write('\n\n');
				break;
			}
		}
	}
}

export = EightyEightyJs
