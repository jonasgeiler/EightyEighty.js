import { u16, u8 } from 'typed-numbers';

/**
 * Represents the memory of the CPU.
 */
export class Memory {

	/** Memory size. */
	public static readonly MEMORY_SIZE: number = 0x10000; // 16K


	/** Memory data. */
	public data = new ArrayBuffer(Memory.MEMORY_SIZE);

	/** Memory data view. */
	protected view = new DataView(this.data);


	/**
	 * Load a whole buffer into memory, starting at `offset`.
	 * @param buffer - The buffer to load into memory. Can be of any array-like type.
	 * @param [offset = 0] - The offset from where to start writing the buffer into memory.
	 */
	public load(buffer: ArrayLike<number>, offset: number = 0) {
		for (let address = 0; address < buffer.length; address++) {
			if (offset + address >= Memory.MEMORY_SIZE) throw new Memory.NotEnoughMemoryError();

			this.set(u16(offset + address), u8(buffer[address]));
		}
	}


	/**
	 * Read memory at `address`.
	 * @param address - The address.
	 * @return - The value as an unsigned 8-bit integer.
	 */
	public get(address: u16): u8 {
		return this.view.getUint8(address) as u8;
	}

	/**
	 * Write `value` to memory at `address`.
	 * @param address - The address.
	 * @param value - The unsigned 8-bit integer to write into memory.
	 */
	public set(address: u16, value: u8) {
		this.view.setUint8(address, value);
	}


	/**
	 * Read memory at `address` and `address + 1`.
	 * @param address - The address.
	 * @return - The value as an unsigned 16-bit integer.
	 */
	public getWord(address: u16): u16 {
		return this.view.getUint16(address, true) as u16;
	}

	/**
	 * Write `value` to memory at `address`.
	 * @param address - The address.
	 * @param value - The unsigned 16-bit integer to write into memory.
	 */
	public setWord(address: u16, value: u16) {
		this.view.setUint16(address, value, true);
	}

}

export namespace Memory {

	export class NotEnoughMemoryError extends Error {
		constructor() {
			super('Not enough memory for this operation!');
		}
	}

}
