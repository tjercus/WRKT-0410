
# WRKT-0410 a trainingplanner, React version

Based on 'React eventemitter'.

## usage/runtime
 1. npm install
 2. npm run watch

## tests
 1. npm install -g babel-tape-runner faucet
 2. babel-tape-runner test/*-spec.js | faucet

## TODOS

### App
- yellow hint of change
- notification feature
- button click 'animation'
- favicon
- deploy on github pages
- button to switch metric/imperial

### Training
- start unit tests for TrainingComponent
- fix bug where sometimes the wrong segments are loaded for a training
- unit tests for makeTrainingTotal should loop over a list/table of testdata instead of separate tests
- mark segment type
- support comments for a training
- save
- save dialog
- import
- export
- confirm on remove
- hide/show segment
- repeat segment in data

### Timeline
- buttons smaller or different type of nav
- feature to add a training to a day
- show day of the week
- show total km for a cycle
- training type icons
- use standard paces (MP, LT, 21KP, 10KP etc.)
- feature to allow adding a date to a start or end of a timeline (rest is calculated)
- import
- export
- subtle coloring grouping indication
- import runkeeper csv
