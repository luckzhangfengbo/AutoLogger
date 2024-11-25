# Auto Logger Changelog

## v0.0.1 - Initial Release
**Release Date**: 2024-11-25

### New Features
- Added support for generating debug logs for the following languages:
  - Java: Generates `System.out.println` statements.
  - Python: Generates `print` statements for variables, lists, and dictionaries.
  - JavaScript/TypeScript: Generates `console.log` statements.
  - Go: Generates `fmt.Println` statements.
  - Rust: Generates `println!` macros.
- Implemented smart variable handling:
  - Automatically detects variable types (e.g., strings, numbers, booleans).
  - Generates type-specific debug logs.
- Added support for function execution logs:
  - Automatically includes function name and parameters in logs.
- Introduced class and object support:
  - Generates logs for class methods and member variables.
- Cross-platform compatibility:
  - Supports Windows, Linux, and macOS.