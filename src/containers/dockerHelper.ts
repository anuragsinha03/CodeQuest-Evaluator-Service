import DockerStreamOutput from "../types/dockerStreamOutput";
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constants";

export default function decodeDockerStream(buffer: Buffer): DockerStreamOutput {
	let offset = 0; // This variable keeps track of the current position in the buffer while parsing

	// The output that will store the accumulated stdout and sterr output as strings
	const output: DockerStreamOutput = { stdout: "", stderr: "" };

	// Loop until the offset reaches end of the buffer
	// and read the Buffer, chunk by chunk
	// Each chunk has
	// - header (1. Type of stream, 2. Length of value)
	// - value
	while (offset < buffer.length) {
		// typeOfStream is read from buffer and has value of type of stream
		const typeOfStream = buffer[offset];

		// This length variable hold the length of the value
		// We will read this variable on an offset of 4 Bytes from the start of the chunk
		const length = buffer.readUInt32BE(offset + 4);

		// as now we have read the header, we can move forward to the value of the chunk
		offset += DOCKER_STREAM_HEADER_SIZE;

		// set the stream according to their type
		if (typeOfStream === 1) {
			//stdout stream
			output.stdout += buffer.toString("utf-8", offset, offset + length);
		} else if (typeOfStream === 2) {
			//stderr stream
			output.stderr += buffer.toString("utf-8", offset, offset + length);
		}

		offset += length; // Move offset to the next chunk
	}

	return output;
}
