# Auto Logger

## Overview

**Auto Logger** is a VS Code extension designed to streamline the process of generating debug logs. It supports popular programming languages such as Java, Python, JavaScript, Go, and Rust. By using a simple shortcut key, developers can quickly generate language-specific print statements for variables, functions, classes, and more, significantly improving debugging efficiency.

---

## Key Features

### 🛠 Supported Languages
- **Java**: Generates `System.out.println` statements tailored to variable types and function calls.
- **Python**: Creates `print` statements for dictionaries, lists, booleans, and other complex structures.
- **JavaScript/TypeScript**: Produces `console.log` statements for objects and function outputs.
- **Go**: Supports the generation of `fmt.Println` log statements.
- **Rust**: Provides `println!` log macros compatible with debugging.

### ⚙️ Detailed Features
1. **Smart Variable Handling**
   - Automatically detects variable types (strings, numbers, booleans, arrays, etc.).
   - Generates language-specific print statements.
   - Supports multiline and complex variable logging.

2. **Function Debugging**
   - Automatically logs function executions.
   - Includes function names and arguments for easier issue tracking.

3. **Class and Object Support**
   - Generates structured logs for classes and objects.
   - Differentiates between member variables and method calls.

4. **Cross-Platform Compatibility**
   - Works out of the box without additional configuration.
   - Supports Windows, Linux, and macOS development environments.

5. **Customizability**
   - Shortcut keys are configurable to suit individual development preferences.

---

## How to Use

### 1️⃣ Install the Extension
1. Open VS Code.
2. Go to the Extensions Marketplace and search for **Auto Logger**.
3. Click **Install**.

### 2️⃣ Trigger the Shortcut
- Select a variable, function, or class name in your code.
- Press the default shortcut `Ctrl + Alt + P` (Windows/Linux) or `Cmd + Alt + P` (macOS).
- The extension will automatically insert a language-appropriate print statement below the selection.

### 3️⃣ Example

#### Input Code:
```js
class MyClass {
    myFunction() {
        const myVariable = 42;
        const anotherVariable = "Hello";
        // User selects `myVariable`
    }
}
