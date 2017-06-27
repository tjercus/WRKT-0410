
/**
 * @interface Training
 * @property {string} uuid
 * @property {string} type
 * @segments {Array<Segment>} segments
 * @property {Total} total
 */

/**
 * @interface TrainingInstance
 */

/**
 * @interface Plan
 * @property {string} uuid
 * @property {string} name
 * @property {Array<Day>} days
 * @property {string} startDate
 */

/**
 * @interface Day
 * @property {string} uuid
 * @property {Array<Training>} trainings
 */

/**
 * @interface Segment
 * @property {string} uuid
 * @property {string} trainingUuid - the parent object
 * @property {number} distance - ex: 18.5
 * @property {string} duration - ex "01:12:59" (HH:mm:ss)
 * @property {string} pace - ex: "04:23" (mm:ss)
 */

/**
 * @interface Total
 * @property {number} distance
 * @property {string} duration
 * @property {string} pace
 */

/**
 * @interface Segment
 * @property {string} uuid
 * @property {string} trainingUuid - the parent object
 * @property {number} distance
 * @property {string} duration
 * @property {string} pace
 */

/**
 * @interface Total
 * @property {number} distance
 * @property {string} duration
 * @property {string} pace
 */
