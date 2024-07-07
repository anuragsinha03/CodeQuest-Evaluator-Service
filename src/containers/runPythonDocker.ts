import Docker from "dockerode";
import createContainer from "./containerFactory";
import { TestCases } from "../types/testCases";
import { PYTHON_IMAGE } from "../utils/constants";
import decodeDockerStream from "./dockerHelper";

async function runPython(code: string, inputTestCase: string) {
	const rawLogBuffer: Buffer[] = [];

	console.log("Initialising a new python docker container");

	const runCommand = `echo '${code.replace(
		/'/g,
		`'||"`
	)}' > test.py && echo '${inputTestCase.replace(
		/'/g,
		`'||"`
	)}' | python3 test.py`;

	// const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
	// 	"python3",
	// 	"-c",
	// 	code,
	// 	"stty -echo",
	// ]);

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

	loggerStream.on("end", () => {
		console.log(rawLogBuffer);
		const completeBuffer = Buffer.concat(rawLogBuffer);
		const decodedStream = decodeDockerStream(completeBuffer);
		console.log(decodedStream);
		console.log(decodedStream.stdout);
	});

	//return the started container
	return pythonDockerContainer;
}

export default runPython;
