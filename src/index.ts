import express, { Express } from "express";
import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/SampleWorker";
import bullBoardAdapter from "./config/bullBoardConfig";
import runPython from "./containers/runPythonDocker";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use("/api", apiRouter);
app.use("/ui", bullBoardAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
	console.log(`Server started at  PORT: ${serverConfig.PORT}`);

	console.log(
		`BullBoard dashboard running on: http://localhost:${serverConfig.PORT}/ui`
	);

	SampleWorker("SampleQueue");

	// const code = `pritnt("hello anurag")`; // This code has syntax error so it will give stderr stream as output
	// const code = `print("hello anurag")`; // This code will give stdout as output stream

	const code = `
x = input()
y = input()
print("value of x is ", x)
print("value of y is ", y)
`;

	const inputCase = `100
200
`;

	runPython(code, inputCase);
	// sampleQueueProducer(
	// 	"SampleJob",
	// 	{
	// 		name: "Kaushik",
	// 		company: "GOOG",
	// 		position: "SDE-2",
	// 		location: "HYD",
	// 	},
	// 	2
	// ); //priority = 2 (LESSER)

	// sampleQueueProducer(
	// 	"SampleJob",
	// 	{
	// 		name: "Anurag",
	// 		company: "MSFT",
	// 		position: "SDE-1",
	// 		location: "Remote | BLR | NCR",
	// 	},
	// 	1
	// ); // priority = 1 (GREATER)
});
