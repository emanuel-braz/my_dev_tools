import { APP_EXEC_NOT_FOUND } from '../consts/strings';
import { Dialogs } from '../dialogs/dialogs';

export class Platform {
    static checkIfExecutableIsAvailable(exec: string): Boolean {
        const isAvailable = require('hasbin').sync(exec);
        if (isAvailable != true) {
            Dialogs.snackbar.error(APP_EXEC_NOT_FOUND.replace("{exec}", exec));
        }
        return isAvailable;
    }
}