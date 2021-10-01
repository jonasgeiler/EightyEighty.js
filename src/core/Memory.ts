import { u16, u8 } from 'typed-numbers';

export class Memory {

	/**
	 * Memory size.
	 */
	private static readonly MEMORY_SIZE: number = 0x10000; // 16K

	/**
	 * The memory.
	 * @protected
	 */
	protected memory: Uint8Array;

	/**
	 * Memory constructor.
	 */
	constructor() {
		this.memory = new Uint8Array(Memory.MEMORY_SIZE);
	}

	/**
	 * Write a whole array or buffer into memory.
	 * @param buffer - Array-like buffer, like Uint8Array or Buffer.
	 * @param offset - Offset where to begin writing.
	 */
	public load(buffer: ArrayLike<number>, offset: number = 0) {
		for (let address = 0; address < buffer.length; address++) {
			if (offset + address >= this.memory.length) throw new Memory.NotEnoughMemoryError();

			this.memory[offset + address] = u8(buffer[address]);
		}
	}

	/**
	 * Read a byte from memory.
	 * @param address - Uint16 address
	 * @return Uint8 value
	 */
	public read(address: u16): u8 {
		return u8(this.memory[address]);
	}

	/**
	 * Write a byte to memory.
	 * @param address - Uint16 address
	 * @param value - Uint8 value
	 */
	public write(address: u16, value: u8) {
		this.memory[address] = u8(value);
	}

}

export namespace Memory {

	export class NotEnoughMemoryError extends Error {
		constructor() {
			super('Not enough memory for this operation!');
		}
	}

}
