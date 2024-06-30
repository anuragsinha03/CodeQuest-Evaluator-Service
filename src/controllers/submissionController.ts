import { Request, Response } from "express";
import { CreateSubmissionDTO } from "../dtos/CreateSubmissionDTO";

export function addSubmission(req: Request, res: Response) {
	const submissionDTO = req.body as CreateSubmissionDTO;

	//TODO: Add validation using ZOD

	return res.status(201).json({
		success: true,
		error: {},
		message: "Successfully collected the submission",
		data: submissionDTO,
	});
}
