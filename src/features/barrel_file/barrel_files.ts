import { commands, ExtensionContext, Uri } from 'vscode';
import { Feature } from '../../infra/feature/feature';
import { GenerationType } from './helpers/types';
import { Context } from './helpers';
import { init } from './helpers/extension';

export default class BarrelFilesDelegate implements Feature {

  deactivate() {
    Context.deactivate();
  };

  activate(context: ExtensionContext): void {
    // Generate current
    context.subscriptions.push(
      commands.registerCommand(
        'extension.generateCurrent',
        async (uri: Uri) => {
          this.generate('REGULAR', uri);
        }
      )
    );

    // Generate current with subfolders
    context.subscriptions.push(
      commands.registerCommand(
        'extension.generateCurrentWithSubfolders',
        async (uri: Uri) => {
          this.generate('REGULAR_SUBFOLDERS', uri);
        }
      )
    );

    // Generate current and nested
    context.subscriptions.push(
      commands.registerCommand(
        'extension.generateCurrentAndNested',
        async (uri: Uri) => {
          this.generate('RECURSIVE', uri);
        }

      )
    );
  }

  /**
   * Curried function that, from the given type of the generation,
   * it will set up the context with the `uri` received from the curried fn
   * and the given type
   */
  async generate(type: GenerationType, uri: Uri) {
    Context.initGeneration({ path: uri, type: type });
    await init();
  };

}
