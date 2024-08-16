import Docker from "dockerode";
import createContainer from "./containerFactory";
import { TestCases } from "../types/testCases";
import { JAVA_IMAGE } from "../utils/constants";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";
import CodeExecutorStrategy, {
	ExecutionResponse,
} from "../types/CodeExecutorStrategy";
import Dockerode from "dockerode";

class JavaExecutor implements CodeExecutorStrategy {
	async execute(
		code: string,
		inputTestCase: string,
		outputTestCase: string
	): Promise<ExecutionResponse> {
		//console.log(code, inputTestCase, outputTestCase);
		console.log("Java Executor called");
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

			if (codeResponse.trim() === outputTestCase.trim()) {
				return { output: codeResponse, status: "SUCCESS" };
			} else {
				return { output: codeResponse, status: "WA" };
			}
		} catch (error) {
			console.log("Error Occured: ", error);
			if (error === "TLE") {
				await javaDockerContainer.kill();
				return { output: error as string, status: "TLE" };
			}
			return { output: error as string, status: "RE" };
		} finally {
			//after execution of the code, remove the container automatically
			await javaDockerContainer.remove();
		}
	}

	fetchDecodedStream(
		loggerStream: NodeJS.ReadableStream,
		rawLogBuffer: Buffer[]
	): Promise<string> {
		// Todo: May be moved to the dockerHelper.ts

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				console.log("Timeout called");
				reject("TLE");
			}, 6000);

			loggerStream.on("end", () => {
				// This callback executes when the stream ends
				clearTimeout(timeout);
				// console.log(rawLogBuffer);
				const completeBuffer = Buffer.concat(rawLogBuffer);
				const decodedStream = decodeDockerStream(completeBuffer);
				// console.log(decodedStream);
				// console.log(decodedStream.stdout);
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
