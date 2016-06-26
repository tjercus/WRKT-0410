
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
- start the rest-api via gulp
- smokestack or Galen (http://blog.wercker.com/2014/12/23/Testing-in-Node.html)
- Introduce Flow for type checking
- TrainingListComponent should supports categories as accordion or tagcloud
- use const instead of let when possible
- use arrow functions when possible
- notification feature
- yellow hint of change
- button click 'animation'
- button to switch metric/imperial
- Tape coverage with coverify
- events as constants
- Formal flux architecture?

### Training
- Fix 'add training then save' bug, which has empy data 
- Add checkbox to indicate training is a workout or not
- Do not save metadata like 'total', 'isVisible' etc from state to disk
- handle feedback from Ajax/Fetch in TrainingComponent
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
- toggle list/calendar modus
- better display of a day, ex: training type icons and colors
- feature to add a training to a day, iaw: implement 'edit' button
- introduce plan selection component
- show total km for a cycle
- use standard paces (MP, LT, 21KP, 10KP etc.)
- feature to allow adding a date to a start or end of a timeline (rest is calculated)
- import
- export
- import runkeeper csv
