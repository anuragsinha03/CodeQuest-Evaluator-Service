import express from "express";
import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/SampleWorker";

const app = express();

app.use('/api', apiRouter)

app.listen(serverConfig.PORT, () => {
	console.log(`Server started at PORT: ${serverConfig.PORT}`);

	SampleWorker("SampleQueue");

	sampleQueueProducer("SampleJob", {
		name: "Anurag",
		company: "MSFT",
		position: "SDE-1",
		location: "Remote | BLR | NCR"
	})
});
