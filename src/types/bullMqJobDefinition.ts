import { Job } from "bullmq";

// It defines how a job looks like
export interface IJob {
	name: string; //Every job has a name
	payload?: Record<string, unknown>; //every job has a payload which is an object containing the data on which the consumer will perfrom operations
	handle: (job?: Job) => void; //It is a function which takes an arg job of type bullmq Job and return type void, it defines what operation to be performed on the payload (processing)
	failed: (job?: Job) => void; //It defines what to do if something goes wrong (like retry/failure mechanism)
}
