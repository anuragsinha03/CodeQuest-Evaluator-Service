import { z } from "zod";

// export interface CreateSubmissionDTO {
// 	userId: string;
// 	problemId: string;
// 	code: string;
// 	language: string;
// }
// commented out because we can directly use ZOD (given below)

export type CreateSubmissionDTO = z.infer<typeof createSubmissionZODSchema>;

export const createSubmissionZODSchema = z
	.object({
		userId: z.string(),
		problemId: z.string(),
		code: z.string(),
		language: z.string(),
	})
	.strict();
