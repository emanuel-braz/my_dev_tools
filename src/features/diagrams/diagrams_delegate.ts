import * as vscode from 'vscode';
import { Feature } from '../../infra/feature/feature';
const fs = require('fs');
const path = require('path');

class DiagramsDelegate implements Feature {

    activate(context: vscode.ExtensionContext): void {
        let disposable = vscode.commands.registerCommand('extension.showDiagram', () => {
            const panel = vscode.window.createWebviewPanel(
                'diagramView',
                'Diagram',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                }
            );

            const htmlFilePath = path.join(context.extensionPath, 'src/features/diagrams', 'index.html');

            // Read the HTML file
            fs.readFile(htmlFilePath, 'utf8', (err, htmlContent) => {
                if (err) {
                    console.error('Error reading HTML file:', err);
                    return;
                }

                // Replace the `diagram` placeholder with real mermaid content

                const updatedHtmlContent = htmlContent.replace('\${diagram}', diagram);

                // Set the Webview's HTML content
                panel.webview.html = updatedHtmlContent;
            });
            //--
            // return;




            // panel.webview.html = this.getWebviewContent(diagram);
        });

        context.subscriptions.push(disposable);
    }

    deactivate(): void {
        //
    }

    // getWebviewContent(diagram: string): string {
    //     return /*html*/`
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //       <meta charset="UTF-8">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //       <title>Mermaid Diagram with Mouse Wheel Zoom</title>
    //       <style>
    //         .mermaid {
    //           transition: transform 0.2s ease;
    //           transform-origin: top left;
    //           width: 100%; /* Ensure the diagram takes full width */
    //         }
    //       </style>
    //       <script type="module">
    //         import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    //         mermaid.initialize({ startOnLoad: true });

    //         let scale = 1;

    //         document.addEventListener("DOMContentLoaded", function() {
    //           const mermaidElement = document.querySelector('.mermaid');

    //           if (mermaidElement) {
    //             // Add event listener for mouse wheel
    //             mermaidElement.addEventListener('wheel', function(event) {
    //               event.preventDefault(); // Prevent page scroll
    //               if (event.deltaY < 0) {
    //                 zoomIn();  // Scrolling up, zoom in
    //               } else {
    //                 zoomOut(); // Scrolling down, zoom out
    //               }
    //             });
    //           }
    //         });

    //         function zoomIn() {
    //           scale += 0.1;
    //           updateScale();
    //         }

    //         function zoomOut() {
    //           if (scale > 0.2) {
    //             scale -= 0.1;
    //             updateScale();
    //           }
    //         }

    //         function updateScale() {
    //           const mermaidElement = document.querySelector('.mermaid');
    //           if (mermaidElement) {
    //             mermaidElement.style.transform = 'scale(' + scale + ')';
    //             mermaidElement.style.width = (100 / scale) + '%';
    //           }
    //         }
    //       </script>
    //     </head>
    //     <body>
    //       <div class="mermaid">
    //         ${diagram}
    //       </div>
    //     </body>
    //     </html>`;
    // }

}

export { DiagramsDelegate };


const diagram = `
            graph TD
  A[App Start] --> B[SplashScreen State Initialization]
  B --> C{isInitStateStarted?}
  C -->|True| D[Delay 1000ms -> Start AuthBloc]
  C -->|False| E[Proceed without AuthBloc]
  B --> F[Initialize AnimationController]
  F --> G[Initialize ForegroundTaskService]
  G --> H[Add Post Frame Callback -> Init ForegroundTaskService]
  B --> I[SyncUserTags Call]
  I --> J[Analytics -> Log Opened App Event]
  
  D --> K[AuthBloc Event Listener]
  K --> L{AuthState}
  L -->|Authenticated| M[Navigate to MainTabPage]
  L -->|Onboarding| N[Start Onboarding Process]
  N --> O[Chatbot DynamicLink Handling]
  N --> P[Foreground Task Start]
  N --> Q[Redirect based on OnboardingState]
  L -->|Unauthenticated| R[Push to Login Page]
  L -->|UserDisabled| S[Push to User Disabled Page]
  L -->|AcceptingTerms| T[Show UserTermsBottomSheet]
  T --> U[Sync Customer]
  L -->|UnauthorizedUnderage| V[Push to Unauthorized Underage Page]

  W[Build UI] --> X{Partner State}
  X -->|Not Default| Y[Show Partner Logo]
  X -->|Default| Z[Show Animated Logo]
  Z --> AA[AnimationController -> Play Animation]
  AA --> BB{Animation Completed?}
  BB -->|Yes| CC[Show Splash Subtitle]
  BB -->|No| DD[Wait for Animation Completion]
          `;