const ICONS = {
    up:    `<svg viewBox="0 0 32 32"><polyline points="7,21 16,9 25,21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><line x1="16" y1="9" x2="16" y2="25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    down:  `<svg viewBox="0 0 32 32"><polyline points="7,11 16,23 25,11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><line x1="16" y1="7" x2="16" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    left:  `<svg viewBox="0 0 32 32"><polyline points="21,7 9,16 21,25" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><line x1="9" y1="16" x2="25" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    right: `<svg viewBox="0 0 32 32"><polyline points="11,7 23,16 11,25" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><line x1="7" y1="16" x2="23" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    jump:  `<svg viewBox="0 0 32 32"><path d="M5,26 C6,14 12,7 20,7 C26,7 28,12 27,17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="27" cy="17" r="2.2" fill="currentColor"/><line x1="5" y1="22" x2="5" y2="28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    nail:  `<svg viewBox="0 0 32 32"><line x1="5" y1="27" x2="27" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="20" y1="10" x2="25" y2="15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="27" cy="5" r="2" fill="currentColor"/></svg>`,
    dash:  `<svg viewBox="0 0 32 32"><line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.45"/><line x1="3" y1="16" x2="27" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="3" y1="21" x2="19" y2="21" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.45"/><polyline points="21,11 27,16 21,21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    focus: `<svg viewBox="0 0 32 32"><polygon points="16,4 27,16 16,28 5,16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><line x1="16" y1="10" x2="16" y2="22" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/><line x1="10" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/></svg>`,
    cast:  `<svg viewBox="0 0 32 32"><path d="M25,13 C27,21 19,29 11,25 C4,21 5,12 12,9 C18,6 24,11 21,17 C19,22 13,22 11,18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    dream: `<svg viewBox="0 0 32 32"><line x1="4" y1="28" x2="26" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="19" y1="11" x2="24" y2="16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="26" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M23,3 C26,1 30,4 27,8" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/><path d="M27,8 C30,7 32,11 29,12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.35"/></svg>`,
};

const LAYOUTS = [
    {
        name: 'Hollow Knight',
        size: { width: 440, height: 240 },
        groups: [
            [
                [{ id: 'UP',    icon: ICONS.up }],
                [{ id: 'LEFT',  icon: ICONS.left }, { id: 'DOWN', icon: ICONS.down }, { id: 'RIGHT', icon: ICONS.right }],
            ],
            [
                [{ id: 'Z', img: 'assets/jump.png',  icon: ICONS.jump,  label: 'JUMP'  }, { id: 'X', img: 'assets/nail.png', icon: ICONS.nail, label: 'NAIL' }, { id: 'C', img: 'assets/dash.png', icon: ICONS.dash, label: 'DASH'  }],
                [{ id: 'A', img: 'assets/focus.png', icon: ICONS.focus, label: 'FOCUS' }, { id: 'S', img: 'assets/cast.png', icon: ICONS.cast, label: 'CAST' }, { id: 'SHIFT', img: 'assets/dream.png', icon: ICONS.dream, label: 'DREAM' }],
            ],
        ],
    },
    {
        name: 'WASD',
        size: { width: 420, height: 240 },
        groups: [
            [
                [{ id: 'W', text: 'W' }],
                [{ id: 'A', text: 'A' }, { id: 'S', text: 'S' }, { id: 'D', text: 'D' }],
            ],
            [
                [{ id: 'SHIFT', text: 'SHIFT', wide: true }, { id: 'CTRL', text: 'CTRL', wide: true }, { id: 'SPACE', text: 'SPACE', wide: true }],
                [{ id: 'E', text: 'E' }, { id: 'R', text: 'R' }, { id: 'F', text: 'F' }],
            ],
        ],
    },
    {
        name: 'Arrows',
        size: { width: 220, height: 200 },
        groups: [
            [
                [{ id: 'UP',   icon: ICONS.up }],
                [{ id: 'LEFT', icon: ICONS.left }, { id: 'DOWN', icon: ICONS.down }, { id: 'RIGHT', icon: ICONS.right }],
            ],
        ],
    },
];
