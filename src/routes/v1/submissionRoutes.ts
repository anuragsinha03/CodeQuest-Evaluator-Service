import { addSubmission } from "../../controllers/submissionController";
import { createSubmissionZODSchema } from "../../dtos/CreateSubmissionDTO";
import { validate } from "../../validators/createSubmissionValidator";

const express = require("express");

const submissionRouter = express.Router();

submissionRouter.post("/", validate(createSubmissionZODSchema), addSubmission);

export default submissionRouter;
