import express from "express";
import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/SampleWorker";
import bullBoardAdapter from "./config/bullBoardConfig";

const app = express();

app.use("/api", apiRouter);
app.use("/ui", bullBoardAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
	console.log(`Server started at PORT: ${serverConfig.PORT}`);

	console.log(
		`BullBoard dashboard running on: http://localhost:${serverConfig.PORT}/ui`
	);

	SampleWorker("SampleQueue");

	sampleQueueProducer(
		"SampleJob",
		{
			name: "Kaushik",
			company: "GOOG",
			position: "SDE-2",
			location: "HYD",
		},
		2
	); //priority = 2 (LESSER)

	sampleQueueProducer(
		"SampleJob",
		{
			name: "Anurag",
			company: "MSFT",
			position: "SDE-1",
			location: "Remote | BLR | NCR",
		},
		1
	); // priority = 1 (GREATER)
});
