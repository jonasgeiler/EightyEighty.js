const { readFile } = require('fs/promises');
const { Cpu, Memory } = require('..');
const { u16 } = require('typed-numbers');

const DEBUG = false;

const dummyDevice = {
	input(port) {
		console.log('INPUT', port);
		return 0;
	},

	output(port, byte) {
		console.log('OUTPUT', port, byte);
	},
};

async function runTest(filename, successfulExitStr) {
	const programFile = `${__dirname}/roms/${filename}`;
	const programBuffer = await readFile(programFile);

	const mem = new Memory();
	mem.load(programBuffer, 0x100);
	mem.set(0x0005, 0xc9);

	const cpu = new Cpu(mem, dummyDevice, DEBUG);
	cpu.reg.pc = 0x100; // Because tests used the pseudo instruction ORG 0x0100

	let output = '';
	mainLoop: while (true) {
		if (cpu.halted) break;

		cpu.next();

		if (cpu.reg.pc === 0x0005) {
			if (cpu.reg.c === 0x09) {
				let address = cpu.reg.getDE();

				while (true) {
					const char = String.fromCharCode(mem.get(address));

					if (char === '$') {
						break;
					} else {
						address++;
					}

					output += char;
					process.stdout.write(char);
				}
			}

			if (cpu.reg.c === 0x02) {
				const char = String.fromCharCode(cpu.reg.e);

				output += char;
				process.stdout.write(char);
			}
		}

		if (cpu.reg.pc === 0x0000) {
			output += '\n\n';
			process.stdout.write('\n\n');
			break;
		}
	}

	if (output.trim().endsWith(successfulExitStr)) {
		console.log(`>>> TEST SUCCESSFUL: ${filename}`);
		return true;
	}

	console.error(`>>> TEST FAILED: ${filename}`);
	process.exit(1);
	return false;
}

(async () => {
	await runTest('8080PRE.COM', '8080 Preliminary tests complete');
	await runTest('TST8080.COM', 'CPU IS OPERATIONAL');
	await runTest('CPUTEST.COM', 'CPU TESTS OK');
	await runTest('CPUDIAG.COM', 'CPU IS OPERATIONAL');
	await runTest('8080EXM.COM', 'Tests complete');
	await runTest('8080EXER.COM', 'Tests complete');

	console.log('>>> ALL TESTS SUCCESSFUL!');
	process.exit(0);
})();
