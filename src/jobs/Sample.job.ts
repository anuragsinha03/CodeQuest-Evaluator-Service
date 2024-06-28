import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefinition";

export default class SampleJob implements IJob {
	name: string;
	payload: Record<string, unknown>;
	constructor(payload: Record<string, unknown>) {
		this.payload = payload;
		this.name = this.constructor.name || "SampleJob";
	}

	handle = () => {
		console.log("Handler of the job called");
	};

	failed = (job?: Job): void => {
		console.log("JOB FAILED");
		if (job) console.log(job.id);
	};
}
