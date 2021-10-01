i8080
=====

A simple Intel 8080 emulator written in JavaScript

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/i8080.svg)](https://npmjs.org/package/i8080)
[![Downloads/week](https://img.shields.io/npm/dw/i8080.svg)](https://npmjs.org/package/i8080)
[![License](https://img.shields.io/npm/l/i8080.svg)](https://github.com/Skayo/EightyEighty.js/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Installation

Use directly with `npx`:
```sh-session
npx i8080 ...
```
or install globally:
```sh-session
$ npm install -g i8080

$ i8080 ...
```

## Usage

```sh-session
$ i8080 0x0100 './roms/CPU Diagnose/cpudiag.bin'
$ i8080 0x0000 './roms/Space Invaders (1978)/invaders.h' 0x0800 './roms/Space Invaders (1978)/invaders.g' 0x1000 './roms/Space Invaders (1978)/invaders.f' 0x1800 './roms/Space Invaders (1978)/invaders.e'
```

## Machines

I have currently implemented two machines:

### `arcade`

An Arcade machine, initially designed for Space Invaders, but might work for other games too!

### `diagnose`

A machine that runs the program and prints every operation, including inputs and outputs.  
Always passes `0x00` as input.

## Resources

These resources helped a lot while developing this emulator:

- [Emulator 101](http://emulator101.com/)
- [8080 Programmers Manual](https://altairclone.com/downloads/manuals/8080%20Programmers%20Manual.pdf)
- [8080 By Opcode](http://www.emulator101.com/reference/8080-by-opcode.html)
- [Intel 8080 on Wikipedia](https://en.wikipedia.org/wiki/Intel_8080)
