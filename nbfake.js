// NodeBackFake is a script that enable fake JSON responses for specific urls.
// Options:
// --host= name or IP address to listen requests (default: localhost)
// --port= port to listen requests (default: 3000)
// --fake-dir= folder where fake JSON responses are stored (defaukt: '.')
// --fake-prefix: prefix for fake responses filenames
// --fake-suffix: suffix for fake responses filenames
// --web-dir= folder where web resources are stored (default: '.')

const http = require('http');
const fs = require('fs');

let configuration = {
    'host': 'localhost',
    'port': 3000,
    'fake-dir': '.',
    'fake-prefix': '_fake_',
    'fake-suffix': '.json',
    'web-dir': '.'
};

// This object contains methods to handle fake responses
let faker = {
    // load parameters from coommand line
    readParameters: function() {
        console.log('-- NodeBackFake: reading command line parameters');
        for (let posP = 0; posP < process.argv.length; posP++) {
            // find parameter name from argument
            if ((process.argv[posP].startsWith('--')) && (0 < process.argv[posP].indexOf('='))) {
                configuration[process.argv[posP].substring(2, process.argv[posP].indexOf('='))] = process.argv[posP].substring(process.argv[posP].indexOf('=') + 1);
            }
        };
        console.log('-- NodeBackFake: configuration is');
        console.log(JSON.stringify(configuration));
    },

    // transform an url to a fake filename
    // example: calling GET /crud/test?id=1 becomes /home/test/fakes/fake_get_crud_test_id_1.json
    buildFakeFilename: function(url, method) {
        let fakeUrl;

        if (null !== url) {
            // fake filename starts with directory
            fakeUrl = configuration['fake-dir'] + (!configuration['fake-dir'].endsWith('/')? '/' : '');
            // add prefix to fake filename
            fakeUrl += configuration['fake-prefix'];
            // then fake filename contains HTTP method
            fakeUrl += method.toLowerCase();
            // then we replace slashes, colons and ampersands
            fakeUrl += url.replace(/:/g, '_').replace(/\//g, '_').replace(/\&/g, '_').replace(/\?/g, '_').replace(/=/g, '_');
            // finally add suffix
            fakeUrl += configuration['fake-suffix'];
            return fakeUrl;
        }
        return null;
    },

    // return mime type based on file extension
    // Obviously, i took a shortcut here to avoid loading dependancies.
    getMimeType: function(name) {
        let ext;

        ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        switch (ext) {
            case 'html': return 'text/html';
            case 'js': return 'text/javascript';
            case 'css': return 'text/css';
            case 'json': return 'text/json';
            case 'png': return 'image/png';
            case 'jpg': return 'image/jpeg';
            case 'gif': return 'image/gif';
            default: return 'text/plain';
        }
    },

    getResponse: function(request) {
        return new Promise((resolve, reject) => {
            let fakeFilename;
            let resFilename;
            let fileContent;
            let fileRead;
            let fakeContent;

            // compute names for fake and resources files
            fakeFilename = faker.buildFakeFilename(request.url, request.method);
            resFilename = configuration['web-dir'] + (configuration['web-dir'].endsWith('/')? request.url.substring(1) : request.url);
            // check if fake file exists
            fs.access(fakeFilename, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                if (!err) {
                    fs.readFile(fakeFilename, (err, data) => {
                        if (!err) {
                            fakeContent = JSON.parse(data);
                            resolve( { status: fakeContent.status, contentType: fakeContent.contentType, content: JSON.stringify(fakeContent.content) } );
                        } else {
                            console.error('-- NodeBackFake: error during reading of [' + fakeFilename + ']');
                            reject( { status: 404, contentType: 'text/plain', content: 'error during reading of [' + fakeFilename + ']' } );
                        }
                    } );
                } else {
                    fs.access(resFilename, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                        if (!err) {
                            fs.readFile(resFilename, (err, data) => {
                                if (!err) {
                                    resolve( {
                                        status: 200,
                                        contentType: faker.getMimeType(resFilename),
                                        content: data
                                    } );
                                } else {
                                    console.error('-- NodeBackFake: error during reading of [' + resFilename + ']');
                                    reject( { status: 404, contentType: 'text/plain', content: 'Error during reading of [' + resFilename + ']' } );
                                }
                            } );
                        } else {
                            console.error('-- NodeBackFake: fake file not found [' + fakeFilename + ']');
                            console.error('-- NodeBackFake: resource not found [' + resFilename + ']');
                            reject( { status: 404, contentType: 'text/plain', content: 'resource not found' } );
                        }
                    } );
                }
            } );
        } );
    },

    respond: function(response, data) {
        response.statusCode = data.status;
        if (null !== data.contentType) { response.setHeader('Content-Type', data.contentType); }
        response.end(data.content);
        return response;
    }
};

// read configuration from command line
faker.readParameters();

// Run server
const server = http.createServer((req, res) => {
    let response;

    faker.getResponse(req).
        then(data => response = data).
        catch(err => response = err).
        finally(() => res = faker.respond(res, response));
} );

server.listen(configuration.port, configuration.host, () => {
    console.log('--');
    console.log(`-- NodeBackFake is running at http://${configuration.host}:${configuration.port}/`);
} );


/*
Copyright 2021 / Gobo The Geek

This file is part of "NodeBackFake".

    "NodeBackFake" is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    "NodeBackFake" is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with "NodeBackFake". If not, see <https://www.gnu.org/licenses/>.
*/
