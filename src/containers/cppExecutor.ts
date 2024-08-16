import createContainer from "./containerFactory";
import { CPP_IMAGE } from "../utils/constants";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";
import CodeExecutorStrategy, {
	ExecutionResponse,
} from "../types/CodeExecutorStrategy";

class CppExecutor implements CodeExecutorStrategy {
	async execute(
		code: string,
		inputTestCase: string
	): Promise<ExecutionResponse> {
		const rawLogBuffer: Buffer[] = [];

		// Automatically download the docker image required to run the code
		await pullImage(CPP_IMAGE);

		console.log("Initialising a new CPP docker container");

		const runCommand = `echo '${code.replace(
			/'/g,
			`'||"`
		)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(
			/'/g,
			`'||"`
		)}' | ./main`;

		const cppDockerContainer = await createContainer(CPP_IMAGE, [
			"/bin/sh",
			"-c",
			runCommand,
		]);

		//starting the python docker container
		await cppDockerContainer.start();

		console.log("started the docker container");

		//attaching log stream to the created container
		const loggerStream = await cppDockerContainer.logs({
			stdout: true,
			stderr: true,
			timestamps: false,
			follow: true, //whether the logs are streamed (true) or returned as a string (false)
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
			await cppDockerContainer.remove();
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

export default CppExecutor;
