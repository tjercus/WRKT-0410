
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
- tests for stores
- use const instead of let when possible
- use arrow functions when possible
- notification feature
- yellow hint of change
- button click 'animation'
- deploy on github pages
- button to switch metric/imperial
- events as constants

### Training
- fix bug where remove segment removes wrong segment
- fix bug where sometimes the wrong segments are loaded for a training
- related: fix bug with first segment being set as null
- unit tests for makeTrainingTotal should loop over a list/table of testdata instead of separate tests
- mark segment type
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
- plan.workout should be plan.workoutId
- feature to add a training to a day, iaw: implement 'edit' button
- show total km for a cycle
- training type icons
- use standard paces (MP, LT, 21KP, 10KP etc.)
- buttons smaller or different type of nav
- feature to allow adding a date to a start or end of a timeline (rest is calculated)
- import
- export
- subtle coloring grouping indication
- import runkeeper csv
