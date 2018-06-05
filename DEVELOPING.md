# VS Code interactive programming experience for Python

## Project structure
* `package.json` - this is the manifest file in which we declare our extension and commands
* `src-common` - this contains common type declarations between backend and frontend
* `src-backend` - this contains the logic of the program, including `extension.ts`
* `src-frontend` - this contains the UI of the webview

## Preparing the development environment
* Open a terminal and navigate to the project root (where this file is)
* Run `npm install`
* Navigate to `src-frontend`
* Run `npm install` there too

## Building the project for iterative development
* Open a terminal and navigate to the project root (where this file is)
* Execute `npm run watch-frontend`
* Open the project in VS Code
* Press `F5` to open a new window with the extension loaded
* Set breakpoints in your code inside `src-backend` to debug the backend
* Find output from the extension in the debug console
* Changes you make to `src-frontend` are automatically re-compiled

## Building the project for distribution
* Open a terminal and navigate to the project root (where this file is)
* Execute `npm run compile`
* Find the outputs in `/out` and `/html`

## Testing

* To run **backend** tests, execute `npm run test`
* To run **frontend** tests, execute `npm run test-frontend`

## List of all build commands
* `npm install` - Installs node dependencies.
* `npm run clean` - Cleans the build output.
* `npm run build-types` - Builds **src-common** and makes it available to the backend and frontend projects. Do this every time you edit **src-common**.
* `npm run compile-frontend` - Compiles the Angular project for production.
* `npm run watch-frontend` - Compiles the Angular project and watches the directory for changes, automatically recompiling any.
* `npm run compile-backend` - Compiles the VS Code Typescript extension.
* `npm run watch-backend` - Compiles the VS Code Typescript extension and watches the directory for changes.
* `npm run compile` - Compiles types, backend, and frontend.
* `npm run watch` - Compiles types, then watches backend. Does not compile frontend.
* `npm run test` - Runs the unit tests.
