export const PLAYFIELD_WIDTH_INCHES = 20;
export const PLAYFIELD_LENGTH_INCHES = 42;

// The existing scene is authored at cabinet scale. This conversion keeps the
// human reference and cabinet proportions intact while exposing real dimensions.
export const INCHES_PER_SCENE_UNIT = 7.5;
export const PLAYFIELD_WIDTH =
    PLAYFIELD_WIDTH_INCHES / INCHES_PER_SCENE_UNIT;
export const PLAYFIELD_LENGTH =
    PLAYFIELD_LENGTH_INCHES / INCHES_PER_SCENE_UNIT;
export const PLAYFIELD_HALF_WIDTH = PLAYFIELD_WIDTH / 2;
export const PLAYFIELD_HALF_LENGTH = PLAYFIELD_LENGTH / 2;

export function sceneUnitsToInches(value) {
    return value * INCHES_PER_SCENE_UNIT;
}

export function inchesToSceneUnits(value) {
    return value / INCHES_PER_SCENE_UNIT;
}
