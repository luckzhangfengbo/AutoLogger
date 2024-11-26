const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.insertDebugLog', function () {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;

        // 获取用户选择的文本（即要打印的内容）
        const selectedText = document.getText(selection).trim();

        if (!selectedText) {
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Please select a variable, function, or class to log.',
                    cancellable: false
                },
                () => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve();
                        }, 3000); // 2秒后自动关闭
                    });
                }
            );
            return;
        }

        // 检测文件语言类型或后缀
        const languageId = document.languageId;
        const isVueFile = document.fileName.endsWith('.vue');

        if (isVueFile) {
            if (!isInScriptBlock(document, selection.start.line)) {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'Please select content inside the <script> block of the Vue file.',
                        cancellable: false
                    },
                    () => {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve(); // 2 秒后自动关闭通知
                            }, 3000);
                        });
                    }
                );
                return;
            }
        }

        // 获取当前光标所在的上下文
        // const currentContext = getContext(document, selection.start.line);
        // const { className, functionName } = currentContext;

        // 判断选中内容类型并生成打印语句
        const logStatement = generateLogStatement(languageId === 'vue' ? 'javascript' : languageId, selectedText, selection.start.line);

        if (!logStatement) {
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `Unsupported content or language: ${languageId}`,
                    cancellable: false
                },
                () => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve();
                        }, 3000); // 2 秒后自动关闭通知
                    });
                }
            );
            return;
        }

        // 获取插入位置
        const linePosition = selection.start.line;
        const lineText = document.lineAt(linePosition).text;
        const indentColumn = lineText.match(/^\s*/)[0].length; // 计算当前行左侧缩进
        const indent = ' '.repeat(indentColumn);

        // 在当前行的下一行插入打印语句，并与当前行左侧对齐
        const nextLinePosition = new vscode.Position(linePosition + 1, 0);

        editor.edit(editBuilder => {
            editBuilder.insert(nextLinePosition, `${indent}${logStatement}\n`);
        });
    });

    context.subscriptions.push(disposable);
}

/**
 * 判断 Vue 文件中是否在 <script> 块内
 */
function isInScriptBlock(document, currentLine) {
    const textLines = document.getText().split('\n');
    let inScript = false;

    for (let i = 0; i <= currentLine; i++) {
        const line = textLines[i].trim();
        if (line.startsWith('<script')) {
            inScript = true;
        } else if (line.startsWith('</script>')) {
            inScript = false;
        }
    }

    return inScript;
}

/**
 * 获取当前打印的行号
 */
function getCurrentLineNumber(document, line) {
    return line + 2; // 因为索引是从 0 开始的，返回行号时加 1
}

/**
 * 获取当前上下文（类名和函数名）
 */
// function getContext(document, currentLine) {
//     const textLines = document.getText().split('\n');
//     let className = null;
//     let functionName = null;
//     let insideClass = false;  // 是否在类内部
//     let currentIndentation = 0;  // 用于跟踪 Python 函数的缩进

//     // 获取当前行的缩进级别（用于 Python）
//     function getIndentation(line) {
//         let indentation = 0;
//         while (line[indentation] === ' ') {
//             indentation++;
//         }
//         return indentation;
//     }

//     for (let i = currentLine; i >= 0; i--) {
//         const line = textLines[i].trim();

//         // 匹配类名（适配 Ruby, Java, Python, JavaScript, TypeScript, Go, Rust）
//         if (/class\s+(\w+)/.test(line)) {
//             className = line.match(/class\s+(\w+)/)[1];  // 匹配如 `class ClassName`
//             insideClass = true;  // 进入类的作用域
//             continue; // 在类定义处继续向下处理
//         }

//         // 在类的作用域内
//         if (insideClass) {
//             // 处理 Python 类中的函数定义，关注缩进级别
//             if (/(def|defn)\s+(\w+)\s*\(/.test(line)) {
//                 functionName = line.match(/(def|defn)\s+(\w+)\s*\(/)[2]; // 获取函数名
//                 // 如果是 __init__，跳过
//                 if (functionName === '__init__') {
//                     continue;
//                 }
//             }
//         }

//         // 检查是否结束函数作用域（Python 中会通过缩进减少来表示函数结束）
//         if (insideClass && getIndentation(line) < currentIndentation) {
//             currentIndentation = 0;
//         }

//         // 如果找到类名和函数名，且不在 __init__ 内，则退出
//         if (className && functionName && functionName !== '__init__') {
//             break; // 找到函数名时退出
//         }
//     }

//     return { className, functionName };
// }


function generateLogStatement(languageId, content,currentLine) {
    const lineNumber = getCurrentLineNumber(null, currentLine);  // 获取当前行号
    const prefix = `${lineNumber} line -> `;
    const isString = /^["'`].*["'`]$/; // 检测字符串
    const isNumber = /^\d+$/; // 检测纯数字
    const isArray = /\[.*\]/; // 检测数组
    const isObject = /\{.*\}/; // 检测对象
    const isFunction = /\w+\s*\(.*\)/; // 检测函数调用
    const isBoolean = /^(true|false)$/i; // 检测布尔值

    let logStatement;

    switch (languageId) {
        case 'javascript':
        case 'typescript':
            if (isString.test(content)) {
                logStatement = `console.log('${prefix}String value: ${content}');`;
            } else if (isNumber.test(content)) {
                logStatement = `console.log('${prefix}Number value: ', ${content});`;
            } else if (isArray.test(content)) {
                logStatement = `console.log('${prefix}Array value: ', ${content});`;
            } else if (isObject.test(content)) {
                logStatement = `console.log('${prefix}Object value: ', ${content});`;
            } else if (isFunction.test(content)) {
                logStatement = `console.log('${prefix}Function ${content} executed');`;
            } else {
                logStatement = `console.log('${prefix}${content}:', ${content});`;
            }
            break;

        case 'python':
            if (isString.test(content)) {
                logStatement = `print("${prefix}String value: ${content}")`;
            } else if (isNumber.test(content)) {
                logStatement = `print("${prefix}Number value: ", ${content})`;
            } else if (isArray.test(content)) {
                logStatement = `print("${prefix}Array value: ", ${content})`;
            } else if (isObject.test(content)) {
                logStatement = `print("${prefix}Object value: ", ${content})`;
            } else if (isFunction.test(content)) {
                logStatement = `print("${prefix}Function ${content} executed")`;
            } else {
                logStatement = `print("${prefix}${content}: ", ${content})`;
            }
            break;

        case 'java':
            if (isString.test(content)) {
                logStatement = `System.out.println("${prefix}String value: " + ${content});`;
            } else if (isNumber.test(content)) {
                logStatement = `System.out.println("${prefix}Number value: " + ${content});`;
            } else if (isBoolean.test(content)) {
                logStatement = `System.out.println("${prefix}Boolean value: " + ${content});`;
            } else if (isFunction.test(content)) {
                logStatement = `System.out.println("${prefix}Function ${content} executed");`;
            } else {
                logStatement = `System.out.println("${prefix}${content}: " + ${content});`;
            }
            break;

        case 'ruby':
            if (isString.test(content)) {
                logStatement = `puts "${prefix}String value: #{${content}}"`;
            } else if (isNumber.test(content)) {
                logStatement = `puts "${prefix}Number value: #{${content}}"`;
            } else if (isBoolean.test(content)) {
                logStatement = `puts "${prefix}Boolean value: #{${content}}"`;
            } else {
                logStatement = `puts "${content}: #{${content}}"`;
            }
            break;

        case 'php':
            if (isString.test(content)) {
                logStatement = `echo "${prefix}String value: " . ${content} . "\\n";`;
            } else if (isNumber.test(content)) {
                logStatement = `echo "${prefix}Number value: " . ${content} . "\\n";`;
            } else if (isBoolean.test(content)) {
                logStatement = `echo "${prefix}Boolean value: " . (${content} ? "true" : "false") . "\\n";`;
            } else {
                logStatement = `echo "${content}: " . ${content} . "\\n";`;
            }
            break;

        case 'go':
            if (isString.test(content)) {
                logStatement = `fmt.Println("${prefix}String value: ", ${content})`;
            } else if (isNumber.test(content)) {
                logStatement = `fmt.Println("${prefix}Number value: ", ${content})`;
            } else if (isBoolean.test(content)) {
                logStatement = `fmt.Println("${prefix}Boolean value: ", ${content})`;
            } else {
                logStatement = `fmt.Println("${content}: ", ${content})`;
            }
            break;

        case 'rust':
            if (isString.test(content)) {
                logStatement = `println!("${prefix}String value: {:?}", ${content});`;
            } else if (isNumber.test(content)) {
                logStatement = `println!("${prefix}Number value: {:?}", ${content});`;
            } else if (isBoolean.test(content)) {
                logStatement = `println!("${prefix}Boolean value: {:?}", ${content});`;
            } else {
                logStatement = `println!("${content}: {:?}", ${content});`;
            }
            break;
        
        case 'cpp':
            if (isString.test(content)) {
                logStatement = `std::cout << "${prefix}String value: " << ${content} << std::endl;`;
            } else if (isNumber.test(content)) {
                logStatement = `std::cout << "${prefix}Number value: " << ${content} << std::endl;`;
            } else if (isBoolean.test(content)) {
                logStatement = `std::cout << "${prefix}Boolean value: " << (${content} ? "true" : "false") << std::endl;`;
            } else {
                logStatement = `std::cout << "${prefix}${content}: " << ${content} << std::endl;`;
            }
            break;
        default:
            logStatement = null; // Unsupported language
            break;
    }

    return logStatement;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

