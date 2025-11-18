// Estado global de la aplicación
let diccionario = [];
let resultadosExactos = [];
let resultadosEnEjemplos = [];
let filtrosActivos = {
    busqueda: '',
    categoria: '',
    letra: '',
    tipoSustantivo: '',
    soloConEjemplos: false
};

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const categoriaFilter = document.getElementById('categoriaFilter');
const letraFilter = document.getElementById('letraFilter');
const tipoSustantivoFilter = document.getElementById('tipoSustantivoFilter');
const soloConEjemplosCheck = document.getElementById('soloConEjemplos');
const toggleFiltersBtn = document.getElementById('toggleFilters');
const advancedFilters = document.getElementById('advancedFilters');
const mainResultsDiv = document.getElementById('mainResults');
const resultsDiv = document.getElementById('results');
const exampleResultsDiv = document.getElementById('exampleResults');
const exampleResultsGrid = document.getElementById('exampleResultsGrid');
const loadingDiv = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const resultsInfo = document.getElementById('resultsInfo');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');

// Cargar diccionario al iniciar
async function cargarDiccionario() {
    try {
        const response = await fetch('diccionario.json');
        diccionario = await response.json();
        
        // Llenar el filtro de letras
        const letrasUnicas = [...new Set(diccionario.map(p => p.letra).filter(l => l))].sort();
        letrasUnicas.forEach(letra => {
            const option = document.createElement('option');
            option.value = letra;
            option.textContent = letra.toUpperCase();
            letraFilter.appendChild(option);
        });
        
        // Actualizar estadísticas
        document.getElementById('totalPalabras').textContent = diccionario.length.toLocaleString('es-PE');
        
        const totalEjemplos = diccionario.reduce((sum, p) => sum + (p.ejemplos?.length || 0), 0);
        document.getElementById('totalEjemplos').textContent = totalEjemplos.toLocaleString('es-PE');
        
        const categoriasUnicas = new Set(diccionario.map(p => p.categoria).filter(c => c));
        document.getElementById('totalCategorias').textContent = categoriasUnicas.size.toLocaleString('es-PE');
        
        // Mostrar resultados iniciales (primeras 50 palabras)
        resultadosExactos = diccionario.slice(0, 50);
        resultadosEnEjemplos = [];
        mostrarResultados();
        loadingDiv.style.display = 'none';
    } catch (error) {
        console.error('Error al cargar el diccionario:', error);
        loadingDiv.innerHTML = '<p style="color: red;">Error al cargar el diccionario. Por favor, recarga la página.</p>';
    }
}

// Función de búsqueda y filtrado MEJORADA
function aplicarFiltros() {
    let resultados = diccionario;
    let enEjemplos = [];
    
    // Filtro de búsqueda con priorización
    if (filtrosActivos.busqueda) {
        const termino = filtrosActivos.busqueda.toLowerCase().trim();
        
        // PASO 1: Buscar coincidencias EXACTAS en termino y español
        const coincidenciasExactas = resultados.filter(palabra => {
            const matchTerminoExacto = palabra.termino.toLowerCase() === termino;
            const matchEspanolExacto = palabra.espanol.toLowerCase() === termino;
            return matchTerminoExacto || matchEspanolExacto;
        });
        
        // PASO 2: Buscar coincidencias PARCIALES en termino y español (pero no en ejemplos)
        const coincidenciasParciales = resultados.filter(palabra => {
            // Excluir las que ya están en exactas
            if (coincidenciasExactas.some(p => p.id === palabra.id)) return false;
            
            const matchTermino = palabra.termino.toLowerCase().includes(termino);
            const matchEspanol = palabra.espanol.toLowerCase().includes(termino);
            return matchTermino || matchEspanol;
        });
        
        // PASO 3: Buscar en ejemplos (separado)
        enEjemplos = resultados.filter(palabra => {
            // Excluir las que ya están en exactas o parciales
            if (coincidenciasExactas.some(p => p.id === palabra.id)) return false;
            if (coincidenciasParciales.some(p => p.id === palabra.id)) return false;
            
            return palabra.ejemplos.some(ej => 
                ej.shipibo.toLowerCase().includes(termino) ||
                ej.castellano.toLowerCase().includes(termino)
            );
        });
        
        // Combinar resultados principales (exactas + parciales)
        resultados = [...coincidenciasExactas, ...coincidenciasParciales];
    }
    
    // Filtro de categoría
    if (filtrosActivos.categoria) {
        resultados = resultados.filter(p => p.categoria === filtrosActivos.categoria);
        enEjemplos = enEjemplos.filter(p => p.categoria === filtrosActivos.categoria);
    }
    
    // Filtro de letra
    if (filtrosActivos.letra) {
        resultados = resultados.filter(p => p.letra === filtrosActivos.letra);
        enEjemplos = enEjemplos.filter(p => p.letra === filtrosActivos.letra);
    }
    
    // Filtro de tipo de sustantivo
    if (filtrosActivos.tipoSustantivo) {
        resultados = resultados.filter(p => 
            p.categoria_sustantivo && 
            p.categoria_sustantivo.toLowerCase().includes(filtrosActivos.tipoSustantivo.toLowerCase())
        );
        enEjemplos = enEjemplos.filter(p => 
            p.categoria_sustantivo && 
            p.categoria_sustantivo.toLowerCase().includes(filtrosActivos.tipoSustantivo.toLowerCase())
        );
    }
    
    // Filtro de solo con ejemplos
    if (filtrosActivos.soloConEjemplos) {
        resultados = resultados.filter(p => p.ejemplos && p.ejemplos.length > 0);
        enEjemplos = enEjemplos.filter(p => p.ejemplos && p.ejemplos.length > 0);
    }
    
    // Limitar resultados si no hay búsqueda activa (para rendimiento)
    if (!filtrosActivos.busqueda && resultados.length > 100) {
        resultados = resultados.slice(0, 100);
        enEjemplos = [];
    }
    
    resultadosExactos = resultados;
    resultadosEnEjemplos = enEjemplos;
    mostrarResultados();
}

// Mostrar resultados en la pantalla
function mostrarResultados() {
    resultsDiv.innerHTML = '';
    exampleResultsGrid.innerHTML = '';
    
    const hayResultadosExactos = resultadosExactos.length > 0;
    const hayResultadosEjemplos = resultadosEnEjemplos.length > 0;
    
    // Si no hay resultados en ninguna categoría
    if (!hayResultadosExactos && !hayResultadosEjemplos) {
        mainResultsDiv.style.display = 'none';
        exampleResultsDiv.style.display = 'none';
        emptyState.style.display = 'block';
        resultsInfo.textContent = '';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Mostrar sección de resultados exactos
    if (hayResultadosExactos) {
        mainResultsDiv.style.display = 'block';
        resultadosExactos.forEach(palabra => {
            const card = crearTarjetaPalabra(palabra, 'exact-match');
            resultsDiv.appendChild(card);
        });
    } else {
        mainResultsDiv.style.display = 'none';
    }
    
    // Mostrar sección de resultados en ejemplos
    if (hayResultadosEjemplos) {
        exampleResultsDiv.style.display = 'block';
        resultadosEnEjemplos.forEach(palabra => {
            const card = crearTarjetaPalabra(palabra, 'example-match');
            exampleResultsGrid.appendChild(card);
        });
    } else {
        exampleResultsDiv.style.display = 'none';
    }
    
    // Actualizar información de resultados
    let infoText = '';
    if (hayResultadosExactos) {
        infoText += `${resultadosExactos.length} coincidencia${resultadosExactos.length === 1 ? '' : 's'} directa${resultadosExactos.length === 1 ? '' : 's'}`;
    }
    if (hayResultadosEjemplos) {
        if (infoText) infoText += ' • ';
        infoText += `${resultadosEnEjemplos.length} en ejemplos`;
    }
    if (filtrosActivos.busqueda) {
        infoText += ` para "${filtrosActivos.busqueda}"`;
    }
    resultsInfo.textContent = infoText;
}

// Crear tarjeta de palabra
function crearTarjetaPalabra(palabra, matchType = 'exact-match') {
    const card = document.createElement('div');
    card.className = `word-card ${matchType}`;
    card.onclick = () => abrirModal(palabra);
    
    // Resaltar términos de búsqueda
    const terminoHTML = resaltarTexto(palabra.termino, filtrosActivos.busqueda);
    const espanolHTML = resaltarTexto(palabra.espanol, filtrosActivos.busqueda);
    
    let metaHTML = '';
    if (palabra.letra) {
        metaHTML += `<span class="meta-badge">📖 ${palabra.letra.toUpperCase()}</span>`;
    }
    if (palabra.categoria_sustantivo) {
        metaHTML += `<span class="meta-badge">🏷️ ${palabra.categoria_sustantivo}</span>`;
    }
    if (palabra.ejemplos && palabra.ejemplos.length > 0) {
        metaHTML += `<span class="meta-badge">💬 ${palabra.ejemplos.length} ${palabra.ejemplos.length === 1 ? 'ejemplo' : 'ejemplos'}</span>`;
    }
    
    let ejemploPreview = '';
    if (palabra.ejemplos && palabra.ejemplos.length > 0) {
        const ejemplo = palabra.ejemplos[0];
        const shipibo = resaltarTexto(ejemplo.shipibo, filtrosActivos.busqueda);
        const castellano = resaltarTexto(ejemplo.castellano, filtrosActivos.busqueda);
        ejemploPreview = `
            <div class="word-examples">
                <div class="example-preview">
                    "${shipibo}"<br>
                    <small>${castellano}</small>
                </div>
                ${palabra.ejemplos.length > 1 ? '<div class="view-more">Ver más ejemplos →</div>' : ''}
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="word-header">
            <h3 class="word-term">${terminoHTML}</h3>
            ${palabra.categoria ? `<span class="word-category">${palabra.categoria}</span>` : ''}
        </div>
        <p class="word-translation">${espanolHTML}</p>
        ${metaHTML ? `<div class="word-meta">${metaHTML}</div>` : ''}
        ${ejemploPreview}
    `;
    
    return card;
}

// Resaltar texto en búsqueda
function resaltarTexto(texto, termino) {
    if (!termino) return texto;
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.replace(regex, '<span class="highlight">$1</span>');
}

// Abrir modal con detalles completos
function abrirModal(palabra) {
    let ejemplosHTML = '';
    if (palabra.ejemplos && palabra.ejemplos.length > 0) {
        ejemplosHTML = `
            <div class="modal-section">
                <h3>💬 Ejemplos de uso</h3>
                ${palabra.ejemplos.map(ej => `
                    <div class="example-item">
                        <div class="example-shipibo">${ej.shipibo}</div>
                        <div class="example-castellano">${ej.castellano}</div>
                        ${ej.nota ? `<div class="example-nota">Nota: ${ej.nota}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let infoAdicionalHTML = '';
    const infoItems = [];
    
    if (palabra.dialecto) infoItems.push(`<strong>Dialecto/Forma:</strong> ${palabra.dialecto}`);
    if (palabra.variante) infoItems.push(`<strong>Variante:</strong> ${palabra.variante}`);
    if (palabra.etimologia) infoItems.push(`<strong>Etimología:</strong> ${palabra.etimologia}`);
    if (palabra.sinonimos) infoItems.push(`<strong>Sinónimos:</strong> ${palabra.sinonimos}`);
    if (palabra.categoria_sustantivo) infoItems.push(`<strong>Tipo:</strong> ${palabra.categoria_sustantivo}`);
    if (palabra.subcategoria) infoItems.push(`<strong>Subcategoría:</strong> ${palabra.subcategoria}`);
    
    if (infoItems.length > 0) {
        infoAdicionalHTML = `
            <div class="modal-section">
                <h3>ℹ️ Información adicional</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${infoItems.map(item => `<div style="font-size: 0.875rem;">${item}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div>
            <h2 class="modal-term">${palabra.termino}</h2>
            <p class="modal-translation">${palabra.espanol}</p>
            ${palabra.categoria ? `<div style="margin-bottom: 1.5rem;"><span class="word-category">${palabra.categoria}</span></div>` : ''}
            ${ejemplosHTML}
            ${infoAdicionalHTML}
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function cerrarModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    filtrosActivos.busqueda = e.target.value;
    clearSearchBtn.style.display = e.target.value ? 'flex' : 'none';
    aplicarFiltros();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    filtrosActivos.busqueda = '';
    clearSearchBtn.style.display = 'none';
    aplicarFiltros();
});

categoriaFilter.addEventListener('change', (e) => {
    filtrosActivos.categoria = e.target.value;
    aplicarFiltros();
});

letraFilter.addEventListener('change', (e) => {
    filtrosActivos.letra = e.target.value;
    aplicarFiltros();
});

tipoSustantivoFilter.addEventListener('change', (e) => {
    filtrosActivos.tipoSustantivo = e.target.value;
    aplicarFiltros();
});

soloConEjemplosCheck.addEventListener('change', (e) => {
    filtrosActivos.soloConEjemplos = e.target.checked;
    aplicarFiltros();
});

toggleFiltersBtn.addEventListener('click', () => {
    const isHidden = advancedFilters.style.display === 'none';
    advancedFilters.style.display = isHidden ? 'block' : 'none';
    toggleFiltersBtn.textContent = isHidden ? '▼ Ocultar filtros' : '▶ Filtros avanzados';
});

closeModalBtn.addEventListener('click', cerrarModal);

modal.querySelector('.modal-overlay').addEventListener('click', cerrarModal);

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        cerrarModal();
    }
});

// Enlaces del footer (puedes personalizarlos)
document.getElementById('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Proyecto de preservación digital de la lengua Shipibo-Konibo.\n\nEste diccionario está diseñado para facilitar el aprendizaje y la preservación de esta importante lengua amazónica.');
});

document.getElementById('contactLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Para más información o sugerencias, contacta al equipo del proyecto.');
});

// Inicializar la aplicación
cargarDiccionario();
