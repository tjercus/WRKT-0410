
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
- Create a script that lists all eventbus subscriptions and emits per source file
- Move propTypes to static class property above constructor
- Progressive web application support
- Try out immutable JS (in a branch!)
- Try out react-material in a branch
- Use TypeError instead of Error for checking parameters
- yellow hint of change
- Use webworkers, if possible, for paralel computing like augmentsegmentdata and calculate totals, see: https://github.com/substack/webworkify
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
- Tape coverage with nyc/coverify/tape-istanbul

### Training
- Refactor TrainingComponent and TrainingInstanceComponent so they can use common code
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
- Timeline should refresh after a day was edited
- Performance tuning with 'key' as a repeatable value instead of random int or createUuid
- Close edit day dialog should persist changes
- Show a dialog 'save current timeline?' when switching plans
- Fix by on displaying a changed segment in DayEditComponent
- Use a Map (uuid as key) for segments in TrainingInstance
- Use a Map (uuid as key) for days in a plan
- feature: 'move training to another day'
- feature: 'add training as 2nd training 2 a day'
- fix handling of ADD_PLAN_EVT
- load new plan afeter ADD_PLAN_EVT?
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
