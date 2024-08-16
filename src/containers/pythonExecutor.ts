import createContainer from "./containerFactory";
import { PYTHON_IMAGE } from "../utils/constants";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";
import CodeExecutorStrategy, {
	ExecutionResponse,
} from "../types/CodeExecutorStrategy";

class PythonExecutor implements CodeExecutorStrategy {
	async execute(
		code: string,
		inputTestCase: string,
		outputTestCase: string
	): Promise<ExecutionResponse> {
		console.log(code, inputTestCase, outputTestCase);

		const rawLogBuffer: Buffer[] = [];

		// Automatically download the docker image required to run the code
		await pullImage(PYTHON_IMAGE);

		console.log("Initialising a new python docker container");

		const runCommand = `echo '${code.replace(
			/'/g,
			`'||"`
		)}' > test.py && echo '${inputTestCase.replace(
			/'/g,
			`'||"`
		)}' | python3 test.py`;

		const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
			"/bin/sh",
			"-c",
			runCommand,
		]);

		//starting the python docker container
		await pythonDockerContainer.start();

		console.log("started the docker container");

		//attaching log stream to the created container
		const loggerStream = await pythonDockerContainer.logs({
			stdout: true,
			stderr: true,
			timestamps: false,
			follow: true, //wheter the logs are streamed (true) or returned as a string (false)
		});

		//attach events on the stream objects to start and stop reading
		loggerStream.on("data", chunk => {
			rawLogBuffer.push(chunk);
		});

		try {
			const codeResponse: string = await this.fetchDecodedStream(
				loggerStream,
				rawLogBuffer
			);

			return { output: codeResponse, status: "COMPLETED" };
		} catch (error) {
			return { output: error as string, status: "Error" };
		} finally {
			//after execution of the code, remove the container automatically
			await pythonDockerContainer.remove();
		}
	}

	fetchDecodedStream(
		loggerStream: NodeJS.ReadableStream,
		rawLogBuffer: Buffer[]
	): Promise<string> {
		return new Promise((resolve, reject) => {
			loggerStream.on("end", () => {
				console.log(rawLogBuffer);
				const completeBuffer = Buffer.concat(rawLogBuffer);
				const decodedStream = decodeDockerStream(completeBuffer);
				console.log(decodedStream);
				console.log(decodedStream.stdout);
				if (decodedStream.stderr) {
					reject(decodedStream.stderr);
				} else {
					resolve(decodedStream.stdout);
				}
			});
		});
	}
}

export default PythonExecutor;
