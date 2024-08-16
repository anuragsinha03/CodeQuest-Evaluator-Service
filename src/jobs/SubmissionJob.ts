import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefinition";
import { SubmissionPayload } from "../types/submissionPayload";
import runCpp from "../containers/cppExecutor";
import createExecutor from "../utils/ExecutorFactory";
import { ExecutionResponse } from "../types/CodeExecutorStrategy";

export default class SubmissionJob implements IJob {
	name: string;
	payload: Record<string, SubmissionPayload>;
	constructor(payload: Record<string, SubmissionPayload>) {
		this.payload = payload;
		this.name = this.constructor.name || "SubmissionJob";
	}

	handle = async (job?: Job) => {
		console.log("Handler of the job called");
		console.log(this.payload);
		if (job) {
			const key = Object.keys(this.payload)[0];
			const codeLanguage = this.payload[key].language;
			const code = this.payload[key].code;
			const inputTestCase = this.payload[key].inputCase;

			const strategy = createExecutor(codeLanguage);
			if (strategy != null) {
				const response: ExecutionResponse = await strategy.execute(
					code,
					inputTestCase
				);

				if (response.status === "COMPLETED") {
					console.log("Code executed successfully");
					console.log(response);
				} else {
					console.log("Something went wrong with code execution");
					console.log(response);
				}
			}
		}
	};

	failed = (job?: Job): void => {
		console.log("JOB FAILED");
		if (job) console.log(job.id);
	};
}
