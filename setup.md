## How to setup a new Typescript express project

1. Initialize npm project (It creates a package.json file)
```
npm init -y
```

2. Install Typescript and Concurrently (to execute multiple scripts concurrently)
```
npm install -D typescript
npm install concurrently
```

3. Initialize a Typescript project (It creates a tsconfig.json file)
```
tsc --init
```

4. Add the following scripts in package.json
```
{
		"build": "npx tsc",
		"watch": "npx tsc -w",
		"prestart": "npm run build",
		"start": "npx nodemon dist/index.js",
		"dev": "npx concurrently --kill-others \"npm run watch\" \"npm start \""
},
```

Note: Make relevant config changes in tsconfig.json

5. Start the server
```
npm run dev
```