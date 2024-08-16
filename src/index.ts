import express, { Express } from "express";
import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/SampleWorker";
import bullBoardAdapter from "./config/bullBoardConfig";
import runPython from "./containers/pythonExecutor";
import runJava from "./containers/javaExecutor";
import runCpp from "./containers/cppExecutor";
import SubmissionWorker from "./workers/SubmissionWorker";
import { submission_queue } from "./utils/constants";
import submissionQueueProducer from "./producers/submissionQueueProducer";

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
	SubmissionWorker(submission_queue);

	// submissionQueueProducer({
	// 	"1234": {
	// 		language: "CPP",
	// 		code: `
	// #include<iostream>
	// using namespace std;

	// int main(){
	// 	int x;
	// 	cin>>x;
	// 	cout<<"Value of x is: "<<x<<endl;
	// 	for(int i=0; i<x; i++){
	// 		cout<<i << " ";
	// 	}
	// 	cout<<endl;
	// 	return 0;
	// }
	// `,
	// 		inputCase: `10`,
	// 	},
	// });

	// const code = `pritnt("hello anurag")`; // This code has syntax error so it will give stderr stream as output
	// const code = `print("hello anurag")`; // This code will give stdout as output stream

	// 	const code = `
	// #include<iostream>
	// using namespace std;

	// int main(){
	// 	int x;
	// 	cin>>x;
	// 	cout<<"Value of x is: "<<x<<endl;
	// 	for(int i=0; i<x; i++){
	// 		cout<<i << " ";
	// 	}
	// 	cout<<endl;
	// 	return 0;
	// }
	// `;

	// 	const code = `
	// x = input()
	// print("User has given input as: ", x)
	// for i in range(int(x)):
	// 	print(i);
	// `;

	// 	const inputCase = `10`;

	// 	runPython(code, inputCase);

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
