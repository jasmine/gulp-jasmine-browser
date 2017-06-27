require('../spec_helper');

describe('Headless', function () {
    const through = require('through2');
    const port = 8888;
    const _ = jasmine.anything();
    const commandPattern = /\/gulp-jasmine-browser\/node_modules\/phantomjs-prebuilt\/lib\/phantom\/bin\/phantomjs$/;
    let childProcess, headless;

    beforeEach(function () {
        childProcess = require('child_process');
        const server = require('../../src/lib/server');
        headless = require('../../src/lib/headless').headless;
        const process = jasmine.createSpyObj('process', ['on', 'kill', 'stdout', 'stderr']);
        process.stderr = jasmine.createSpyObj('stderr', ['pipe']);
        process.stderr.pipe.and.callFake(() => through(function () {}));
        spyOn(childProcess, 'spawn').and.returnValue(process);
        spyOn(server, 'listen').and.returnValue(Promise.resolve({port}));
    });

    describe('when ignoreSslErrors is not passed', function () {
        beforeEach.async(async function () {
            const stream = headless({findOpenPort: false});
            stream.write({contents: 'CONTENTS', relative: 'RELATIVE'});
            stream.end();
        });

        it('spawns phantom with runner, port, query args', function () {
            expect(childProcess.spawn)
                .toHaveBeenCalledWith(jasmine.stringMatching(commandPattern),
                    ['phantom_runner.js', port, _], _);
        });
    });

    describe('when ignoreSslErrors is passed', function () {
        beforeEach.async(async function () {
            const stream = headless({
                findOpenPort: false,
                ignoreSslErrors: true
            });
            stream.write({contents: 'CONTENTS', relative: 'RELATIVE'});
            stream.end();
        });

        it('spawns phantom with runner, port, query args', function () {
            expect(childProcess.spawn)
                .toHaveBeenCalledWith(jasmine.stringMatching(commandPattern),
                    ['--ignore-ssl-errors=true', 'phantom_runner.js', port, _], _);
        });
    });
});