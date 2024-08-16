import Docker from "dockerode";
import createContainer from "./containerFactory";
import { TestCases } from "../types/testCases";
import { JAVA_IMAGE } from "../utils/constants";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";
import CodeExecutorStrategy, {
	ExecutionResponse,
} from "../types/CodeExecutorStrategy";

class JavaExecutor implements CodeExecutorStrategy {
	async execute(
		code: string,
		inputTestCase: string
	): Promise<ExecutionResponse> {
		const rawLogBuffer: Buffer[] = [];

		// Automatically download the docker image required to run the code
		await pullImage(JAVA_IMAGE);

		console.log("Initialising a new java docker container");

		const runCommand = `echo '${code.replace(
			/'/g,
			`'||"`
		)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(
			/'/g,
			`'||"`
		)}' | java Main`;

		const javaDockerContainer = await createContainer(JAVA_IMAGE, [
			"/bin/sh",
			"-c",
			runCommand,
		]);

		//starting the python docker container
		await javaDockerContainer.start();

		console.log("started the docker container");

		//attaching log stream to the created container
		const loggerStream = await javaDockerContainer.logs({
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
			await javaDockerContainer.remove();
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

export default JavaExecutor;
