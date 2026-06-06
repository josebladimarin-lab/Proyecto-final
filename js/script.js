/**
 * SimulaCrisis — JavaScript Externo
 * Programación Web I — 2026
 * 
 * Funcionalidades:
 * - Simulador A: Carburante
 * - Simulador B: Precios de alimentos
 * - Simulador C: Transporte con desvío
 * - Simulador D: Compras familiares
 * - Simulador E: Escasez y compras por pánico
 * - Simulador F: Poder adquisitivo
 * - Casos de estudio predefinidos
 */

// =============================================
// NAVEGACIÓN
// =============================================

/**
 * Alterna el menú en dispositivos móviles
 */
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

// =============================================
// CAMBIO DE PESTAÑAS (TABS)
// =============================================

/**
 * Cambia la pestaña activa del simulador
 * @param {string} id - ID del tab a activar
 */
function switchTab(id) {
  // Ocultar todos los contenidos
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  // Desactivar todos los botones
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

  // Activar el seleccionado
  document.getElementById('tab-' + id).classList.add('active');
  event.target.classList.add('active');
}

// =============================================
// UTILIDADES COMUNES
// =============================================

/**
 * Valida que un campo no esté vacío
 * @param {string} valor - El valor a validar
 * @returns {boolean}
 */
function esValido(valor) {
  return valor !== '' && !isNaN(valor) && Number(valor) >= 0;
}

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string}
 */
function formatNum(num) {
  return Number(num).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// =============================================
// ESCENARIO A — SIMULADOR DE CARBURANTE
// =============================================

function calcularCarburante() {
  const reservaInicial = document.getElementById('c-reserva').value;
  const consumoDiario  = document.getElementById('c-consumo').value;
  const reabastecimiento = document.getElementById('c-reabastecimiento').value;
  const nivelCritico   = document.getElementById('c-critico').value;

  // Validación
  if (!esValido(reservaInicial) || !esValido(consumoDiario) || !esValido(reabastecimiento) || !esValido(nivelCritico)) {
    mostrarAlertaValidacion('resultado-carburante');
    return;
  }

  const reserva0  = parseFloat(reservaInicial);
  const consumo   = parseFloat(consumoDiario);
  const reabast   = parseFloat(reabastecimiento);
  const critico   = parseFloat(nivelCritico);
  const neto      = consumo - reabast; // consumo neto por día

  let diasHastaCritico = 0;
  let reservaActual = reserva0;

  if (neto <= 0) {
    // La reserva nunca llega al nivel crítico (se reabastece igual o más rápido)
    mostrarResultadoCarburante(null, reserva0, consumo, reabast, critico, true);
    return;
  }

  // Simulación día a día
  const tablaDias = [];
  while (reservaActual > critico && diasHastaCritico < 3650) {
    diasHastaCritico++;
    reservaActual = reserva0 - (neto * diasHastaCritico);
    tablaDias.push({ dia: diasHastaCritico, reserva: Math.max(reservaActual, 0) });
  }

  mostrarResultadoCarburante(diasHastaCritico, reserva0, consumo, reabast, critico, false, tablaDias.slice(0, 7));
}

function mostrarResultadoCarburante(dias, reserva0, consumo, reabast, critico, infinito, tabla) {
  const div = document.getElementById('resultado-carburante');
  const neto = consumo - reabast;
  const diasAgotamiento = infinito ? '∞' : Math.ceil((reserva0 - 0) / neto);

  let status = dias <= 3 ? 'danger' : (dias <= 7 ? 'warning' : 'ok');
  let mensaje = '';

  if (infinito) {
    status = 'ok';
    mensaje = '✅ El reabastecimiento es suficiente. La reserva nunca llega al nivel crítico.';
  } else if (dias <= 3) {
    mensaje = `🚨 ¡ALERTA CRÍTICA! La reserva llegará al nivel crítico en solo ${dias} día(s).`;
  } else if (dias <= 7) {
    mensaje = `⚠️ Situación de alerta: la reserva llegará al nivel crítico en ${dias} días.`;
  } else {
    mensaje = `✅ Situación controlada. La reserva durará ${dias} días antes de llegar al nivel crítico.`;
  }

  let tablaHTML = '';
  if (tabla && tabla.length > 0) {
    tablaHTML = `
      <div class="result-card" style="margin-top:1rem">
        <h4>Proyección por días</h4>
        <table class="result-table">
          <tr><th>Día</th><th>Reserva (litros)</th><th>Estado</th></tr>
          ${tabla.map(r => `
            <tr>
              <td>Día ${r.dia}</td>
              <td>${formatNum(Math.max(r.reserva, 0))} L</td>
              <td style="color:${r.reserva <= critico ? 'var(--color-danger)' : r.reserva <= critico * 1.5 ? 'var(--color-warning)' : 'var(--color-success)'}">${r.reserva <= critico ? '⚠ Crítico' : '✓ Normal'}</td>
            </tr>
          `).join('')}
        </table>
      </div>`;
  }

  div.innerHTML = `
    <div class="result-card status-${status}">
      <h4>Días hasta nivel crítico</h4>
      <div class="result-value ${status}">${infinito ? '∞' : dias}</div>
      <div class="result-sub">Consumo neto diario: ${formatNum(neto)} litros</div>
    </div>
    <div class="result-card">
      <h4>Resumen</h4>
      <table class="result-table">
        <tr><td>Reserva inicial</td><td><strong>${formatNum(reserva0)} L</strong></td></tr>
        <tr><td>Consumo diario</td><td>${formatNum(consumo)} L</td></tr>
        <tr><td>Reabastecimiento diario</td><td>${formatNum(reabast)} L</td></tr>
        <tr><td>Consumo neto</td><td>${formatNum(neto)} L/día</td></tr>
        <tr><td>Nivel crítico</td><td>${formatNum(critico)} L</td></tr>
      </table>
    </div>
    <div class="result-alert ${status}">${mensaje}</div>
    ${tablaHTML}
  `;
}

function limpiarCarburante() {
  ['c-reserva', 'c-consumo', 'c-reabastecimiento', 'c-critico'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('resultado-carburante').innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-icon">⛽</div>
      <p>Ingresa los datos y presiona <strong>Calcular</strong> para ver los resultados.</p>
    </div>`;
}

// =============================================
// ESCENARIO B — SIMULADOR DE PRECIOS
// =============================================

let contadorProductos = 1;

function agregarProducto() {
  const lista = document.getElementById('productos-lista');
  const div = document.createElement('div');
  div.className = 'producto-row';
  div.innerHTML = `
    <div class="form-group">
      <label>Producto</label>
      <input type="text" class="p-nombre" placeholder="Ej: Papa" />
    </div>
    <div class="form-group">
      <label>Precio anterior (Bs)</label>
      <input type="number" class="p-anterior" placeholder="7" min="0" />
    </div>
    <div class="form-group">
      <label>Precio actual (Bs)</label>
      <input type="number" class="p-actual" placeholder="10" min="0" />
    </div>
    <div class="form-group">
      <label>Cantidad mensual</label>
      <input type="number" class="p-cantidad" placeholder="8" min="0" />
    </div>
    <button onclick="this.parentElement.remove()" style="background:none;border:1px solid var(--color-danger);color:var(--color-danger);padding:0.3rem 0.75rem;border-radius:100px;cursor:pointer;font-size:0.8rem;margin-top:0.25rem;">Eliminar ✕</button>
  `;
  lista.appendChild(div);
  contadorProductos++;
}

function calcularPrecios() {
  const filas = document.querySelectorAll('#productos-lista .producto-row');
  const productos = [];
  let valido = true;

  filas.forEach(fila => {
    const nombre   = fila.querySelector('.p-nombre').value.trim();
    const anterior = parseFloat(fila.querySelector('.p-anterior').value);
    const actual   = parseFloat(fila.querySelector('.p-actual').value);
    const cantidad = parseFloat(fila.querySelector('.p-cantidad').value);

    if (!nombre || isNaN(anterior) || isNaN(actual) || isNaN(cantidad)) {
      valido = false;
      return;
    }
    productos.push({ nombre, anterior, actual, cantidad });
  });

  if (!valido || productos.length === 0) {
    mostrarAlertaValidacion('resultado-precios');
    return;
  }

  let gastoAnteriorTotal = 0;
  let gastoActualTotal   = 0;

  const filasProd = productos.map(p => {
    const gastoAnt = p.anterior * p.cantidad;
    const gastoAct = p.actual   * p.cantidad;
    const incremento = p.actual - p.anterior;
    const pct = ((incremento / p.anterior) * 100).toFixed(1);
    gastoAnteriorTotal += gastoAnt;
    gastoActualTotal   += gastoAct;
    return `
      <tr>
        <td>${p.nombre}</td>
        <td>${formatNum(p.anterior)} Bs</td>
        <td>${formatNum(p.actual)} Bs</td>
        <td style="color:${incremento > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">+${pct}%</td>
        <td>${formatNum(p.cantidad)}</td>
        <td>${formatNum(gastoAnt)} Bs</td>
        <td>${formatNum(gastoAct)} Bs</td>
      </tr>`;
  }).join('');

  const diferencia = gastoActualTotal - gastoAnteriorTotal;
  const pctTotal   = ((diferencia / gastoAnteriorTotal) * 100).toFixed(1);
  const status     = diferencia > gastoAnteriorTotal * 0.3 ? 'danger' : (diferencia > 0 ? 'warning' : 'ok');

  document.getElementById('resultado-precios').innerHTML = `
    <div class="result-card status-${status}">
      <h4>Gasto adicional mensual</h4>
      <div class="result-value ${status}">+${formatNum(diferencia)} Bs</div>
      <div class="result-sub">Incremento del ${pctTotal}% en el gasto familiar</div>
    </div>
    <div class="result-card">
      <table class="result-table">
        <tr><th>Producto</th><th>Antes</th><th>Ahora</th><th>% Suba</th><th>Cant.</th><th>Gasto ant.</th><th>Gasto act.</th></tr>
        ${filasProd}
        <tr style="font-weight:700;background:var(--color-bg-light)">
          <td colspan="5"><strong>TOTAL</strong></td>
          <td>${formatNum(gastoAnteriorTotal)} Bs</td>
          <td>${formatNum(gastoActualTotal)} Bs</td>
        </tr>
      </table>
    </div>
    <div class="result-alert ${status}">
      ${diferencia > 0
        ? `📈 La familia gasta <strong>${formatNum(diferencia)} Bs más</strong> al mes por el aumento de precios.`
        : `✅ El gasto no ha aumentado en este periodo.`}
    </div>
  `;
}

function limpiarPrecios() {
  const lista = document.getElementById('productos-lista');
  lista.innerHTML = `
    <div class="producto-row" id="prod-0">
      <div class="form-group">
        <label>Producto</label>
        <input type="text" class="p-nombre" placeholder="Ej: Arroz" />
      </div>
      <div class="form-group">
        <label>Precio anterior (Bs)</label>
        <input type="number" class="p-anterior" placeholder="8" min="0" />
      </div>
      <div class="form-group">
        <label>Precio actual (Bs)</label>
        <input type="number" class="p-actual" placeholder="11" min="0" />
      </div>
      <div class="form-group">
        <label>Cantidad mensual</label>
        <input type="number" class="p-cantidad" placeholder="10" min="0" />
      </div>
    </div>`;
  document.getElementById('resultado-precios').innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-icon">🛒</div>
      <p>Ingresa los productos y presiona <strong>Calcular</strong> para ver los resultados.</p>
    </div>`;
}

// =============================================
// ESCENARIO C — SIMULADOR DE TRANSPORTE
// =============================================

function calcularTransporte() {
  const normal  = document.getElementById('t-normal').value;
  const desvio  = document.getElementById('t-desvio').value;
  const costoKm = document.getElementById('t-costo-km').value;
  const viajes  = document.getElementById('t-viajes').value;

  if (!esValido(normal) || !esValido(desvio) || !esValido(costoKm) || !esValido(viajes)) {
    mostrarAlertaValidacion('resultado-transporte');
    return;
  }

  const dNormal  = parseFloat(normal);
  const dDesvio  = parseFloat(desvio);
  const cKm      = parseFloat(costoKm);
  const vSemana  = parseFloat(viajes);

  // Modelos matemáticos
  const costoNormalViaje  = dNormal * cKm;
  const costoDesvioViaje  = dDesvio * cKm;
  const diferencia        = costoDesvioViaje - costoNormalViaje;

  const costoNormalSemanal = costoNormalViaje * vSemana;
  const costoDesvioSemanal = costoDesvioViaje * vSemana;
  const gastoAdicSemanal   = diferencia * vSemana;
  const gastoAdicMensual   = gastoAdicSemanal * 4.3;

  const status = gastoAdicSemanal > costoNormalSemanal * 0.5 ? 'danger' : (gastoAdicSemanal > 0 ? 'warning' : 'ok');

  document.getElementById('resultado-transporte').innerHTML = `
    <div class="result-card status-${status}">
      <h4>Gasto adicional semanal</h4>
      <div class="result-value ${status}">${formatNum(gastoAdicSemanal)} Bs</div>
      <div class="result-sub">Por semana a causa del desvío</div>
    </div>
    <div class="result-card">
      <h4>Desglose de costos</h4>
      <table class="result-table">
        <tr><td>Costo normal por viaje</td><td><strong>${formatNum(costoNormalViaje)} Bs</strong></td></tr>
        <tr><td>Costo con desvío por viaje</td><td>${formatNum(costoDesvioViaje)} Bs</td></tr>
        <tr><td>Diferencia por viaje</td><td style="color:var(--color-danger)">+${formatNum(diferencia)} Bs</td></tr>
        <tr><td>Costo normal semanal</td><td>${formatNum(costoNormalSemanal)} Bs</td></tr>
        <tr><td>Costo con desvío semanal</td><td>${formatNum(costoDesvioSemanal)} Bs</td></tr>
        <tr><td>Gasto adicional mensual (aprox.)</td><td style="color:var(--color-danger)"><strong>+${formatNum(gastoAdicMensual)} Bs</strong></td></tr>
      </table>
    </div>
    <div class="result-alert ${status}">
      ${gastoAdicSemanal > 0
        ? `🚌 El desvío genera un costo adicional de <strong>${formatNum(gastoAdicSemanal)} Bs/semana</strong> y <strong>${formatNum(gastoAdicMensual)} Bs/mes</strong>.`
        : `✅ La ruta con desvío no genera costos adicionales.`}
    </div>
  `;
}

function limpiarTransporte() {
  ['t-normal', 't-desvio', 't-costo-km', 't-viajes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('resultado-transporte').innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-icon">🚌</div>
      <p>Ingresa los datos y presiona <strong>Calcular</strong> para ver los resultados.</p>
    </div>`;
}

// =============================================
// ESCENARIO D — SIMULADOR DE COMPRAS
// =============================================

function agregarCompra() {
  const lista = document.getElementById('compras-lista');
  const div = document.createElement('div');
  div.className = 'producto-row';
  div.innerHTML = `
    <div class="form-group">
      <label>Producto</label>
      <input type="text" class="comp-nombre" placeholder="Ej: Aceite" />
    </div>
    <div class="form-group">
      <label>Precio (Bs)</label>
      <input type="number" class="comp-precio" placeholder="Ej: 20" min="0" step="0.01" />
    </div>
    <div class="form-group">
      <label>Cantidad</label>
      <input type="number" class="comp-cantidad" placeholder="Ej: 1" min="0" />
    </div>
    <button onclick="this.parentElement.remove()" style="background:none;border:1px solid var(--color-danger);color:var(--color-danger);padding:0.3rem 0.75rem;border-radius:100px;cursor:pointer;font-size:0.8rem;margin-top:0.25rem;">Eliminar ✕</button>
  `;
  lista.appendChild(div);
}

function calcularCompras() {
  const presupuesto = parseFloat(document.getElementById('comp-presupuesto').value);
  if (isNaN(presupuesto) || presupuesto < 0) {
    mostrarAlertaValidacion('resultado-compras');
    return;
  }

  const filas = document.querySelectorAll('#compras-lista .producto-row');
  const items = [];
  let totalCompra = 0;
  let valido = true;

  filas.forEach(fila => {
    const nombre   = fila.querySelector('.comp-nombre').value.trim();
    const precio   = parseFloat(fila.querySelector('.comp-precio').value);
    const cantidad = parseFloat(fila.querySelector('.comp-cantidad').value);

    if (!nombre || isNaN(precio) || isNaN(cantidad)) {
      valido = false;
      return;
    }
    const subtotal = precio * cantidad;
    totalCompra += subtotal;
    items.push({ nombre, precio, cantidad, subtotal });
  });

  if (!valido || items.length === 0) {
    mostrarAlertaValidacion('resultado-compras');
    return;
  }

  const saldo    = presupuesto - totalCompra;
  const alcanza  = saldo >= 0;
  const nivelGasto = totalCompra < presupuesto * 0.7 ? 'Bajo' : (totalCompra < presupuesto * 0.9 ? 'Medio' : 'Alto');
  const status   = alcanza ? (nivelGasto === 'Bajo' ? 'ok' : 'warning') : 'danger';

  const filasItems = items.map(i => `
    <tr>
      <td>${i.nombre}</td>
      <td>${formatNum(i.precio)} Bs</td>
      <td>${formatNum(i.cantidad)}</td>
      <td><strong>${formatNum(i.subtotal)} Bs</strong></td>
    </tr>
  `).join('');

  document.getElementById('resultado-compras').innerHTML = `
    <div class="result-card status-${status}">
      <h4>${alcanza ? 'Saldo disponible' : 'Monto faltante'}</h4>
      <div class="result-value ${status}">${alcanza ? formatNum(saldo) : formatNum(Math.abs(saldo))} Bs</div>
      <div class="result-sub">Total de compra: ${formatNum(totalCompra)} Bs · Presupuesto: ${formatNum(presupuesto)} Bs</div>
    </div>
    <div class="result-card">
      <table class="result-table">
        <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr>
        ${filasItems}
        <tr style="font-weight:700;background:var(--color-bg-light)">
          <td colspan="3"><strong>TOTAL</strong></td>
          <td><strong>${formatNum(totalCompra)} Bs</strong></td>
        </tr>
      </table>
    </div>
    <div class="result-alert ${status}">
      ${alcanza
        ? `✅ El presupuesto <strong>alcanza</strong>. Nivel de gasto: <strong>${nivelGasto}</strong>. Saldo restante: <strong>${formatNum(saldo)} Bs</strong>.`
        : `🚨 El presupuesto <strong>no alcanza</strong>. Faltan <strong>${formatNum(Math.abs(saldo))} Bs</strong> para cubrir la compra.`}
    </div>
  `;
}

function limpiarCompras() {
  document.getElementById('comp-presupuesto').value = '';
  document.getElementById('compras-lista').innerHTML = `
    <div class="producto-row">
      <div class="form-group">
        <label>Producto</label>
        <input type="text" class="comp-nombre" placeholder="Ej: Arroz" />
      </div>
      <div class="form-group">
        <label>Precio (Bs)</label>
        <input type="number" class="comp-precio" placeholder="Ej: 15" min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label>Cantidad</label>
        <input type="number" class="comp-cantidad" placeholder="Ej: 2" min="0" />
      </div>
    </div>`;
  document.getElementById('resultado-compras').innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-icon">🏠</div>
      <p>Ingresa el presupuesto y los productos para ver si alcanza.</p>
    </div>`;
}

// =============================================
// ESCENARIO E — SIMULADOR DE ESCASEZ
// =============================================

function calcularEscasez() {
  const demandaNormal = document.getElementById('e-demanda').value;
  const porcentaje    = document.getElementById('e-porcentaje').value;
  const stock         = document.getElementById('e-stock').value;
  const personas      = document.getElementById('e-personas').value;

  if (!esValido(demandaNormal) || !esValido(porcentaje) || !esValido(stock) || !esValido(personas)) {
    mostrarAlertaValidacion('resultado-escasez');
    return;
  }

  const dNormal = parseFloat(demandaNormal);
  const pct     = parseFloat(porcentaje) / 100;
  const stk     = parseFloat(stock);
  const npersonas = parseFloat(personas);

  // Modelo matemático: nueva demanda = demanda normal + demanda normal × porcentaje
  const nuevaDemanda = dNormal + (dNormal * pct);
  const diferencia   = nuevaDemanda - dNormal;
  const stockRestante = stk - nuevaDemanda;
  const alcanza       = stockRestante >= 0;
  const status        = alcanza ? 'ok' : 'danger';

  const porcStock = ((nuevaDemanda / stk) * 100).toFixed(1);

  document.getElementById('resultado-escasez').innerHTML = `
    <div class="result-card status-${status}">
      <h4>Nueva demanda por rumor</h4>
      <div class="result-value ${status}">${formatNum(nuevaDemanda)}</div>
      <div class="result-sub">unidades requeridas (${porcStock}% del stock disponible)</div>
    </div>
    <div class="result-card">
      <h4>Análisis de stock</h4>
      <table class="result-table">
        <tr><td>Demanda normal</td><td>${formatNum(dNormal)} unidades</td></tr>
        <tr><td>Aumento por rumor (${formatNum(parseFloat(porcentaje))}%)</td><td style="color:var(--color-warning)">+${formatNum(diferencia)} unidades</td></tr>
        <tr><td>Nueva demanda total</td><td><strong>${formatNum(nuevaDemanda)} unidades</strong></td></tr>
        <tr><td>Stock disponible</td><td>${formatNum(stk)} unidades</td></tr>
        <tr><td>Stock restante</td><td style="color:${alcanza ? 'var(--color-success)' : 'var(--color-danger)'}"><strong>${formatNum(stockRestante)} unidades</strong></td></tr>
        <tr><td>Familias afectadas</td><td>${formatNum(npersonas)}</td></tr>
      </table>
    </div>
    <div class="result-alert ${status}">
      ${alcanza
        ? `✅ El stock <strong>es suficiente</strong>. Quedan ${formatNum(stockRestante)} unidades tras atender la nueva demanda.`
        : `🚨 El stock <strong>no alcanza</strong>. Faltan ${formatNum(Math.abs(stockRestante))} unidades para cubrir la demanda generada por el rumor.`}
    </div>
  `;
}

function limpiarEscasez() {
  ['e-demanda', 'e-porcentaje', 'e-stock', 'e-personas'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('resultado-escasez').innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-icon">📦</div>
      <p>Ingresa los datos y presiona <strong>Calcular</strong> para ver el impacto.</p>
    </div>`;
}

// =============================================
// ESCENARIO F — PODER ADQUISITIVO
// =============================================

function calcularAdquisitivo() {
  const ingreso     = document.getElementById('a-ingreso').value;
  const gastoAnt    = document.getElementById('a-gasto-anterior').value;
  const gastoAct    = document.getElementById('a-gasto-actual').value;

  if (!esValido(ingreso) || !esValido(gastoAnt) || !esValido(gastoAct)) {
    mostrarAlertaValidacion('resultado-adquisitivo');
    return;
  }

  const ing   = parseFloat(ingreso);
  const gAnt  = parseFloat(gastoAnt);
  const gAct  = parseFloat(gastoAct);

  const aumentoGasto   = gAct - gAnt;
  const pctPerdida     = ((aumentoGasto / ing) * 100).toFixed(1);
  const saldoAntes     = ing - gAnt;
  const saldoDespues   = ing - gAct;

  const nivel = pctPerdida >= 20 ? 'Alto' : (pctPerdida >= 10 ? 'Medio' : 'Bajo');
  const status = nivel === 'Alto' ? 'danger' : (nivel === 'Medio' ? 'warning' : 'ok');

  document.getElementById('resultado-adquisitivo').innerHTML = `
    <div class="result-card status-${status}">
      <h4>Pérdida del poder adquisitivo</h4>
      <div class="result-value ${status}">${pctPerdida}%</div>
      <div class="result-sub">Nivel de afectación: <strong>${nivel}</strong></div>
    </div>
    <div class="result-card">
      <h4>Comparativo antes y ahora</h4>
      <table class="result-table">
        <tr><td>Ingreso mensual</td><td>${formatNum(ing)} Bs</td></tr>
        <tr><td>Gasto anterior</td><td>${formatNum(gAnt)} Bs</td></tr>
        <tr><td>Gasto actual</td><td>${formatNum(gAct)} Bs</td></tr>
        <tr><td>Aumento del gasto</td><td style="color:var(--color-danger)"><strong>+${formatNum(aumentoGasto)} Bs</strong></td></tr>
        <tr><td>Saldo antes</td><td style="color:var(--color-success)">${formatNum(saldoAntes)} Bs</td></tr>
        <tr><td>Saldo ahora</td><td style="color:${saldoDespues >= 0 ? 'var(--color-warning)' : 'var(--color-danger)'}"><strong>${formatNum(saldoDespues)} Bs</strong></td></tr>
      </table>
    </div>
    <div class="result-alert ${status}">
      ${saldoDespues < 0
        ? `🚨 <strong>Déficit familiar:</strong> El gasto supera el ingreso en ${formatNum(Math.abs(saldoDespues))} Bs. La familia está en situación crítica.`
        : `💰 Con el mismo ingreso, la familia ahora tiene <strong>${formatNum(saldoAntes - saldoDespues)} Bs menos</strong> disponibles al mes. Pérdida adquisitiva del ${pctPerdida}%.`}
    </div>
  `;
}

function limpiarAdquisitivo() {
  ['a-ingreso', 'a-gasto-anterior', 'a-gasto-actual'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('resultado-adquisitivo').innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-icon">💰</div>
      <p>Ingresa los datos y presiona <strong>Calcular</strong> para ver la pérdida de poder adquisitivo.</p>
    </div>`;
}

// =============================================
// ALERTA DE VALIDACIÓN GENERAL
// =============================================

/**
 * Muestra un mensaje de error de validación en el área de resultados
 * @param {string} idResultado - ID del elemento donde mostrar la alerta
 */
function mostrarAlertaValidacion(idResultado) {
  const div = document.getElementById(idResultado);
  div.innerHTML = `
    <div class="result-alert danger">
      ⚠️ Por favor, completa todos los campos con valores válidos antes de calcular.
    </div>`;
}

// =============================================
// CASOS DE ESTUDIO — BOTONES PROBAR
// =============================================

/** Caso 1: Carburante */
function probarCaso1() {
  // Ir a la pestaña de carburante
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab').classList.add('active');
  document.getElementById('tab-carburante').classList.add('active');

  // Llenar datos
  document.getElementById('c-reserva').value = 10000;
  document.getElementById('c-consumo').value = 1200;
  document.getElementById('c-reabastecimiento').value = 300;
  document.getElementById('c-critico').value = 2000;

  calcularCarburante();

  // Scroll al simulador
  document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
}

/** Caso 2: Precios */
function probarCaso2() {
  // Ir a la pestaña de precios
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.remove('active');
    if (i === 1) t.classList.add('active');
  });
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-precios').classList.add('active');

  // Llenar datos
  limpiarPrecios();
  const lista = document.getElementById('productos-lista');
  // Fila 1 ya existe
  lista.querySelector('.p-nombre').value = 'Arroz';
  lista.querySelector('.p-anterior').value = 8;
  lista.querySelector('.p-actual').value = 11;
  lista.querySelector('.p-cantidad').value = 10;

  // Agregar Papa
  agregarProducto();
  const filas = lista.querySelectorAll('.producto-row');
  filas[1].querySelector('.p-nombre').value = 'Papa';
  filas[1].querySelector('.p-anterior').value = 7;
  filas[1].querySelector('.p-actual').value = 10;
  filas[1].querySelector('.p-cantidad').value = 8;

  // Agregar Aceite
  agregarProducto();
  const filas2 = lista.querySelectorAll('.producto-row');
  filas2[2].querySelector('.p-nombre').value = 'Aceite';
  filas2[2].querySelector('.p-anterior').value = 12;
  filas2[2].querySelector('.p-actual').value = 18;
  filas2[2].querySelector('.p-cantidad').value = 4;

  calcularPrecios();
  document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
}

/** Caso 3: Transporte */
function probarCaso3() {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.remove('active');
    if (i === 2) t.classList.add('active');
  });
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-transporte').classList.add('active');

  document.getElementById('t-normal').value = 10;
  document.getElementById('t-desvio').value = 16;
  document.getElementById('t-costo-km').value = 2;
  document.getElementById('t-viajes').value = 5;

  calcularTransporte();
  document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
}

/** Caso 4: Compras */
function probarCaso4() {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.remove('active');
    if (i === 3) t.classList.add('active');
  });
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-compras').classList.add('active');

  document.getElementById('comp-presupuesto').value = 500;
  limpiarCompras();
  document.getElementById('comp-presupuesto').value = 500;

  // Un solo ítem que sume 580
  const lista = document.getElementById('compras-lista');
  lista.querySelector('.comp-nombre').value = 'Canasta básica';
  lista.querySelector('.comp-precio').value = 580;
  lista.querySelector('.comp-cantidad').value = 1;

  calcularCompras();
  document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
}

/** Caso 5: Escasez */
function probarCaso5() {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.remove('active');
    if (i === 4) t.classList.add('active');
  });
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-escasez').classList.add('active');

  document.getElementById('e-demanda').value = 100;
  document.getElementById('e-porcentaje').value = 40;
  document.getElementById('e-stock').value = 120;
  document.getElementById('e-personas').value = 50;

  calcularEscasez();
  document.getElementById('simuladores').scrollIntoView({ behavior: 'smooth' });
}