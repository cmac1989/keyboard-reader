import json
from pynput import keyboard

KEY_MAP = {
    keyboard.Key.up:    'UP',
    keyboard.Key.down:  'DOWN',
    keyboard.Key.left:  'LEFT',
    keyboard.Key.right: 'RIGHT',
    keyboard.Key.shift:   'SHIFT',
    keyboard.Key.shift_r: 'SHIFT',
    keyboard.Key.ctrl:    'CTRL',
    keyboard.Key.ctrl_r:  'CTRL',
    keyboard.Key.space:   'SPACE',
    **{keyboard.KeyCode.from_char(c): c.upper() for c in 'wasdxcerftqzxb'},
}

def emit(event_type, key):
    print(json.dumps({'type': event_type, 'key': key}), flush=True)

def on_press(key):
    mapped = KEY_MAP.get(key)
    if mapped:
        emit('keyDown', mapped)

def on_release(key):
    mapped = KEY_MAP.get(key)
    if mapped:
        emit('keyUp', mapped)

listener = keyboard.Listener(on_press=on_press, on_release=on_release)
listener.start()
listener.join()
