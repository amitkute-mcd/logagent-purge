# logagent-purge

Plugin for [Logagent](https://sematext.com/logagent) to purge old files 

1) Install [logagent 2.x](https://www.npmjs.com/package/@sematext/logagent) 
```
npm i -g @sematext/logagent
```
2) Install this plugin
```
npm i -g https://github.com/amitkute-mcd/logagent-purge
```
3) Configure Log Agent
```
# config.yml
input:
  purge:
    module:  logagent-purge
    # Path of logs, can be relative or absolute
    path: './logs'

    # Minimum age for file to be purged
    # Can use d (day), w (week), h (hour - default)
    fileAge: 1w

    runAtStart: true

    # Describes how many hours it will run
    runEvery: 1

    # Set true for view debug logs
    debug: true

    # For extensions choose:
    # accept any extensions
    extensions: '*'
    # or multiple specific extensions
    extensions:
      - .zip
      - .log
      - .txt
```
4) Start Log Agent
```
logagent --config config.yml
```