import Docker from "dockerode";

async function createContainer(imageName: string, cmdExecutable: string[]) {
	const docker = new Docker();

	const container = await docker.createContainer({
		Image: imageName,
		Cmd: cmdExecutable,
		AttachStdin: true, //to enable input streams
		AttachStdout: true, //to enable output streams
		AttachStderr: true, //to enable error streams
		OpenStdin: true, //keep the input stream open even when no interaction is there
		Tty: false,
		HostConfig: {
			Memory: 1024 * 1024 * 512, //512MB
		},
	});

	return container;
}

export default createContainer;
