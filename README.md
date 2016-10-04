
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
- Try out immutable JS (in a branch!)
- Use TypeError instead of Error for checking parameters
- yellow hint of change
- Use webworkers, if possible, for paralel computing like augmentsegmentdata and calculate totals
- Use a round iconset (see 'movescount') or perhaps a flat one (see google icons)
- Replace 'for loops' by higher order function calls
- Refactor removeX(uuid, array) functions into one generic in miscUtils
- React components should always use a callback when doing stuff after setState
- functional testing with nightowl or cypress
- Introduce Flow for type checking
- TrainingListComponent should supports categories as accordion or tagcloud
- use const instead of let when possible
- use arrow functions when possible
- button click 'animation'
- button to switch metric/imperial
- start the rest-api via gulp
- Tape coverage with coverify/tape-istanbul
- events as constants
- Formal flux architecture?

### Training
- Multi column traininglist instead of one long list
- Fix bug in updateTraining (?)
- disable persist button when webservice is offline
- validate should be more tolerant for invalid segments caluculated by rounding on seconds
- introduce tags
- unit tests for makeTrainingTotal should loop over a list/table of testdata instead of separate tests
- mark segment type
- move segment up or down
- info as 400 pace (800, 1200, 1600)
- display list of paces relative to mp/10kp/etc.
- support comments for a training
- import
- export
- confirm on remove
- hide/show segment
- repeat segment in data

### Timeline/Plan
- Fix handling of ADD_PLAN_EVT
- Load new plan afeter ADD_PLAN_EVT?
- button for 'compact view'
- button for 'ultra compact view'
- edit feature should open in a modal popup
- add barchart view for a plan (using Draught of Raphael)
- testcoverage for segment total calculation et al.
- training detailView ('showcard' with icons etc.) feature from button, to quickly glance a training
- feature to add a training to a day, iaw: implement 'edit' button
- toggle list/calendar modus
- better display of a day, ex: training type icons and colors
- Support loading multiple plans thus: introduce plan selection component
- use standard paces (MP, LT, 21KP, 10KP etc.)
- feature to allow adding a date to a start or end of a timeline (rest is calculated)
- Support 'move instance to another day' (depends on multiple trainings per day)
- import
- export
- import runkeeper csv
- delete or archive plans
