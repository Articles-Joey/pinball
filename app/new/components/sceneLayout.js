export const SCENE_OBJECTS = [
    {
        "id": "statue-of-liberty",
        "type": "liberty",
        "label": "Statue of Liberty",
        "position": [
            -0.91,
            0,
            -1.65
        ],
        "rotation": [
            0,
            0.5236,
            0
        ],
        "logic": {
            "trigger": "toggle",
            "targets": [
                "gutter-flap-left",
                "gutter-flap-right"
            ]
        }
    },
    {
        "id": "bumper-red",
        "type": "bumper",
        "label": "Red pop bumper",
        "position": [
            -0.47,
            0,
            -1.39
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#cf2d42"
    },
    {
        "id": "bumper-blue",
        "type": "bumper",
        "label": "Blue pop bumper",
        "position": [
            0.35,
            0,
            -1.43
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#2469b8"
    },
    {
        "id": "bumper-white",
        "type": "bumper",
        "label": "White pop bumper",
        "position": [
            -0.05,
            0,
            -0.65
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#fff1d2"
    },
    {
        "id": "post-red-upper-left",
        "type": "post",
        "label": "Red post upper left",
        "position": [
            -0.88,
            0,
            -0.88
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#cf2d42"
    },
    {
        "id": "post-blue-upper-right",
        "type": "post",
        "label": "Blue post upper right",
        "position": [
            0.78,
            0,
            -0.92
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#2469b8"
    },
    {
        "id": "post-white-mid-left",
        "type": "post",
        "label": "White post middle left",
        "position": [
            -0.64,
            0,
            -0.18
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#fff1d2"
    },
    {
        "id": "post-red-mid-right",
        "type": "post",
        "label": "Red post middle right",
        "position": [
            0.48,
            0,
            -0.12
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#cf2d42"
    },
    {
        "id": "post-blue-lower-left",
        "type": "post",
        "label": "Blue post lower left",
        "position": [
            -0.72,
            0,
            0.34
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#2469b8"
    },
    {
        "id": "post-white-lower-right",
        "type": "post",
        "label": "White post lower right",
        "position": [
            0.62,
            0,
            0.42
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#fff1d2"
    },
    {
        "id": "post-red-bottom-left",
        "type": "post",
        "label": "Red post bottom left",
        "position": [
            -0.34,
            0,
            0.82
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#cf2d42"
    },
    {
        "id": "post-blue-bottom-right",
        "type": "post",
        "label": "Blue post bottom right",
        "position": [
            0.24,
            0,
            1.03
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#2469b8"
    },
    {
        "id": "slingshot-left",
        "type": "slingshot",
        "label": "Left slingshot",
        "position": [
            -0.7,
            0,
            1
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "side": "left"
    },
    {
        "id": "slingshot-right",
        "type": "slingshot",
        "label": "Right slingshot",
        "position": [
            0.35,
            0,
            1
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "side": "right"
    },
    {
        "id": "gutter-flap-left",
        "type": "gutterFlap",
        "label": "Left gutter flap",
        "position": [
            -1.353,
            0,
            -0.032
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "side": "left"
    },
    {
        "id": "gutter-flap-right",
        "type": "gutterFlap",
        "label": "Right gutter flap",
        "position": [
            1.087,
            0,
            0.238
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "side": "right"
    },
    {
        "id": "flipper-left",
        "type": "flipper",
        "label": "Left flipper",
        "position": [
            -0.6517,
            0.1,
            1.9499
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "side": "left"
    },
    {
        "id": "flipper-right",
        "type": "flipper",
        "label": "Right flipper",
        "position": [
            0.467,
            0.1,
            1.95
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "side": "right"
    },
    {
        "id": "corner-triangle-left",
        "type": "cornerTriangle",
        "label": "Left lower corner triangle",
        "position": [
            -1.02,
            0.025,
            2.1
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#cf2d42",
        "side": "left"
    },
    {
        "id": "corner-triangle-right",
        "type": "cornerTriangle",
        "label": "Right lower corner triangle",
        "position": [
            0.7565,
            0.025,
            2.1599
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "color": "#2469b8",
        "side": "right"
    },
    {
        "id": "wall-shooter-divider",
        "type": "wall",
        "label": "Shooter lane divider",
        "position": [
            1.0899,
            0,
            0.4239
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 4.59,
        "width": 0.055,
        "height": 0.29,
        "color": "#c4d3df"
    },
    {
        "id": "top-playfield-arch",
        "type": "topArch",
        "label": "Smooth top playfield arch",
        "position": [
            0,
            0,
            -2.05
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 2.54,
        "width": 0.65,
        "color": "#2469b8"
    },
    {
        "id": "wall-upper-left-side",
        "type": "wall",
        "label": "Upper left side rail",
        "position": [
            0.1705,
            0,
            -0.6234
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 2.2,
        "width": 0.055,
        "height": 0.24,
        "color": "#c4d3df"
    },
    {
        "id": "wall-rollover-left",
        "type": "wall",
        "label": "Top rollover left",
        "position": [
            -0.72,
            0,
            -2.215
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 0.31,
        "width": 0.035,
        "height": 0.16,
        "color": "#c4d3df"
    },
    {
        "id": "wall-rollover-center",
        "type": "wall",
        "label": "Top rollover center",
        "position": [
            -0.18,
            0,
            -2.215
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 0.31,
        "width": 0.035,
        "height": 0.16,
        "color": "#c4d3df"
    },
    {
        "id": "wall-rollover-right",
        "type": "wall",
        "label": "Top rollover right",
        "position": [
            0.36,
            0,
            -2.215
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 0.31,
        "width": 0.035,
        "height": 0.16,
        "color": "#c4d3df"
    },
    {
        "id": "wall-inlane-left-long",
        "type": "wall",
        "label": "Left inlane long guide",
        "position": [
            -1.08,
            0,
            0.8309
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 1.3219,
        "width": 0.045,
        "height": 0.24,
        "color": "#c4d3df"
    },
    {
        "id": "wall-inlane-left-tip",
        "type": "wall",
        "label": "Left inlane tip guide",
        "position": [
            -0.8804,
            0,
            1.7395
        ],
        "rotation": [
            0,
            0.733,
            0
        ],
        "length": 0.6237,
        "width": 0.045,
        "height": 0.24,
        "color": "#c4d3df"
    },
    {
        "id": "wall-inlane-right-long",
        "type": "wall",
        "label": "Right inlane long guide",
        "position": [
            0.779,
            0,
            0.838
        ],
        "rotation": [
            0,
            0,
            0
        ],
        "length": 1.3476,
        "width": 0.045,
        "height": 0.24,
        "color": "#c4d3df"
    },
    {
        "id": "wall-inlane-right-tip",
        "type": "wall",
        "label": "Right inlane tip guide",
        "position": [
            0.6244,
            0,
            1.6852
        ],
        "rotation": [
            0,
            -0.733,
            0
        ],
        "length": 0.4905,
        "width": 0.045,
        "height": 0.24,
        "color": "#c4d3df"
    }
]
