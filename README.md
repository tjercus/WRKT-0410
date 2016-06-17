
# WRKT-0410 a trainingplanner, React version

Based on 'React eventemitter'.

## usage/runtime
 1. npm install
 2. npm run watch

## tests
 1. npm install -g babel-tape-runner faucet tape-watch
 2. babel-tape-runner test/*-spec.js | faucet
 3. tape-watch -r babel-register test/*-spec.js | faucet

## TODOS

### App
- casper js or smokestack or Galen (http://blog.wercker.com/2014/12/23/Testing-in-Node.html)
- Better tests for stores, test eventemitter with spies (and/or do actual work in util that returns a promise)
- TrainingListComponent should supports categories as accordion or tagcloud
- use const instead of let when possible
- use arrow functions when possible
- notification feature
- yellow hint of change
- button click 'animation'
- button to switch metric/imperial
- Tape coverage with coverify
- events as constants
- Flux architecture?

### Training
- bug where re-calculate total results in an outdated total
- introduce tags
- introduce concept of training versus instance
- unit tests for makeTrainingTotal should loop over a list/table of testdata instead of separate tests
- mark segment type
- move segment up or down
- info as 400 pace (800, 1200, 1600)
- display list of paces relative to mp/10kp/etc.
- support comments for a training
- save
- save dialog
- import
- export
- confirm on remove
- hide/show segment
- repeat segment in data

### Timeline
- better display of a day, ex: training type icons and colors
- toggle list/calendar modus
- feature to add a training to a day, iaw: implement 'edit' button
- introduce plan selection component
- show total km for a cycle
- use standard paces (MP, LT, 21KP, 10KP etc.)
- feature to allow adding a date to a start or end of a timeline (rest is calculated)
- import
- export
- import runkeeper csv
