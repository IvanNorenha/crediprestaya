// 1. GESTIÓN DE PESTAÑAS (REQUISITOS / PRESTAMOS)
function abrirPestanaPrincipal(evt, nombrePestana) {
    let contenidos = document.getElementsByClassName("contenido-pestana-principal");
    for (let i = 0; i < contenidos.length; i++) { contenidos[i].classList.remove("activo"); }
    let botones = document.getElementsByClassName("boton-pestana");
    for (let i = 0; i < botones.length; i++) { botones[i].classList.remove("activo"); }
    document.getElementById(nombrePestana).classList.add("activo");
    evt.currentTarget.classList.add("activo");
}

function abrirSubPestana(evt, nombreSubPestana) {
    let contenidos = document.getElementsByClassName("contenido-sub-pestana");
    for (let i = 0; i < contenidos.length; i++) { contenidos[i].classList.remove("activo"); }
    let botones = document.getElementsByClassName("boton-sub-pestana");
    for (let i = 0; i < botones.length; i++) { botones[i].classList.remove("activo"); }
    document.getElementById(nombreSubPestana).classList.add("activo");
    evt.currentTarget.classList.add("activo");
}

// 2. ACORDEÓN DE PREGUNTAS (CIERRE AUTOMÁTICO)
function alternarPregunta(elementoEncabezado) {
    const itemActual = elementoEncabezado.parentElement;
    const todosLosItems = document.querySelectorAll('.item-acordeon');
    todosLosItems.forEach(item => { if (item !== itemActual) { item.classList.remove('activo'); } });
    itemActual.classList.toggle('activo');
}

// 3. FUNCIÓN PARA BLOQUEAR LETRAS (Solo números en tiempo real)
function configurarInputNumerico(id, longitudMax) {
    const input = document.getElementById(id);
    if (!input) return; 

    input.addEventListener('input', function(e) {
        // Reemplaza cualquier caracter que NO sea número por vacío
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Corta si se excede la longitud
        if (this.value.length > longitudMax) {
            this.value = this.value.slice(0, longitudMax);
        }
    });
}

// Inicializar validaciones al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    configurarInputNumerico('dni', 8);      // DNI: Solo números, máx 8
    configurarInputNumerico('celular', 9);  // Celular: Solo números, máx 9
    // configurarInputNumerico('valor-inmueble', 15); // Opcional para montos
});

// 4. LÓGICA DE FORMATEO Y CÁLCULO
function formatearYCalcular(input) {
    let valor = input.value.replace(/[^0-9.]/g, ""); // Solo permite números y puntos
    if (valor) {
        let partes = valor.split('.');
        partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Formato miles
        input.value = partes.join('.');
    }
    calcularPrestamo();
}

function calcularPrestamo() {
    // Obtener valores limpios (sin comas)
    const valorCasaStr = document.getElementById('valor-inmueble').value.replace(/,/g, "");
    const montoPedidoStr = document.getElementById('monto-solicitado').value.replace(/,/g, "");
    
    const valorCasa = parseFloat(valorCasaStr) || 0;
    const montoPedido = parseFloat(montoPedidoStr) || 0;
    
    const maximoPermitido = valorCasa * 0.40;
    const inputMontoUI = document.getElementById('monto-solicitado');
    const lblCuota = document.getElementById('cuota-mensual');
    const lblGastos = document.getElementById('gastos-adm');
    const lblPlataforma = document.getElementById('gasto-plataforma');
    const lblNeto = document.getElementById('monto-neto');

    // Validación estricta: Si excede el 40%, NO CALCULA y muestra error
    if (montoPedido > maximoPermitido) {
        inputMontoUI.style.color = 'red';
        lblCuota.innerText = "Excede el 40%";
        lblCuota.style.fontSize = "1.5rem"; 
        lblCuota.style.color = "red";
        
        lblGastos.innerText = "---";
        lblPlataforma.innerText = "---";
        lblNeto.innerText = "---";
        return; 
    } else {
        inputMontoUI.style.color = '#008eff'; // Color azul normal
        lblCuota.style.color = "var(--azul-500)"; 
        lblCuota.style.fontSize = "2.5rem";
    }

    // Cálculos
    const tasaMensual = 0.03;      
    const porcentajeGastos = 0.10; 
    const porcentajePlat = 0.03;   

    const cuotaInteres = montoPedido * tasaMensual;
    const gastosAdm = montoPedido * porcentajeGastos;
    const plataforma = montoPedido * porcentajePlat;
    const montoNeto = montoPedido - (gastosAdm + plataforma); 

    const formatSoles = (num) => `S/ ${num.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    lblCuota.innerText = formatSoles(cuotaInteres);
    lblGastos.innerText = formatSoles(gastosAdm);
    lblPlataforma.innerText = formatSoles(plataforma);
    lblNeto.innerText = formatSoles(montoNeto);
}

// 5. ENVÍO DEL SIMULADOR (CON VALIDACIONES COMPLETAS)
document.getElementById('formulario-datos').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    // A. VALIDACIÓN DE DNI Y CELULAR
    const dniInput = document.getElementById('dni');
    const celInput = document.getElementById('celular');
    
    // Validar DNI (8 dígitos exactos)
    if (dniInput && dniInput.value.length !== 8) {
        alert("El DNI debe tener exactamente 8 dígitos.");
        dniInput.focus();
        dniInput.style.borderColor = "red";
        return; // Detiene el envío
    } else if (dniInput) {
        dniInput.style.borderColor = "#ddd";
    }

    // Validar Celular (9 dígitos exactos)
    if (celInput && celInput.value.length !== 9) {
        alert("El celular debe tener 9 dígitos.");
        celInput.focus();
        celInput.style.borderColor = "red";
        return; // Detiene el envío
    } else if (celInput) {
        celInput.style.borderColor = "#ddd";
    }

    // B. VALIDACIÓN REGLA DEL 40%
    // Ejecutamos cálculo para ver si hay error
    calcularPrestamo(); 
    const lblCuota = document.getElementById('cuota-mensual');
    
    const formulario = e.target;
    const boton = formulario.querySelector('button');

    if(lblCuota.innerText.includes("Excede")) {
        alert("No podemos procesar la solicitud: El monto excede el 40% del valor del inmueble.");
        return; // Detiene el envío
    }

    // C. ENVÍO DE DATOS
    boton.innerText = "Enviando..."; 
    boton.disabled = true;           

    fetch(formulario.action, {
        method: "POST",
        body: new FormData(formulario),
        headers: { 'Accept': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            formulario.style.display = 'none';           
            const calculadora = document.getElementById('calculadora-interactiva');
            calculadora.classList.remove('calculadora-oculta'); 
            calculadora.style.display = 'block';         
            document.querySelector('.subtitulo-s3').innerText = "Simulación personalizada para tu perfil";
        }
    })
    .catch(error => {
        alert("Error al enviar. Intenta de nuevo.");
        boton.disabled = false;
        boton.innerText = "Ver mi simulación ahora";
    });
});

// 6. ENVÍO AJAX - BOLETÍN (Footer)
const formBoletin = document.getElementById('form-boletin');
if (formBoletin) {
    formBoletin.addEventListener('submit', function(e) {
        e.preventDefault();
        const formulario = e.target;
        fetch(formulario.action, {
            method: "POST",
            body: new FormData(formulario),
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                formulario.innerHTML = "<p class='mensaje-exito-boletin'>¡Gracias por suscribirte!</p>";
            }
        });
    });
}