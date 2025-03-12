import * as vscode from 'vscode';
import axios from 'axios';
import { Feature } from "../../infra/feature/feature";
import * as fs from 'fs';
import * as path from 'path';

interface MermaidDiagram {
    processedDiagram: string;
    analysisResponse: string;
}

interface OpenAIPayload {
    model: string;
    messages: Array<{ role: string; content: string }>;
    n: number;
    max_tokens?: number;
}

interface WebviewMessage {
    command: string;
    data: string;
}

class DiagramsDelegate implements Feature {

    disposable: vscode.Disposable | undefined;

    async getOpenAiApiKey(): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration('mdt.openai');
        let apiKey = config.get<string>('apiKey');

        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Please enter your OpenAI API key',
                ignoreFocusOut: true,
                password: true,
            });

            if (apiKey) {
                await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('API key saved successfully.');
            } else {
                vscode.window.showErrorMessage('API key not provided.');
            }
        }

        return apiKey;
    }

    makeOpenAiRequest(
        model: string,
        apiKey: string,
        code: string,
        userPrompt: string,
        maxTokens: string | undefined
    ): Promise<MermaidDiagram> {
        const progressOptions: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: "MDT",
            cancellable: true,
        };

        return Promise.resolve(vscode.window.withProgress(progressOptions, async (progress, _) => {
            const messages = [
                {
                    role: 'system',
                    content: `You are a specialist Mermaid diagram generator (version 11.3.0). Strictly follow these rules:
                          
                        1. **Syntax**:
                           - Nodes: Standard format A[Label] for processes or B{Decision} for conditionals
                           - Arrows: --> for direct connections, -->|text| for descriptions
                           - Avoid unsupported characters: #, $, %, ", ', and special characters in labels
                           - Use concise English text (3-5 words) in elements
                          
                        2. **Structure**:
                           - Start with 'flowchart TD' on first line
                           - Maintain 2-space indentation for hierarchy
                           - Number sequential nodes (e.g., step1 --> step2 --> step3)
                          
                        3. **Validation**:
                           - Ensure every node has connections
                           - Verify conditionals have at least two paths
                           - Mentally test rendering before responding
                          
                        4. **Format**:
                           - No markdown (avoid \`\`\`mermaid or code blocks)
                           - No comments/explanatory text
                           - Explicit UTF-8 encoding
                          
                        Source of truth: https://mermaid.js.org/syntax/flowchart.html`
                }
            ];

            if (userPrompt) {
                messages.push({
                    role: 'user',
                    content: `This is an additional context about the code I'm providing:\n${userPrompt}`,
                });
            }

            progress.report({ message: 'Analyzing code...' });
            messages.push({
                role: 'user',
                content: `Analyze the following code and describe its logic in plain text. Focus on control flow, state changes, and asynchronous behavior:\n${code}`
            });
            const analysisResponse = await this.callOpenAI(messages, apiKey, model, maxTokens);

            progress.report({ message: 'Selecting diagram type...' });
            messages.push({
                role: 'user',
                content: `Based on the code analysis, what is the most appropriate Mermaid diagram type to represent this logic? Choose from: flowchart, sequenceDiagram, stateDiagram, classDiagram, gantt.`
            });
            const diagramTypeResponse = await this.callOpenAI(messages, apiKey, model, maxTokens);
            const diagramType = diagramTypeResponse.trim().toLowerCase();

            progress.report({ message: 'Generating diagram...' });
            messages.push({
                role: 'user',
                content: `Generate a Mermaid diagram of type ${diagramType} for the following code:\n${code}`
            });
            const diagramResponse = await this.callOpenAI(messages, apiKey, model, maxTokens);

            progress.report({ message: 'Processing diagram...' });
            try {
                const processedDiagram = this.postProcessMermaidCode(diagramResponse);
                return { processedDiagram, analysisResponse };
            } catch (error) {
                console.error('Post-Processing Error:', (error as Error).message);
                vscode.window.showErrorMessage(`Error calling OpenAI API: ${error}`);
                throw error;
            }
        }));
    }

    async callOpenAI(messages: Array<{ role: string; content: string }>, apiKey: string, model: string, maxTokens: string | undefined): Promise<string> {
        const payload: OpenAIPayload = {
            model: model,
            messages: messages,
            n: 1,
        };

        if (maxTokens) {
            payload.max_tokens = Number(maxTokens);
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.choices[0].message.content;
    }

    async getAditionalPrompt(): Promise<string | undefined> {

        const aditionalPrompt = await vscode.window.showInputBox({
            prompt: '(Optional) Give some aditional context about the code you are providing. E.g. "This code is a function that reads a file and returns the content as a string"',
            ignoreFocusOut: true,
        });

        return aditionalPrompt;
    }

    getActiveEditorContent(): string | undefined {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            if (selectedText) {
                const prompt = selectedText.split('\n').map((line) => line.trim()).join('\n');
                return prompt;
            } else {
                vscode.window.showErrorMessage('No text selected. Please select the source code you want to generate a diagram from.');
            }
        } else {
            vscode.window.showErrorMessage('No source code found. Please open a file with source code before running this command, and select the code you want to generate a diagram from.');
        }
    }

    activate(context: vscode.ExtensionContext): void {
        this.disposable = vscode.commands.registerCommand('extension.generateDiagram', async () => {

            const config = vscode.workspace.getConfiguration('mdt.openai');
            const model = config.get<string>('model', 'gpt-4');
            const maxTokens = config.get<string>('maxTokens');
            const apiKey = await this.getOpenAiApiKey();

            if (!apiKey) {
                vscode.window.showErrorMessage('No API key provided.');
                return;
            }

            const code = this.getActiveEditorContent();
            if (!code) {
                return;
            }

            const aditionalPrompt = await this.getAditionalPrompt();

            const result: MermaidDiagram = await this.makeOpenAiRequest(model, apiKey, code, aditionalPrompt ?? '', maxTokens);

            if (result) {

                result.processedDiagram = result.processedDiagram.replace(/\\n/g, '\n');
                result.processedDiagram = result.processedDiagram.replace(/\\t/g, '\t');
                result.processedDiagram = result.processedDiagram.replace(/\\r/g, '\r');
                result.processedDiagram = result.processedDiagram.replace(/\(/g, '');
                result.processedDiagram = result.processedDiagram.replace(/\)/g, '');
                result.processedDiagram = result.processedDiagram.replace(/"/g, '');
                result.processedDiagram = result.processedDiagram.replace(/'/g, '');
                result.processedDiagram = result.processedDiagram.replace(/`/g, '');
                result.processedDiagram = result.processedDiagram.replace(/```/g, '');
                result.processedDiagram = result.processedDiagram.replace("mermaid", '');
                result.processedDiagram = result.processedDiagram.replace("||", '');

                const panel = vscode.window.createWebviewPanel(
                    'diagramView',
                    'Diagram',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                    }
                );

                const htmlFilePath = path.join(context.extensionPath, 'src/features/diagrams', 'index.html');
                fs.readFile(htmlFilePath, 'utf8', (err: NodeJS.ErrnoException | null, htmlContent: string) => {
                    if (err) {
                        console.error('Error reading HTML file:', err);
                        return;
                    }

                    const updatedHtmlContent = htmlContent
                        .replace(/\${diagram}/g, this.escapeHtml(result.processedDiagram))
                        .replace(/\${analysis}/g, this.escapeHtml(result.analysisResponse));

                    panel.webview.html = updatedHtmlContent;

                    vscode.window.showInformationMessage('Copy the diagram code to the clipboard?', 'Yes', 'No').then((selection) => {
                        if (selection === 'Yes') {
                            vscode.env.clipboard.writeText(result.processedDiagram).then(() => {
                                vscode.window.showInformationMessage('Diagram copied to clipboard!');
                            }, (error) => {
                                vscode.window.showErrorMessage('Failed to copy diagram to clipboard.');
                                console.error('Clipboard error:', error);
                            });
                        }
                    });
                });
            } else {
                vscode.window.showErrorMessage('Failed to generate diagram.');
            }
        });

        context.subscriptions.push(this.disposable);
    }

    postProcessMermaidCode(mermaidCode: string): string {
        // Remove markdown blocks if present
        mermaidCode = mermaidCode.replace(/```mermaid/g, '').replace(/```/g, '').trim();

        // Validate diagram type
        const validDiagramTypes = ['flowchart', 'sequenceDiagram', 'stateDiagram', 'classDiagram', 'gantt'];
        const firstLine = mermaidCode.split('\n')[0].trim();
        const isValidDiagram = validDiagramTypes.some(type => firstLine.startsWith(type));

        if (!isValidDiagram) {
            throw new Error('Invalid diagram type. Must start with one of: flowchart, sequenceDiagram, stateDiagram, classDiagram, gantt.');
        }

        // Check for unconnected nodes or invalid syntax
        const lines = mermaidCode.split('\n');
        const nodes = new Set();
        const connections = new Set();

        lines.forEach(line => {
            if (line.includes('-->')) {
                // Extract nodes from connections (e.g., step1 --> step2)
                const [from, to] = line.split('-->').map(s => s.trim().replace(/\|.*$/, '').trim());
                connections.add(from);
                connections.add(to);
            } else if (line.includes('[') || line.includes('{') || line.includes('(')) {
                // Extract node labels (e.g., step1[Label], step2{Decision}, step3(Label))
                const node = line.trim().split(/[\[\]{}()]/)[1];
                if (node) nodes.add(node);
            }
        });

        // Ensure all nodes are connected
        const unconnectedNodes = [...nodes].filter(node => !connections.has(node));
        if (unconnectedNodes.length > 0) {
            console.warn(`Unconnected nodes detected: ${unconnectedNodes.join(', ')}`);
        }

        return mermaidCode;
    }

    escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/`/g, "&#96;");
    }

    deactivate(): void {
        if (this.disposable) {
            this.disposable.dispose();
        }
    }
}

export { DiagramsDelegate };