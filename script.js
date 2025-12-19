const API = 'https://seashell-jellyfish-767109.hostingersite.com/api/sync.php';
let state = { exercise: '', unit: '', icon: '', id: null };
let cloudData = { records: [], weightRecords: [] };
let statsPeriod = 'week', referenceDate = new Date();

// Configuración de iconos y unidades para el renderizado
const EX_CONFIG = {
    Correr: { icon: '🏃', unit: 'km' },
    Flexiones: { icon: '💪', unit: 'reps' },
    Sentadillas: { icon: '🍑', unit: 'reps' },
    Plancha: { icon: '🪵', unit: 'min' },
    "Bench Press": { icon: '🏋️‍♂️', unit: 'reps' },
    Abdominales: { icon: '🧘', unit: 'reps' },
    Peso: { icon: '⚖️', unit: 'kg' }
};

window.onload = () => load();

async function load() {
    try {
        const r = await fetch(API);
        if (!r.ok) throw new Error("Servidor no responde");
        const d = await r.json();
        if (d.success) {
            cloudData = d;
            updateStatus(true);
            renderHistory(d.records, d.weightRecords);
            if (!document.getElementById('view-stats').classList.contains('hidden')) renderStats();
        } else {
            throw new Error(d.message);
        }
    } catch (e) { 
        console.error("Error cargando de Hostinger:", e);
        updateStatus(false); 
    }
}

function updateStatus(online) {
    const text = document.getElementById('status-text');
    const dot = document.getElementById('status-dot');
    text.innerText = online ? "ONLINE" : "OFFLINE";
    text.className = online ? "text-emerald-500" : "text-rose-500";
    dot.className = online ? "w-2 h-2 bg-emerald-500 rounded-full animate-pulse" : "w-2 h-2 bg-rose-500 rounded-full";
}

function setPeriod(p) {
    statsPeriod = p;
    document.querySelectorAll('.period-btn').forEach(b => {
        b.classList.remove('bg-indigo-600');
        b.classList.add('bg-slate-800');
        const label = p === 'week' ? 'semana' : p === 'month' ? 'mes' : 'año';
        if (b.innerText.toLowerCase() === label) b.classList.replace('bg-slate-800', 'bg-indigo-600');
    });
    renderStats();
}

function changeDate(delta) {
    if (statsPeriod === 'week') referenceDate.setDate(referenceDate.getDate() + (delta * 7));
    else if (statsPeriod === 'month') referenceDate.setMonth(referenceDate.getMonth() + delta);
    else if (statsPeriod === 'year') referenceDate.setFullYear(referenceDate.getFullYear() + delta);
    renderStats();
}

function getPeriodRange() {
    let start = new Date(referenceDate), end = new Date(referenceDate);
    if (statsPeriod === 'week') {
        start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
        end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    } else if (statsPeriod === 'month') {
        start.setDate(1); start.setHours(0,0,0,0);
        end.setMonth(start.getMonth() + 1); end.setDate(0); end.setHours(23,59,59,999);
    } else if (statsPeriod === 'year') {
        start.setMonth(0,1); start.setHours(0,0,0,0);
        end.setMonth(11,31); end.setHours(23,59,59,999);
    }
    return { start, end };
}

function renderStats() {
    const range = getPeriodRange();
    document.getElementById('current-period-label').innerText = `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`;

    const filterFn = r => { const d = new Date(r.fecha_iso); return d >= range.start && d <= range.end; };
    const filteredEx = cloudData.records.filter(filterFn);
    const filteredW = cloudData.weightRecords.filter(filterFn).sort((a,b) => new Date(a.fecha_iso) - new Date(b.fecha_iso));

    const exLabels = [...new Set(filteredEx.map(r => r.ejercicio))];
    const exData = exLabels.map(l => filteredEx.filter(r => r.ejercicio === l).reduce((a,b) => a + parseFloat(b.valor), 0));

    const draw = (id, labels, data, type, color) => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (window[id+'Chart']) window[id+'Chart'].destroy();
        window[id+'Chart'] = new Chart(ctx, {
            type, data: { labels, datasets: [{ data, backgroundColor: color, borderColor: color, tension: 0.3 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    };

    draw('chartEx', exLabels, exData, 'bar', '#6366f1');
    draw('chartWeight', filteredW.map(w => new Date(w.fecha_iso).toLocaleDateString()), filteredW.map(w => w.peso), 'line', '#10b981');
}

async function handleSave() {
    const val = document.getElementById('main-input').value;
    if(!val) return;
    const method = state.id ? 'PUT' : 'POST';
    const payload = state.exercise === 'Peso' 
        ? (state.id ? { id: state.id, value: val, type: 'weight' } : { weightRecords: [{ date: new Date().toISOString(), weight: val }] })
        : (state.id ? { id: state.id, value: val, type: 'exercise' } : { records: [{ date: new Date().toISOString(), exercise: state.exercise, type: state.unit, value: val }] });

    try {
        await fetch(API, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        closeInput(); load();
    } catch (err) { alert("Error al guardar"); }
}

function openInput(name, unit, icon, val = '', id = null) {
    state = { exercise: name, unit, icon, id };
    showView('register');
    document.getElementById('input-title').innerText = id ? `Editando: ${icon} ${name}` : `${icon} ${name} (${unit})`;
    document.getElementById('main-input').value = val;
    document.getElementById('input-panel').classList.remove('hidden');
    document.getElementById('exercise-selection').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeInput() { 
    document.getElementById('input-panel').classList.add('hidden'); 
    document.getElementById('exercise-selection').classList.remove('hidden'); 
}

function showView(v) {
    ['register', 'stats', 'history'].forEach(x => {
        document.getElementById('view-'+x).classList.add('hidden');
        document.getElementById('btn-nav-'+x).className = "flex-1 py-2 rounded-xl text-sm font-medium text-slate-400";
    });
    document.getElementById('view-'+v).classList.remove('hidden');
    document.getElementById('btn-nav-'+v).className = "flex-1 py-2 rounded-xl text-sm font-medium bg-indigo-600";
    if(v === 'stats') renderStats();
}

function renderHistory(ex, weights) {
    const list = document.getElementById('history-list');
    const items = [
        ...ex.map(r => ({...r, t: 'exercise', icon: EX_CONFIG[r.ejercicio]?.icon || '💪'})), 
        ...weights.map(w => ({...w, ejercicio: 'Peso', valor: w.peso, t: 'weight', icon: '⚖️'}))
    ].sort((a,b) => new Date(b.fecha_iso) - new Date(a.fecha_iso));
    
    list.innerHTML = items.map(i => `
        <div class="glass-panel p-4 rounded-2xl flex justify-between items-center">
            <div class="text-left">
                <div class="font-bold text-indigo-300">${i.ejercicio}</div>
                <div class="text-[10px] text-slate-500 uppercase">${new Date(i.fecha_iso).toLocaleString()}</div>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-xl font-bold font-mono text-white">${i.valor}</span>
                <div class="flex flex-col gap-1">
                    <button onclick="openInput('${i.ejercicio}', '', '${i.icon}', '${i.valor}', ${i.id})" class="text-indigo-400 text-[10px] font-bold border border-indigo-400/30 px-2 py-1 rounded">EDITAR</button>
                    <button onclick="remove(${i.id}, '${i.t}')" class="text-rose-500 text-[10px] font-bold border border-rose-500/30 px-2 py-1 rounded">BORRAR</button>
                </div>
            </div>
        </div>`).join('');
}

async function remove(id, type) { 
    if(confirm("¿Eliminar?")) { 
        await fetch(API, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, type }) }); 
        load(); 
    } 
}