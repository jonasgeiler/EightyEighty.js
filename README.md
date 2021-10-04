<h1 align="center">EightyEighty.js</h1>
<p align="center">A nice little Intel 8080 emulator for Node.js and Browser!</p>
<p align="center">
  <a href="#about">About</a> •
  <a href="#installation">Installation</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#faqs">FAQs</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## About

Originally I wrote this because I was interested in how emulators work, and what a CPU actually does.  
But, after several days of work, I managed to put together a pretty good codebase, 
therefore I've decided to make this emulator available as a library of its own, 
so that anyone could embed it in their web pages or applications!

I mostly followed the tutorial here: http://emulator101.com

## Installation

```sh-session
With npm:
$ npm install eighty-eighty-js

With pnpm (recommended):
$ pnpm install eighty-eighty-js

With yarn:
$ yarn add eighty-eighty-js
```
or you can directly add it to your website via [unpkg](https://unpkg.com/):
```html
<script src="https://unpkg.com/eighty-eighty-js"></script>
```

## Usage

```typescript
import { Cpu, Memory, Device } from 'eighty-eighty-js';
import { promises as fs } from 'fs';

// Read ROM
const programBuffer = await fs.readFile('./example-rom.bin');

// Init Memory
const mem = new Memory();

// Load ROM into Memory
mem.load(programBuffer, 0x100);

// Device that handles inputs and outputs
const device: Device = {
	input(port) {
		console.log('INPUT', port);
		return 0;
	},

	output(port, byte) {
		console.log('OUTPUT', port, byte);
	},
};

// Init CPU
const cpu = new Cpu(mem, device);

// Execution Loop
while (true) {
	// Check if halted
	if (cpu.halted) break;
	
	cpu.next(); // CPU operation without any delays
	// OR
	await cpu.step(); // Simulates real Intel 8080 speed
}
```

## Resources

These resources helped a lot while developing the emulator:

- [Emulator 101](http://emulator101.com/)
- [8080 Programmers Manual](https://altairclone.com/downloads/manuals/8080%20Programmers%20Manual.pdf)
- [8080 By Opcode](http://www.emulator101.com/reference/8080-by-opcode.html)
- [Intel 8080 on Wikipedia](https://en.wikipedia.org/wiki/Intel_8080)

## License

[MIT License](https://github.com/Skayo/EightyEighty.js/blob/main/LICENSE)
