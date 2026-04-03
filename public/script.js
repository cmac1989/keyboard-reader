let current = parseInt(localStorage.getItem('layout') || '0');
let positionLocked = false;

// ── Settings sync ─────────────────────────────────────────
window.electronAPI.onSettingsUpdate(settings => {
    positionLocked = settings.positionLock;
    document.body.style.webkitAppRegion = positionLocked ? 'no-drag' : 'drag';
    document.getElementById('overlay').classList.toggle('locked', positionLocked);
    document.getElementById('overlay').classList.toggle('click-through', settings.clickThrough);
});

// ── Context menu ──────────────────────────────────────────
window.addEventListener('contextmenu', e => {
    e.preventDefault();
    window.electronAPI.showContextMenu();
});

// ── Layout rendering ──────────────────────────────────────
function createSvgFallback(svgString) {
    const wrap = document.createElement('div');
    wrap.className = 'svg-wrap';
    wrap.innerHTML = svgString;
    return wrap;
}

function buildKey(key) {
    const el = document.createElement('div');
    el.id = key.id;
    el.className = 'key' + (key.img || key.icon ? ' icon-key' : ' text-key') + (key.wide ? ' wide' : '');

    if (key.img) {
        const img = document.createElement('img');
        img.src = key.img;
        img.alt = key.label || key.id;
        img.onerror = () => { img.replaceWith(createSvgFallback(key.icon)); };
        el.appendChild(img);
    } else if (key.icon) {
        el.appendChild(createSvgFallback(key.icon));
    } else {
        const main = document.createElement('span');
        main.className = 'key-text';
        main.textContent = key.text;
        el.appendChild(main);
    }

    if (key.label || key.img) {
        const span = document.createElement('span');
        span.textContent = key.label || '';
        el.appendChild(span);
    }

    return el;
}

function renderLayout(layout) {
    const groupsEl = document.getElementById('groups');
    groupsEl.innerHTML = '';

    layout.groups.forEach((group, i) => {
        if (i > 0) {
            const div = document.createElement('div');
            div.className = 'group-divider';
            groupsEl.appendChild(div);
        }
        const section = document.createElement('div');
        section.className = 'section';
        group.forEach(rowKeys => {
            const row = document.createElement('div');
            row.className = 'row';
            rowKeys.forEach(key => row.appendChild(buildKey(key)));
            section.appendChild(row);
        });
        groupsEl.appendChild(section);
    });

    document.getElementById('layout-name').textContent = layout.name.toUpperCase();
    window.electronAPI.resizeWindow(layout.size);
}

function switchLayout(dir) {
    current = (current + dir + LAYOUTS.length) % LAYOUTS.length;
    localStorage.setItem('layout', current);
    renderLayout(LAYOUTS[current]);
}

document.getElementById('prev-layout').addEventListener('click', () => switchLayout(-1));
document.getElementById('next-layout').addEventListener('click', () => switchLayout(1));
document.getElementById('close-btn').addEventListener('click', () => window.electronAPI.quit());

// ── Key activation ────────────────────────────────────────
function activate(id) {
    document.getElementById(id)?.classList.add('active');
}

function deactivate(id) {
    document.getElementById(id)?.classList.remove('active');
}

window.electronAPI.onInputEvent(({ type, key }) => {
    if (type === 'keyDown') activate(key);
    else if (type === 'keyUp') deactivate(key);
});

renderLayout(LAYOUTS[current]);
