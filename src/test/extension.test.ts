import * as assert from 'assert';
import * as myExtension from '../core/runners/runner';

suite("Extension Tests", function () {

    test("Should encode command with & character correctly", function() {
        const command = "myScheme://domain?paramA=1&paramB=2&paramC=3";
        const resultExpected = "myScheme://domain?paramA=1\\&paramB=2\\&paramC=3";
        const runner = new myExtension.Runner();
        const commandEncoded = runner.encodeAmpersandChars(command);
        assert.strictEqual(commandEncoded, resultExpected);
    });
});