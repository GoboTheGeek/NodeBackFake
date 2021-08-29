# NodeBackFake
NodeBackFake is a node.js script used to simulate back-end calls.

## Usage
You obviously need node.js on your computer. Then run the command
`node nbfake.js --host=<hostname> --port=<port> --fake-dir=<path to fake> --fake-prefix=<prefix> --fake-suffix=<suffix> --web-dir=<path to resources>`

## Parameters
- --host: hostname or IP address to listen requests
- --port: port to listen requests
- --fake-dir: a folder that contains JSON files to fake responses
- --fake-prefix: prefix of JSON filenames
- --fake-suffix: suffix of JSON filenames
- --web-dir: a folder that contains "normal" resources

## JSON fake files naming convention
Fake files are named using this rule:
- the "fake-dir" folder name
- the "fake-prefix"
- the HTTP method name
- URL with parameters 
- the "fake-suffix"

### Example: 
while running `node nbfake.js --host=localhost --port=3000 --fake-dir=/home/projects/fakes --fake-prefix=fake_ --fake-suffix=.json --web-dir=/home/projects/web`, 
a GET on _/crud/test?id=1&active=yes_ will search for JSON fake file named **/home/projects/fakes/fake_get_crud_test_id_1_active_yes.json**

More infos and articles at [Gobo The Geek](https://www.gobothegeek.ch)
