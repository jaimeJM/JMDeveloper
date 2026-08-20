/*====================================================
        PASO 0
        CARGAR CONFIGURACIÓN
====================================================*/

let configuracion = {};

async function cargarConfiguracion() {

    try {

        const respuesta = await fetch("/config", {
            cache: "no-store"
        });

        if(!respuesta.ok){

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }

        configuracion = await respuesta.json();

    } catch (error) {

        console.error(
            "Error cargando configuración:",
            error
        );

        configuracion = {};

    }

}



/*====================================================
        PASO 1
        RESTAURAR TEMA
====================================================*/

function restaurarTema() {

    if (configuracion.theme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }

}


/*====================================================
                PASO 2
            RESTAURAR LOGO
====================================================*/

function restaurarLogo() {

    // Si existe un logo guardado
    if (configuracion.logo) {

        logo.src = configuracion.logo;
        favicon.href = configuracion.logo;

    }

    // Restaurar tamaño del logo
    actualizarTamanoLogo(
        configuracion.logoSize || 150
    );

}



/*====================================================
    CONVERTIR RGB A HEX
====================================================*/

function convertirRgbAHex(color){

    if(!color) return "#000000";

    // Si ya viene en HEX
    if(color.startsWith("#")){
        return color;
    }

    const valores = color.match(/\d+/g);

    if(!valores || valores.length < 3){
        return "#000000";
    }

    const r = parseInt(valores[0]).toString(16).padStart(2,"0");
    const g = parseInt(valores[1]).toString(16).padStart(2,"0");
    const b = parseInt(valores[2]).toString(16).padStart(2,"0");

    return `#${r}${g}${b}`;

}


/*==================================================
        TAMAÑOS DEL LOGO
==================================================*/

function actualizarTamanoLogo(valor){

    // Cambia el tamaño del logo
    logo.style.width = valor + "px";
    logo.style.height = valor + "px";

    // Cambia el tamaño del aro de colores
    const box1 = document.getElementById("box1");

    if(box1){

        box1.style.setProperty(
            "--logo-size",
            valor + "px"
        );

    }

    // Actualiza el slider
    logoSize.value = valor;

    logoSizeValue.innerHTML = valor + " px";

}

/*====================================================
            CONVERSIÓN DE COLORES
====================================================*/

/**
 * Convierte un color HEX (#RRGGBB) a RGB
 * Ejemplo:
 * #00D2FF -> rgb(0, 210, 255)
 */
function hexToRgb(hex){

    hex = hex.replace("#","");

    if(hex.length !== 6){

        return "";

    }

    const r = parseInt(hex.substring(0,2),16);
    const g = parseInt(hex.substring(2,4),16);
    const b = parseInt(hex.substring(4,6),16);

    return `rgb(${r}, ${g}, ${b})`;

}

/**
 * Convierte un RGB a HEX
 * Ejemplo:
 * rgb(0,210,255) -> #00D2FF
 */
function rgbToHex(rgb){

    const numeros = rgb.match(/\d+/g);

    if(!numeros || numeros.length < 3){

        return null;

    }

    const r = Number(numeros[0]);
    const g = Number(numeros[1]);
    const b = Number(numeros[2]);

    return "#" +

    [r,g,b]

    .map(valor=>{

        const hex = valor.toString(16);

        return hex.length===1

            ? "0"+hex

            : hex;

    })

    .join("")

    .toUpperCase();

}

/*====================================================
        CONVERTIR HEX A OBJETO RGB
====================================================*/

function hexToRgbObject(hex){

    const rgb = hexToRgb(hex);

    const numeros = rgb.match(/\d+/g);

    return {

        r: Number(numeros[0]),

        g: Number(numeros[1]),

        b: Number(numeros[2])

    };

}

/*====================================================
        ACTUALIZAR TEXTO DEL COLOR
====================================================*/


function actualizarTextoColor(

    picker,
    texto,
    formato,
    alpha = null,
    preview = null

){

    const rgb = hexToRgbObject(

        picker.value

    );

    let transparencia = 1;

    if(alpha){

        transparencia =

            alpha.value / 100;

    }

    if(formato.value==="hex"){

        texto.value =

            picker.value.toUpperCase();

    }

    else if(transparencia===1){

        texto.value =

            `rgb( ${rgb.r}, ${rgb.g}, ${rgb.b})`;

    }

    else{

        texto.value =

            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${transparencia.toFixed(2)})`;

    }

    if(preview){

        preview.style.background =

            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${transparencia})`;

    }

}





/*====================================================
        EDITOR DE COLOR REUTILIZABLE
====================================================*/

function crearEditorColor(
    picker,
    texto,
    formato,
    alCambiar = null
){

    if(!picker || !texto || !formato){

        console.warn(
            "crearEditorColor(): faltan elementos del editor."
        );

        return;

    }


    /*=========================================
        FUNCIÓN INTERNA PARA ACTUALIZAR
    =========================================*/

    function actualizar(){

        actualizarTextoColor(
            picker,
            texto,
            formato
        );

        if(typeof alCambiar === "function"){

            alCambiar(
                picker.value,
                picker
            );

        }

    }


    /*=========================================
        CAMBIAR DESDE SELECTOR
    =========================================*/

    picker.oninput = ()=>{

        actualizar();

    };


    /*=========================================
        CAMBIAR FORMATO
    =========================================*/

    formato.onchange = ()=>{

        actualizarTextoColor(
            picker,
            texto,
            formato
        );

    };


    /*=========================================
        ESCRIBIR MANUALMENTE
    =========================================*/

    texto.oninput = ()=>{

        const valor =
            texto.value.trim();


        /*==============================
                FORMATO HEX
        ==============================*/

        if(formato.value === "hex"){

            if(/^#[0-9A-F]{6}$/i.test(valor)){

                texto.style.border = "";

                picker.value =
                    valor.toUpperCase();

                if(typeof alCambiar === "function"){

                    alCambiar(
                        picker.value,
                        picker
                    );

                }

            }

            else{

                texto.style.border =
                    "2px solid red";

            }

            return;

        }


        /*==============================
                FORMATO RGB
        ==============================*/

        const hex =
            rgbToHex(valor);


        if(hex){

            texto.style.border = "";

            picker.value = hex;

            if(typeof alCambiar === "function"){

                alCambiar(
                    picker.value,
                    picker
                );

            }

        }

        else{

            texto.style.border =
                "2px solid red";

        }

    };


    /*=========================================
            APLICAR CON ENTER
    =========================================*/

    texto.addEventListener(
        "keydown",
        (e)=>{

            if(e.key === "Enter"){

                e.preventDefault();

                texto.blur();

            }

        }
    );

}


/*====================================================
        APLICAR COLORES EN TIEMPO REAL
====================================================*/

function aplicarColores(){

    configuracion.text =
        titleColor.dataset.colorFinal || titleColor.value;

    configuracion.textSecondary =
        subtitleColor.dataset.colorFinal || subtitleColor.value;

    document.documentElement.style.setProperty(

        "--text",

        configuracion.text

    );

    document.documentElement.style.setProperty(

        "--text-secondary",

        configuracion.textSecondary

    );

}

/*====================================================
                PASO 3
        RESTAURAR TÍTULO Y SUBTÍTULO
====================================================*/

function restaurarTitulo() {

    // Restaurar título de la pestaña
    document.title = configuracion.title || "";

    // Restaurar título principal
    title.childNodes[0].textContent =
        (configuracion.title || "") + " ";

    // Restaurar subtítulo
    subtitle.childNodes[0].textContent =
        (configuracion.subtitle || "") + " ";

    // Restaurar descripción en el textarea
    profileDescription.value =
        configuracion.description || "";

    // Restaurar descripción en la tarjeta
    const description = document.getElementById("description");

    if (description) {
        description.textContent =
            configuracion.description || "";
    }

/*====================================================
    RESTAURAR ESTILO DE LA DESCRIPCIÓN
====================================================*/

if (description) {

    description.style.textAlign =
        configuracion.descriptionAlign || "justify";



 if (document.body.classList.contains("dark")) {

    description.style.color = "#ffffff";

} else {

    description.style.color =
        configuracion.descriptionTextColor || "#ffffff";

}


   if (document.body.classList.contains("dark")) {

    description.style.backgroundColor = "#2b2b2b";

} else {

    description.style.backgroundColor =
        configuracion.descriptionBackgroundColor || "rgba(37,37,37,.65)";

}

    if (description.style.textAlign === "center") {

        description.style.textAlignLast = "center";

    } else {

        description.style.textAlignLast = "left";

    }

}

    // Contador
    contadorDescripcion.textContent =
        profileDescription.value.length + " / 220";

    // Restaurar fuente
    if (configuracion.titleFont) {

        title.style.fontFamily =
            configuracion.titleFont;

        subtitle.style.fontFamily =
            configuracion.titleFont;

        description.style.fontFamily =
            configuracion.titleFont;
    }

    /* Restaurar tamaño del título */
    actualizarTamanoTitulo(
        configuracion.titleSize || 48
    );

    /* Restaurar tamaño del subtítulo */
    actualizarTamanoSubtitulo(
        configuracion.subtitleSize || 24
    );

}

/*====================================================
        TAMAÑO DEL NOMBRE
=====================================================*/

function actualizarTamanoTitulo(valor){

    title.style.fontSize = valor + "px";

    if(titleSize){

        titleSize.value = valor;

    }

    if(titleSizeValue){

        titleSizeValue.innerHTML = valor + " px";

    }

}

/*====================================================
        TAMAÑO DEL SUBTÍTULO
=====================================================*/

function actualizarTamanoSubtitulo(valor){

    subtitle.style.fontSize = valor + "px";

    if(subtitleSize){

        subtitleSize.value = valor;

    }

    if(subtitleSizeValue){

        subtitleSizeValue.innerHTML = valor + " px";

    }

}



/*====================================================
        GRADIENTE DE LA TARJETA
====================================================*/

function actualizarGradienteTarjeta(){

    const color1 =
        configuracion.cardColor1 ||
        configuracion.card ||
        "#202020";

    const color2 =
        configuracion.cardColor2 ||
        "#303030";

    const color3 =
        configuracion.cardColor3 ||
        "#101010";


    /*====================================================
            GUARDAR VARIABLES CSS
    ====================================================*/

    document.documentElement.style.setProperty(
        "--card-color-1",
        color1
    );

    document.documentElement.style.setProperty(
        "--card-color-2",
        color2
    );

    document.documentElement.style.setProperty(
        "--card-color-3",
        color3
    );


    /*====================================================
            GRADIENTE COMPLETO
            SOLO SE UTILIZA SIN IMAGEN
    ====================================================*/

    const gradiente =
        `linear-gradient(
            135deg,
            ${color1} 0%,
            ${color2} 50%,
            ${color3} 100%
        )`;

    document.documentElement.style.setProperty(
        "--card-gradient",
        gradiente
    );


    /* Compatibilidad con el sistema anterior */

    document.documentElement.style.setProperty(
        "--card",
        color1
    );


    /*====================================================
            APLICAR FONDO
    ====================================================*/

    aplicarFondoTarjeta();
}


/*====================================================
        APLICAR FONDO DE LA TARJETA
====================================================*/

function aplicarFondoTarjeta(){

    const card =
        document.querySelector(".card");

    if(!card){
        return;
    }


    /*====================================================
            COLORES DEL EDITOR
    ====================================================*/

    const color1 =
        configuracion.cardColor1 ||
        configuracion.card ||
        "#202020";

    const color2 =
        configuracion.cardColor2 ||
        "#303030";

    const color3 =
        configuracion.cardColor3 ||
        "#101010";


    /*====================================================
            GRADIENTE COMPLETO
            ESTE ES EL FONDO NORMAL
    ====================================================*/

    const gradienteCompleto =
        `linear-gradient(
            135deg,
            ${color1} 0%,
            ${color2} 50%,
            ${color3} 100%
        )`;


    /*====================================================
            SIN IMAGEN
            → USAR LOS 3 COLORES
    ====================================================*/

    if(!configuracion.cardImage){

        card.style.backgroundImage =
            gradienteCompleto;

        card.style.backgroundSize =
            "cover";

        card.style.backgroundPosition =
            "center";

        card.style.backgroundRepeat =
            "no-repeat";


    /*========================================
        ACTUALIZAR COLOR DE ICONOS
    ========================================*/

            actualizarColorIconosCardStats();
        return;
    }


    /*====================================================
            CON IMAGEN
            → SOLAMENTE COLOR 1
    ====================================================*/

    const degradadoColor1 =
        `linear-gradient(
            to top,
            ${color1} 0%,
            ${color1} 20%,
            rgba(0,0,0,0) 65%,
            rgba(0,0,0,0) 100%
        )`;


    /*====================================================
            IMAGEN
    ====================================================*/

    const imagen =
        configuracion.cardImage;


    /*====================================================
            IMAGEN + DEGRADADO COLOR 1
    ====================================================*/

    card.style.backgroundImage = `
        ${degradadoColor1},
        url("${imagen}")
    `;


    card.style.backgroundSize =
        "cover, cover";

    card.style.backgroundPosition =
        "center, center";

    card.style.backgroundRepeat =
        "no-repeat, no-repeat";

/*========================================
    ACTUALIZAR COLOR DE ICONOS
========================================*/

actualizarColorIconosCardStats();
}

/*====================================================
                PASO 4
            RESTAURAR COLORES
====================================================*/


function restaurarColores(){

   /* Fondo */

if(configuracion.background){

    document.documentElement.style.setProperty(

        "--background",

        configuracion.background

    );

    fondo.dataset.colorFinal =
        configuracion.background;

    fondo.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.background
            )
        );

    actualizarColorFooter();

}


/*====================================================*
    RESTAURAR 3 COLORES DE TARJETA
====================================================*/

const color1 =
    configuracion.cardColor1 ||
    configuracion.card ||
    "#202020";

const color2 =
    configuracion.cardColor2 ||
    "#303030";

const color3 =
    configuracion.cardColor3 ||
    "#101010";


const cardColor1 =
    document.getElementById("cardColor1");

const cardColor2 =
    document.getElementById("cardColor2");

const cardColor3 =
    document.getElementById("cardColor3");


/*-----------------------------------------
    RESTAURAR COLOR 1
-----------------------------------------*/

if(cardColor1){

    cardColor1.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(color1)
        );

}


/*-----------------------------------------
    RESTAURAR COLOR 2
-----------------------------------------*/

if(cardColor2){

    cardColor2.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(color2)
        );

}


/*-----------------------------------------
    RESTAURAR COLOR 3
-----------------------------------------*/

if(cardColor3){

    cardColor3.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(color3)
        );

}


/*-----------------------------------------
    GUARDAR EN CONFIGURACIÓN TEMPORAL
-----------------------------------------*/

configuracion.cardColor1 =
    color1;

configuracion.cardColor2 =
    color2;

configuracion.cardColor3 =
    color3;


/*-----------------------------------------
    APLICAR DEGRADADO
-----------------------------------------*/

actualizarGradienteTarjeta();


/*-----------------------------------------
    RESTAURAR MARCA DE AGUA SVG
-----------------------------------------*/

aplicarMarcaAguaTarjeta();

    /* Botón */

if(configuracion.button){

    document.documentElement.style.setProperty(

        "--button",

        configuracion.button

    );

    botones.dataset.colorFinal =
        configuracion.button;

    botones.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.button
            )
        );

}

   /* Borde */

if(configuracion.border){

    document.documentElement.style.setProperty(

        "--border",

        configuracion.border

    );

    borde.dataset.colorFinal =
        configuracion.border;

    borde.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.border
            )
        );

}

 /* Sombra */

if(configuracion.shadow){

    document.documentElement.style.setProperty(

        "--shadow",

        configuracion.shadow

    );

    sombra.dataset.colorFinal =
        configuracion.shadow;

    sombra.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.shadow
            )
        );

}

    /*====================================================
        RESTAURAR COLOR DE LOS ICONOS DE LOS BOTONES
    ====================================================*/

    const colorIconosGuardado =
        configuracion.iconColor ||
        "#ffffff";

    document.documentElement.style.setProperty(
        "--link-icon-color",
        colorIconosGuardado
    );

    const inputColorIconos =
        document.getElementById("iconColor");

    if(inputColorIconos){

        inputColorIconos.dataset.colorFinal =
            colorIconosGuardado;

        inputColorIconos.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(
                    colorIconosGuardado
                )
            );

    }


    /* Color del título */

if(configuracion.text){

    document.documentElement.style.setProperty(

        "--text",

        configuracion.text

    );

    titleColor.dataset.colorFinal =
        configuracion.text;

    titleColor.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.text
            )
        );

}

    /* Color del subtítulo */

if(configuracion.textSecondary){

    document.documentElement.style.setProperty(

        "--text-secondary",

        configuracion.textSecondary

    );

    subtitleColor.dataset.colorFinal =
        configuracion.textSecondary;

    subtitleColor.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.textSecondary
            )
        );

}
    /* Gradiente del logo */

if (configuracion.logoGradient && Array.isArray(configuracion.logoGradient)) {

    const posiciones = [
        "0%","3%","7%","17%",
        "20%","25%","27%","30%",
        "33%","45%","49%","68%",
        "72%","79%","82%","87%",
        "90%","100%"
    ];

    const gradient =
        "linear-gradient(to right in oklch," +
        configuracion.logoGradient
            .map((color, i) => `${color} ${posiciones[i]}`)
            .join(",") +
        ")";

    document.documentElement.style.setProperty(
        "--logo-gradient",
        gradient
    );

}

}


/*====================================================
        EDITOR UNIVERSAL DE COLOR
====================================================*/

const colorPickerModal =
    document.getElementById("colorPickerModal");
const pickerColor =
    document.getElementById("pickerColor");


/*====================================================
        TAMAÑO DEL SELECTOR UNIVERSAL
====================================================*/

if(pickerColor){

    pickerColor.style.width =
        "100%";

    pickerColor.style.height =
        "80px";

    pickerColor.style.minHeight =
        "80px";

    pickerColor.style.display =
        "block";

    pickerColor.style.padding =
        "0";

    pickerColor.style.margin =
        "0";

    pickerColor.style.cursor =
        "pointer";

    pickerColor.style.border =
        "2px solid rgba(255,255,255,.25)";

    pickerColor.style.borderRadius =
        "14px";

    pickerColor.style.boxSizing =
        "border-box";

}


/*====================================================
        CREAR RANGE HUE
====================================================*/

const hueColor =
    document.createElement("input");

hueColor.type =
    "range";

hueColor.id =
    "hueColor";

hueColor.min =
    "0";

hueColor.max =
    "360";

hueColor.step =
    "1";

hueColor.value =
    "0";


/*====================================================
        DISEÑO RANGE
====================================================*/

hueColor.style.width =
    "100%";

hueColor.style.height =
    "18px";

hueColor.style.marginTop =
    "12px";

hueColor.style.marginBottom =
    "18px";

hueColor.style.cursor =
    "pointer";

hueColor.style.appearance =
    "none";

hueColor.style.webkitAppearance =
    "none";

hueColor.style.background =
    "linear-gradient(to right," +
    "#ff0000 0%," +
    "#ffff00 17%," +
    "#00ff00 33%," +
    "#00ffff 50%," +
    "#0000ff 67%," +
    "#ff00ff 83%," +
    "#ff0000 100%)";

hueColor.style.border =
    "none";

hueColor.style.borderRadius =
    "10px";

hueColor.style.outline =
    "none";


/*====================================================
        COLOCAR DEBAJO DEL SELECTOR
====================================================*/

const colorWorkspace =
    document.querySelector(
        "#colorPickerModal .universal-color-workspace"
    );

if(colorWorkspace){

    colorWorkspace.insertAdjacentElement(
        "afterend",
        hueColor
    );

}

const hexColor =
    document.getElementById("hexColor");

const rgbColor =
    document.getElementById("rgbColor");

const alphaColor =
    document.getElementById("alphaColor");

const alphaValue =
    document.getElementById("alphaValue");

const previewColor = document.getElementById("previewColor");


    const saveUniversalColor =
    document.getElementById("saveUniversalColor");

const cancelUniversalColor =
    document.getElementById("cancelUniversalColor");

    if(cancelUniversalColor){

    cancelUniversalColor.onclick = (e)=>{

        e.preventDefault();

        cerrarEditorUniversal();

    };

}

    /*====================================================
        BOTÓN RESTABLECER
====================================================*/

const resetUniversalColor =
    document.createElement("button");

resetUniversalColor.type =
    "button";

resetUniversalColor.id =
    "resetUniversalColor";

resetUniversalColor.innerHTML =
    "↺";


resetUniversalColor.onclick = ()=>{

    pickerColor.value =
        editorColorActivo.colorOriginal;


    alphaColor.value =
        editorColorActivo.alphaOriginal;


    actualizarVistaPrevia();

};


const contenedorBotonesColor =
    saveUniversalColor.parentElement;

if(contenedorBotonesColor){

    contenedorBotonesColor.insertBefore(

        resetUniversalColor,

        saveUniversalColor

    );

}

/*====================================================
        HISTORIAL DE COLORES
====================================================*/

const HISTORIAL_COLORES =
    "editorUniversalHistorial";


function obtenerHistorialColores(){

    try{

        const historial =
            JSON.parse(
                localStorage.getItem(
                    HISTORIAL_COLORES
                )
            ) || [];

        const recientes =
            Array.isArray(historial)
                ? historial.slice(0, 6)
                : [];

        // Migrar automáticamente historiales antiguos de 10 colores a 6.
        if(recientes.length !== historial.length){
            localStorage.setItem(
                HISTORIAL_COLORES,
                JSON.stringify(recientes)
            );
        }

        return recientes;

    }catch(error){

        return [];

    }

}


function guardarColorEnHistorial(color){

    let historial =
        obtenerHistorialColores();


    historial =
        historial.filter(
            item => item !== color
        );


    historial.unshift(color);


    historial =
        historial.slice(0,6);


    localStorage.setItem(

        HISTORIAL_COLORES,

        JSON.stringify(historial)

    );


    mostrarHistorialColores();

}


function mostrarHistorialColores(){

    const contenedor =
        document.getElementById(
            "universalColorHistory"
        );


    if(!contenedor){

        return;

    }


    contenedor.innerHTML = "";


    const historial =
        obtenerHistorialColores();


    historial.forEach(color => {

        const boton =
            document.createElement("button");


        boton.type =
            "button";


        boton.title =
            color;


        boton.style.width =
            "32px";


        boton.style.height =
            "32px";


        boton.style.borderRadius =
            "50%";


        boton.style.border =
            "2px solid rgba(255,255,255,.4)";


        boton.style.background =
            color;


        boton.style.cursor =
            "pointer";


        boton.onclick = ()=>{

            const rgb =
                obtenerRGBDesdeColor(
                    color
                );


            pickerColor.value =
                rgbObjetoAHex(rgb);


/*=========================================
        CONFIGURAR HUE
=========================================*/

if(hueColor){

    const hsl =
        rgbToHsl(

            rgb.r,

            rgb.g,

            rgb.b

        );


    hueColor.value =
        Math.round(
            hsl.h
        );

}


            alphaColor.value =
                Math.round(
                    obtenerAlphaDesdeColor(color)
                    * 100
                );


            actualizarVistaPrevia();

        };


        contenedor.appendChild(
            boton
        );

    });

}

/*====================================================
        CONTENEDOR HISTORIAL
====================================================*/




mostrarHistorialColores();

const resetRecentUniversalColors =
    document.getElementById("resetRecentUniversalColors");

if(resetRecentUniversalColors){
    resetRecentUniversalColors.onclick = (e) => {

        e.preventDefault();
        e.stopPropagation();

        /*
            Restaurar recientes ahora limpia el historial antiguo
            y conserva únicamente el color actualmente seleccionado.
            El historial normal nunca supera los 6 colores.
        */
        const colorActual =
            typeof obtenerColorFinal === "function"
                ? obtenerColorFinal()
                : (pickerColor?.value || "#000000");

        localStorage.setItem(
            HISTORIAL_COLORES,
            JSON.stringify([colorActual])
        );

        mostrarHistorialColores();

        mostrarNotificacionGuardado(
            "Colores recientes",
            "Se limpiaron los colores anteriores y se conservó el color actual."
        );

    };
}


const closeUniversalColor =
    document.getElementById("closeUniversalColor");

if (closeUniversalColor) {

    closeUniversalColor.onclick = (e)=>{

        e.preventDefault();
        e.stopPropagation();

        cerrarEditorUniversal();

    };

}

/*====================================================
        ACTUALIZAR VISTA PREVIA
====================================================*/

function actualizarVistaPrevia(){

    if(!previewColor || !pickerColor){

        return;

    }


    const rgb =
        hexToRgbObject(
            pickerColor.value
        );


    const alpha =
        limitarAlpha(
            alphaColor.value
        ) / 100;


    /*=========================================
        COLOR
    =========================================*/

    previewColor.style.backgroundColor =

        `rgba(
            ${rgb.r},
            ${rgb.g},
            ${rgb.b},
            ${alpha}
        )`;


    /*=========================================
        TAMAÑO
    =========================================*/

    previewColor.style.width =
        "100%";

    previewColor.style.height =
        "90px";

    previewColor.style.minHeight =
        "90px";


    /*=========================================
        DISEÑO
    =========================================*/

    previewColor.style.display =
        "block";

    previewColor.style.borderRadius =
        "14px";

    previewColor.style.border =
        "2px solid rgba(255,255,255,.25)";

    previewColor.style.boxSizing =
        "border-box";


    /*=========================================
        ALPHA
    =========================================*/

    alphaValue.textContent =
        alphaColor.value + "%";

}

/*====================================================
        FUNCIONES DEL EDITOR UNIVERSAL
====================================================*/

function limitarAlpha(valor){

    valor = Number(valor);

    if(isNaN(valor)) return 100;

    return Math.min(100, Math.max(0, valor));

}

/*====================================================
        OBTENER RGB DESDE COLOR
====================================================*/

function obtenerRGBDesdeColor(color){

    if(!color){

        return {
            r: 0,
            g: 0,
            b: 0
        };

    }


    color =
        String(color).trim();



    /*=========================================
        HEX #RRGGBB
    =========================================*/

    if(
        /^#[0-9A-F]{6}$/i.test(color)
    ){

        return {

            r: parseInt(
                color.substring(1,3),
                16
            ),

            g: parseInt(
                color.substring(3,5),
                16
            ),

            b: parseInt(
                color.substring(5,7),
                16
            )

        };

    }


    /*=========================================
        HEX #RGB
    =========================================*/

    if(
        /^#[0-9A-F]{3}$/i.test(color)
    ){

        return {

            r: parseInt(
                color[1] + color[1],
                16
            ),

            g: parseInt(
                color[2] + color[2],
                16
            ),

            b: parseInt(
                color[3] + color[3],
                16
            )

        };

    }


    /*=========================================
        RGB / RGBA
    =========================================*/

    const match =
        color.match(
            /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
        );


    if(match){

        return {

            r: Number(match[1]),

            g: Number(match[2]),

            b: Number(match[3])

        };

    }


    /*=========================================
        COLOR NO RECONOCIDO
    =========================================*/

    return {

        r: 0,

        g: 0,

        b: 0

    };

}

/*====================================================
        RGB → HSL
====================================================*/

function rgbToHsl(r, g, b){

    r /= 255;
    g /= 255;
    b /= 255;

    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);

    let h = 0;

    let s = 0;

    const l =
        (max + min) / 2;


    if(max !== min){

        const d =
            max - min;


        s =
            l > 0.5
                ? d / (2 - max - min)
                : d / (max + min);


        switch(max){

            case r:

                h =
                    (g - b) / d +
                    (g < b ? 6 : 0);

                break;


            case g:

                h =
                    (b - r) / d + 2;

                break;


            case b:

                h =
                    (r - g) / d + 4;

                break;

        }


        h /= 6;

    }


    return {

        h: h * 360,

        s: s * 100,

        l: l * 100

    };

}

/*====================================================
        HSL → RGB
====================================================*/

function hslToRgb(h, s, l){

    h /= 360;

    s /= 100;

    l /= 100;


    let r;

    let g;

    let b;


    if(s === 0){

        r = l;
        g = l;
        b = l;

    }else{

        const hue2rgb =
            (p, q, t)=>{

                if(t < 0) t += 1;

                if(t > 1) t -= 1;

                if(t < 1 / 6){

                    return p +
                        (q - p) *
                        6 *
                        t;

                }

                if(t < 1 / 2){

                    return q;

                }

                if(t < 2 / 3){

                    return p +
                        (q - p) *
                        (2 / 3 - t) *
                        6;

                }

                return p;

            };


        const q =
            l < 0.5

                ? l * (1 + s)

                : l + s - l * s;


        const p =
            2 * l - q;


        r =
            hue2rgb(
                p,
                q,
                h + 1 / 3
            );


        g =
            hue2rgb(
                p,
                q,
                h
            );


        b =
            hue2rgb(
                p,
                q,
                h - 1 / 3
            );

    }


    return {

        r: Math.round(r * 255),

        g: Math.round(g * 255),

        b: Math.round(b * 255)

    };

}



/*====================================================
        CAMBIAR COLOR CON RANGE HUE
====================================================*/

hueColor.oninput = ()=>{



    /*-----------------------------------------
        COLOR ACTUAL
    -----------------------------------------*/

const rgbActual =
    hexToRgbObject(
        pickerColor.value
    );

    /*-----------------------------------------
        CONVERTIR RGB → HSL
    -----------------------------------------*/

    const hslActual =
        rgbToHsl(

            rgbActual.r,

            rgbActual.g,

            rgbActual.b

        );


    /*-----------------------------------------
        CAMBIAR SOLO EL TONO
    -----------------------------------------*/

    const nuevoRGB =
        hslToRgb(

            Number(
                hueColor.value
            ),

            hslActual.s,

            hslActual.l

        );


    /*-----------------------------------------
        RGB → HEX
    -----------------------------------------*/

    const nuevoHEX =
        rgbObjetoAHex(
            nuevoRGB
        );


    /*-----------------------------------------
        ACTUALIZAR SELECTOR
    -----------------------------------------*/

    pickerColor.value =
        nuevoHEX;


    /*-----------------------------------------
        ACTUALIZAR HEX
    -----------------------------------------*/

    hexColor.value =
        nuevoHEX;


    /*-----------------------------------------
        ACTUALIZAR RGB
    -----------------------------------------*/

    rgbColor.value =
        `rgb( ${nuevoRGB.r}, ${nuevoRGB.g}, ${nuevoRGB.b})`;


    /*-----------------------------------------
        ACTUALIZAR VISTA PREVIA
    -----------------------------------------*/

    actualizarVistaPrevia();

};

function obtenerAlphaDesdeColor(color){

    if(!color) return 1;

    const match =
        color.match(
            /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*([0-9.]+))?\s*\)/i
        );

    if(!match || match[1] === undefined){

        return 1;

    }

    return Math.min(
        1,
        Math.max(
            0,
            Number(match[1])
        )
    );

}


function rgbObjetoAHex(rgb){

    return "#" +

        [rgb.r, rgb.g, rgb.b]

        .map(valor => {

            return Number(valor)
                .toString(16)
                .padStart(2,"0");

        })

        .join("")
        .toUpperCase();

}


function obtenerColorFinal(){

    const rgb =
        obtenerRGBDesdeColor(
            pickerColor.value
        );

    const alpha =
        limitarAlpha(
            alphaColor.value
        ) / 100;


    if(alpha >= 1){

        return rgbObjetoAHex(rgb);

    }


    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;

}
/*====================================================
        CONTEXTO DEL EDITOR UNIVERSAL
====================================================*/

/**
 * Guarda la información del elemento que
 * actualmente está siendo editado.
 */
const editorColorActivo = {

    picker: null,

    texto: null,

    formato: null,

    propiedad: null,

    variableCSS: null,

    despuesDeAplicar: null,

    colorOriginal: "#000000",

    alphaOriginal: 100,

    

};






/*====================================================
        ABRIR EDITOR UNIVERSAL
====================================================*/

function abrirEditorColor({

    picker,

    texto = null,

    formato = null,

    propiedad = null,

    variableCSS = null,

    despuesDeAplicar = null

}){

    /*----------------------------------
        Guardar contexto
    ----------------------------------*/

    editorColorActivo.picker = picker;

    editorColorActivo.texto = texto;

    editorColorActivo.formato = formato;

    editorColorActivo.propiedad = propiedad;

    editorColorActivo.variableCSS = variableCSS;

    editorColorActivo.despuesDeAplicar = despuesDeAplicar;


    /*----------------------------------
        Compatibilidad
    ----------------------------------*/

    


    /*----------------------------------
        Inicializar modal
    ----------------------------------*/



const colorInicial =
    picker.dataset.colorFinal ||
    picker.value ||
    "#000000";


/*=========================================
        OBTENER RGB
=========================================*/

const rgb =
    obtenerRGBDesdeColor(
        colorInicial
    );


/*=========================================
        OBTENER ALPHA
=========================================*/

const alphaOriginal =
    obtenerAlphaDesdeColor(
        colorInicial
    );


/*=========================================
        GUARDAR COLOR ORIGINAL
=========================================*/

editorColorActivo.colorOriginal =
    rgbObjetoAHex(rgb);

editorColorActivo.alphaOriginal =
    Math.round(alphaOriginal * 100);


/*=========================================
        CONFIGURAR PICKER
=========================================*/

pickerColor.value =
    rgbObjetoAHex(rgb);


    /*=========================================
        CONFIGURAR RANGE HUE
=========================================*/

if(hueColor){

    const hsl =
        rgbToHsl(

            rgb.r,

            rgb.g,

            rgb.b

        );


    hueColor.value =
        Math.round(
            hsl.h
        );

}


/*=========================================
        CONFIGURAR ALPHA
=========================================*/

alphaColor.value =
    editorColorActivo.alphaOriginal;


/*=========================================
        CONFIGURAR HEX
=========================================*/

hexColor.value =
    rgbObjetoAHex(rgb);


/*=========================================
        CONFIGURAR RGB
=========================================*/

rgbColor.value =
    `rgb( ${rgb.r}, ${rgb.g}, ${rgb.b})`;


/*=========================================
        ACTUALIZAR VISTA
=========================================*/

actualizarVistaPrevia();

/*=========================================
    SINCRONIZAR CONTROLES
=========================================*/

pickerColor.dispatchEvent(
    new Event("input")
);

hueColor.dispatchEvent(
    new Event("input")
);


/*=========================================
        ABRIR MODAL
=========================================*/

colorPickerModal.style.display =
    "flex";
}


/*====================================================
        VINCULAR BOTÓN DE COLOR
====================================================*/

function vincularEditorUniversal({

    boton,
    picker,
    texto = null,
    formato = null,
    propiedad,
    variableCSS,
    despuesDeAplicar = null

}){

    if(!boton) return;

    boton.addEventListener("click", function(e){

        e.preventDefault();
        e.stopPropagation();

  

        abrirEditorColor({

            picker,
            texto,
            formato,
            propiedad,
            variableCSS,
            despuesDeAplicar

        });

    }, true);

}


/*====================================================
        INICIALIZADOR UNIVERSAL DE COLORES
====================================================*/

function crearEditorColorUniversal(

    picker,

    texto,

    formato,

    propiedadConfiguracion,

    variableCSS,

    despuesDeAplicar = null

){

if(texto && formato){

    crearEditorColor(

        picker,

        texto,

        formato,

        (valor)=>{

            configuracion[propiedadConfiguracion] = valor;

            if(variableCSS){

                document.documentElement.style.setProperty(
                    variableCSS,
                    valor
                );

            }

            if(typeof despuesDeAplicar === "function"){

                despuesDeAplicar(valor);

            }

        }

    );

}

    vincularEditorUniversal({

        boton: picker,

        picker,

        texto,

        formato,

        propiedad: propiedadConfiguracion,

        variableCSS,

        despuesDeAplicar

    });

}

function crearEditorGradienteLogo(){

    const contenedor=document.getElementById("logoGradientEditor");

    if(!contenedor) return;

    contenedor.innerHTML="";

    const colores=configuracion.logoGradient || [

        "#f63b35",
        "#f63b35",
        "#1265f0",
        "#477dff",
        "#2caf4f",
        "#72bb44",
        "#ffe523",
        "#ffcc25",
        "#ea4335",
        "#ea4335",
        "#1265f0",
        "#477dff",
        "#34a853",
        "#2caf4f",
        "#ffe523",
        "#ffcc25",
        "#f63b35",
        "#f63b35"

    ];

    colores.forEach((color,i)=>{

        const item=document.createElement("label");

        item.className="logoColor";

        item.style.background=color;

        item.innerHTML=`

            <input
                type="color"
                value="${color}"
                data-index="${i}">

        `;

const input = item.querySelector("input");

/*=========================================
    CAMBIAR COLOR
=========================================*/

input.addEventListener("input",()=>{

    item.style.background = input.value;

    configuracion.logoGradient[i] = input.value;

    actualizarGradienteLogo();

});


/*=========================================
    ABRIR EDITOR UNIVERSAL
=========================================*/

input.addEventListener("click",(e)=>{

    e.preventDefault();

    abrirEditorColor({

        picker: input,

        despuesDeAplicar:(valor)=>{

            // Actualizar el color del cuadrito
            item.style.background = valor;

            // Actualizar el input
            input.value = valor;

            // Actualizar la configuración
            configuracion.logoGradient[i] = valor;

            // Redibujar el anillo
            actualizarGradienteLogo();

        }

    });

});

contenedor.appendChild(item);

});


}


/*====================================================
        CERRAR EDITOR UNIVERSAL
====================================================*/

function cerrarEditorUniversal(){

    editorColorActivo.picker = null;

    editorColorActivo.texto = null;

    editorColorActivo.formato = null;

    editorColorActivo.propiedad = null;

    editorColorActivo.variableCSS = null;

    editorColorActivo.despuesDeAplicar = null;

    editorColorActivo.colorOriginal =
        "#000000";

    editorColorActivo.alphaOriginal =
        100;


    colorPickerModal.style.display =
        "none";

}


/*====================================================*
* BOTÓN APLICAR
*====================================================*/

saveUniversalColor.onclick = () => {


    /*=========================================
        COMPROBAR EDITOR ACTIVO
    =========================================*/

    if(!editorColorActivo.picker){

        return;

    }


    /*=========================================
        OBTENER COLOR FINAL
    =========================================*/

    const colorFinal =
        obtenerColorFinal();


    editorColorActivo.colorFinal =
        colorFinal;


    /*=========================================
        OBTENER RGB PARA EL PICKER
    =========================================*/

    const rgb =
        obtenerRGBDesdeColor(
            colorFinal
        );


    const hex =
        rgbObjetoAHex(rgb);


    /*=========================================
        ACTUALIZAR PICKER ORIGINAL
    =========================================*/

    editorColorActivo.picker.value =
        hex;


    /*=========================================
        GUARDAR COLOR COMPLETO
        HEX / RGB / RGBA
    =========================================*/

    editorColorActivo.picker.dataset.colorFinal =
        colorFinal;


    /*=========================================
        APLICAR VARIABLE CSS
    =========================================*/

    if(
        editorColorActivo.variableCSS
    ){

        document.documentElement.style.setProperty(

            editorColorActivo.variableCSS,

            colorFinal

        );

    }


    /*=========================================
        ACTUALIZAR CONFIGURACIÓN TEMPORAL
    =========================================*/

    if(
        editorColorActivo.propiedad
    ){

        configuracion[
            editorColorActivo.propiedad
        ] = colorFinal;

    }


    /*=========================================
        ACTUALIZAR TEXTO EXTERNO
    =========================================*/

    if(
        editorColorActivo.texto
    ){

        editorColorActivo.texto.value =
            colorFinal;

    }


    /*=========================================
        EJECUTAR ACCIONES ADICIONALES
    =========================================*/

    if(

        typeof
        editorColorActivo.despuesDeAplicar
        === "function"

    ){

        editorColorActivo.despuesDeAplicar(

            colorFinal

        );

    }


    /*=========================================
        HISTORIAL
    =========================================*/

    guardarColorEnHistorial(
        colorFinal
    );


    /*=========================================
        IMPORTANTE
        NO GUARDAR EN SERVIDOR AQUÍ
    =========================================*/

    /*
        El color solamente se aplica
        temporalmente.

        El modal principal será quien
        haga el guardado definitivo.
    */


    /*=========================================
        CERRAR EDITOR UNIVERSAL
    =========================================*/

    cerrarEditorUniversal();

};


/*====================================================
        ACTUALIZAR VISTA PREVIA
====================================================*/

pickerColor.oninput = ()=>{

    /*=========================================
        OBTENER RGB ACTUAL
    =========================================*/

    const rgb =
        obtenerRGBDesdeColor(
            pickerColor.value
        );


    /*=========================================
        ACTUALIZAR HEX
    =========================================*/

    hexColor.value =
        rgbObjetoAHex(rgb);


    /*=========================================
        ACTUALIZAR RGB
    =========================================*/

    rgbColor.value =
        `rgb( ${rgb.r}, ${rgb.g}, ${rgb.b})`;


    /*=========================================
        SINCRONIZAR RANGE HUE
    =========================================*/

    if(hueColor){

        const hsl =
            rgbToHsl(

                rgb.r,

                rgb.g,

                rgb.b

            );


        hueColor.value =
            Math.round(
                hsl.h
            );

    }


    /*=========================================
        ACTUALIZAR VISTA PREVIA
    =========================================*/

    actualizarVistaPrevia();

};


/*====================================================
        CAMBIAR COLOR DESDE HEX
====================================================*/

hexColor.oninput = ()=>{

    const valor =
        hexColor.value.trim();


    if(
        !/^#[0-9A-F]{6}$/i.test(valor)
    ){

        hexColor.style.border =
            "2px solid red";

        return;

    }


    hexColor.style.border = "";


    pickerColor.value =
        valor.toUpperCase();


    actualizarVistaPrevia();

};

/*====================================================
        CAMBIAR COLOR DESDE RGB
====================================================*/

rgbColor.oninput = ()=>{

    const valor =
        rgbColor.value.trim();


    const rgb =
        obtenerRGBDesdeColor(
            valor
        );


    if(
        !/^rgba?\(/i.test(valor) ||
        rgb.r > 255 ||
        rgb.g > 255 ||
        rgb.b > 255
    ){

        rgbColor.style.border =
            "2px solid red";

        return;

    }


    rgbColor.style.border = "";


    const hex =
        rgbObjetoAHex(rgb);


    pickerColor.value =
        hex;


    /*=========================================
        SI ES RGBA, EXTRAER ALPHA
    =========================================*/

    const alpha =
        obtenerAlphaDesdeColor(
            valor
        );


    if(
        /^rgba\(/i.test(valor)
    ){

        alphaColor.value =
            Math.round(alpha * 100);

    }


    actualizarVistaPrevia();

};


/*====================================================
        CAMBIAR TRANSPARENCIA
====================================================*/

alphaColor.oninput = ()=>{

    alphaColor.value =
        limitarAlpha(
            alphaColor.value
        );


    actualizarVistaPrevia();

};


function actualizarGradienteLogo(){

    const posiciones=[

        "0%",
        "3%",
        "7%",
        "17%",
        "20%",
        "25%",
        "27%",
        "30%",
        "33%",
        "45%",
        "49%",
        "68%",
        "72%",
        "79%",
        "82%",
        "87%",
        "90%",
        "100%"

    ];

    const gradient="linear-gradient(to right in oklch,"+

        configuracion.logoGradient
        .map((c,i)=>`${c} ${posiciones[i]}`)
        .join(",")

        +")";

    document.documentElement.style.setProperty(

        "--logo-gradient",

        gradient

    );

}




/*====================================================
                PASO 5
            RESTAURAR FUENTE
====================================================*/
function restaurarFuente(){

    const fuente =
        configuracion.font ||
        "'Segoe UI',sans-serif";

    document.querySelectorAll(".link-card").forEach(card=>{

        card.style.fontFamily = fuente;

    });

    if (fuentes) {

        const existe = [...fuentes.options].some(
            op => op.value === fuente
        );

        if (existe) {

            fuentes.value = fuente;

        }

    }

}

/*====================================================
                PASO 6
        RESTAURAR BORDER RADIUS
====================================================*/

function restaurarRadius() {

    const valor = Number(
        configuracion.radius ?? 50
    );

    if (typeof radius !== "undefined" && radius) {
        radius.value = valor;
    }

    document.querySelectorAll(
        "#linksContainer .link-main"
    ).forEach(main => {
        main.style.setProperty(
            "border-radius",
            valor + "px",
            "important"
        );
    });

    document.documentElement.style.setProperty(
        "--button-radius",
        valor + "px"
    );
}




/*====================================================
                PASO 7
    RESTAURAR VELOCIDAD DE ANIMACIONES
====================================================*/

function restaurarVelocidadAnimaciones() {

    const velocidad =
        configuracion.animationSpeed || 0.35;

    // Restaurar Slider
    if (animationSpeed) {

        animationSpeed.value = velocidad;

    }

    // Restaurar texto
    if (animationValue) {

        animationValue.innerHTML =
            velocidad + " s";

    }

    // Restaurar Variable CSS
    document.documentElement.style.setProperty(

        "--animation-speed",

        velocidad + "s"

    );

}


/*====================================================
GUARDAR EDITOR DE COLORES GENERALES
====================================================*/


document.getElementById(
    "saveGeneralColors"
).onclick = async () => {

    try{

        /*====================================================
            GUARDAR GRADIENTE
        ====================================================*/

        configuracion.cardColor1 =
            document.getElementById(
                "cardColor1"
            ).value;


        configuracion.cardColor2 =
            document.getElementById(
                "cardColor2"
            ).value;


        configuracion.cardColor3 =
            document.getElementById(
                "cardColor3"
            ).value;


        configuracion.card =
            configuracion.cardColor1;


        /*====================================================
            GUARDAR ESQUINAS DE LOS BOTONES
        ====================================================*/

        if(typeof radius !== "undefined" && radius){

            configuracion.radius =
                Number(radius.value);

            document.documentElement.style.setProperty(
                "--button-radius",
                configuracion.radius + "px"
            );

            document
                .querySelectorAll("#linksContainer .link-main")
                .forEach(main => {
                    main.style.setProperty(
                        "border-radius",
                        configuracion.radius + "px",
                        "important"
                    );
                });

        }


        /*====================================================
            SUBIR IMAGEN PENDIENTE
        ====================================================*/

        if(imagenCardPendiente){

            const datos =
                new FormData();


            datos.append(
                "cardImage",
                imagenCardPendiente
            );


            const respuesta =
                await fetch(
                    "/uploadCardImage",
                    {
                        method:"POST",
                        body:datos
                    }
                );


            if(!respuesta.ok){

                throw new Error(
                    "Error HTTP al subir imagen."
                );

            }


            const resultado =
                await respuesta.json();


            if(!resultado.ok){

                throw new Error(
                    resultado.error ||
                    "No se pudo guardar la imagen."
                );

            }


            configuracion.cardImage =
                resultado.cardImage;


            imagenCardPendiente =
                null;


            if(backgroundImage){

                backgroundImage.value = "";

            }

        }


        /*====================================================
            APLICAR TODO
        ====================================================*/

        actualizarGradienteTarjeta();

        aplicarMarcaAguaTarjeta();


        /*====================================================
            GUARDAR CONFIGURACIÓN
        ====================================================*/

        await guardarConfiguracionServidor();


        /*====================================================
            ESTADO DEL MODAL
        ====================================================*/

        guardarEstadoModal(
            colorModal
        );


        mostrarNotificacionGuardado();


        colorModal.style.display =
            "none";


        modalActivo = null;

        estadoInicialModal = null;


    }catch(error){

        console.error(
            "Error al guardar los colores:",
            error
        );

        alert(
            error.message
        );

    }

};


/*====================================================
        QUITAR MARCA DE AGUA
====================================================*/

const removeCardWatermark =
    document.getElementById(
        "removeCardWatermark"
    );


if(removeCardWatermark){

    removeCardWatermark.onclick =
        async () => {


            try{

                const respuesta =
                    await fetch(
                        "/removeCardWatermark",
                        {

                            method:"POST"

                        }
                    );


                const resultado =
                    await respuesta.json();


                if(!resultado.ok){

                    alert(
                        resultado.error ||
                        "No se pudo eliminar el logo."
                    );

                    return;

                }


                configuracion.cardWatermark =
                    "";


                aplicarMarcaAguaTarjeta();


            }catch(error){

                console.error(
                    "Error eliminando logo:",
                    error
                );

            }

        };

}


/*====================================================
                PASO 8
            RESTAURAR GLASS
====================================================*/

function restaurarGlass() {

    const card = document.querySelector(".card");

    if (!card) return;

    // Limpiar estado anterior
    card.classList.remove("glass");

    // Restaurar configuración
    if (configuracion.glass === true) {

        card.classList.add("glass");

    }

}

/*====================================================
                PASO 9
        RESTAURAR NEUMORPHISM
====================================================*/

function restaurarNeumorphism() {

    const card = document.querySelector(".card");

    if (!card) return;

    // Limpiar estado anterior
    card.classList.remove("neumorphism");

    // Restaurar configuración
    if (configuracion.neumorphism === true) {

        card.classList.add("neumorphism");

    }

}







const logo = document.getElementById("logo");


/*====================================================
        VISTA PREVIA DE ARCHIVOS
====================================================*/

function activarVistaPreviaArchivo(
    inputId,
    previewId
){

    const input =
        document.getElementById(inputId);

    const preview =
        document.getElementById(previewId);

    if(!input || !preview){

        return;

    }

    input.addEventListener(
        "change",
        (e)=>{

            const archivo =
                e.target.files[0];

            if(!archivo){

                preview.src = "";

                preview.parentElement
                    .classList.remove("has-image");

                return;

            }

            if(!archivo.type.startsWith("image/")){

                return;

            }

            const lector =
                new FileReader();

            lector.onload =
                (evento)=>{

                    preview.src =
                        evento.target.result;

                    preview.parentElement
                        .classList.add(
                            "has-image"
                        );

                };

            lector.readAsDataURL(
                archivo
            );

        }
    );

}


/*====================================================
        ACTIVAR VISTAS PREVIAS
====================================================*/

activarVistaPreviaArchivo(
    "logoFile",
    "logoFilePreview"
);


activarVistaPreviaArchivo(
    "backgroundImage",
    "backgroundImagePreview"
);


activarVistaPreviaArchivo(
    "cardWatermarkLogo",
    "cardWatermarkLogoPreview"
);

/*====================================================
    RESTAURAR VISTAS PREVIAS CON LAS IMÁGENES ACTUALES
====================================================*/

function restaurarVistasPreviasActuales(){

    const logoPreview =
        document.getElementById("logoFilePreview");

    if(logoPreview){
        const logoActual =
            configuracion.logo || "";
        logoPreview.src = logoActual;
        logoPreview.style.display =
            logoActual ? "block" : "none";
    }

    const cardPreview =
        document.getElementById("backgroundImagePreview");

    if(cardPreview){
        const imagenActual =
            configuracion.cardImage || "";
        cardPreview.src = imagenActual;
        cardPreview.style.display =
            imagenActual ? "block" : "none";
    }

    const watermarkPreview =
        document.getElementById("cardWatermarkLogoPreview");

    if(watermarkPreview){
        const watermarkActual =
            configuracion.cardWatermark || "";
        watermarkPreview.src = watermarkActual;
        watermarkPreview.style.display =
            watermarkActual ? "block" : "none";
    }

}



/*====================================================
        AMPLIAR VISTA PREVIA AL HACER CLICK
====================================================*/

document.querySelectorAll(
    ".file-preview-box"
).forEach(preview => {

    preview.addEventListener(
        "click",
        () => {

            if(
                !preview.classList.contains(
                    "has-image"
                )
            ){

                return;

            }

            const imagen =
                preview.querySelector("img");

            if(imagen){
                abrirMiniaturaAmpliada(imagen);
            }

        }
    );

});





/*====================================================
        MOSTRAR NOMBRE DE LA FUENTE
====================================================*/

const fontFile =
    document.getElementById("fontFile");

const fontFileName =
    document.getElementById("fontFileName");


if(fontFile && fontFileName){

    fontFile.addEventListener(
        "change",
        (e)=>{

            const archivo =
                e.target.files[0];

            if(!archivo){

                fontFileName.textContent =
                    "Ningún archivo";

                return;

            }

            fontFileName.textContent =
                archivo.name;

        }
    );

}




/*====================================================
    EDITOR DE ESTADÍSTICAS
====================================================*/

const adminViewsCounter =
    document.getElementById(
        "adminViewsCounter"
    );

const adminLikesCounter =
    document.getElementById(
        "adminLikesCounter"
    );

const adminSharesCounter =
    document.getElementById(
        "adminSharesCounter"
    );

const saveCardStats =
    document.getElementById(
        "saveCardStats"
    );

const resetCardStats =
    document.getElementById(
        "resetCardStats"
    );


/*====================================================
    POSICIONES WEB Y CELULAR
====================================================*/

const cardStatsWebX =
    document.getElementById(
        "cardStatsWebX"
    );

const cardStatsWebY =
    document.getElementById(
        "cardStatsWebY"
    );

const cardStatsWebLock =
    document.getElementById(
        "cardStatsWebLock"
    );


const cardStatsMobileX =
    document.getElementById(
        "cardStatsMobileX"
    );

const cardStatsMobileY =
    document.getElementById(
        "cardStatsMobileY"
    );

const cardStatsMobileLock =
    document.getElementById(
        "cardStatsMobileLock"
    );



    /*====================================================
        SISTEMA DE MÚSICA
====================================================*/

const btnMusicAdmin =
    document.getElementById(
        "btnMusicAdmin"
    );


const musicModal =
    document.getElementById(
        "musicModal"
    );


const musicFile =
    document.getElementById(
        "musicFile"
    );


const musicFileName =
    document.getElementById(
        "musicFileName"
    );


const musicEnabled =
    document.getElementById(
        "musicEnabled"
    );


const saveMusic =
    document.getElementById(
        "saveMusic"
    );


const siteMusic =
    document.getElementById(
        "siteMusic"
    );


const musicSpeakers =
    document.getElementById(
        "musicSpeakers"
    );


    const musicUserButton =
    document.getElementById(
        "musicUserButton"
    );


const musicUserIcon =
    document.getElementById(
        "musicUserIcon"
    );


let musicaUsuarioPermitida =
    false;


let musicaUsuarioBloqueada =
    false;

let administradorActivo =
    false;



/*====================================================
    ABRIR MODAL
====================================================*/

if (btnMusicAdmin) {

    btnMusicAdmin.onclick =
        async () => {

            await cargarConfiguracionMusica();

            cerrarTodosLosModales();

            musicModal.style.display =
                "flex";

        };

}


/*====================================================
    MOSTRAR NOMBRE DEL ARCHIVO
====================================================*/

if (musicFile) {

    musicFile.addEventListener(
        "change",
        () => {

            if (
                musicFile.files &&
                musicFile.files.length
            ) {

                musicFileName.textContent =
                    musicFile.files[0].name;

            } else {

                musicFileName.textContent =
                    "Ningún archivo seleccionado";

            }

        }
    );

}


/*====================================================
    CARGAR CONFIGURACIÓN
====================================================*/

async function cargarConfiguracionMusica() {

    try {

        const respuesta =
            await fetch(
                "/music/config",
                {
                    cache:
                        "no-store"
                }
            );


        if (!respuesta.ok) {
            return;
        }


        const datos =
            await respuesta.json();


        musicEnabled.checked =
            datos.enabled === true;


        if (datos.url) {

            siteMusic.src =
                datos.url;

        }


    } catch(error) {

        console.error(
            "Error cargando música:",
            error
        );

    }

}


/*====================================================
    GUARDAR MÚSICA
====================================================*/

if (saveMusic) {

    saveMusic.onclick =
        async () => {

            try {

                /*=====================================
                    SUBIR MP3 SI EXISTE UNO NUEVO
                =====================================*/

                if (
                    musicFile.files &&
                    musicFile.files.length
                ) {

                    const archivo =
                        musicFile.files[0];


                    if (
                        !archivo.name
                            .toLowerCase()
                            .endsWith(".mp3")
                    ) {

                        alert(
                            "Selecciona un archivo MP3."
                        );

                        return;

                    }


                    const formulario =
                        new FormData();


                    formulario.append(
                        "music",
                        archivo
                    );


                    const respuesta =
                        await fetch(
                            "/uploadMusic",
                            {

                                method:
                                    "POST",

                                body:
                                    formulario

                            }
                        );


                    const datos =
                        await respuesta.json();


                    if (
                        !respuesta.ok ||
                        !datos.ok
                    ) {

                        throw new Error(
                            datos.error ||
                            "No se pudo subir la música."
                        );

                    }


                    siteMusic.src =
                        datos.musicUrl;

                }


                /*=====================================
                    ACTIVAR / DESACTIVAR
                =====================================*/

                const respuestaEstado =
                    await fetch(
                        "/music/toggle",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    enabled:
                                        musicEnabled.checked

                                })

                        }
                    );


                const datosEstado =
                    await respuestaEstado.json();


                if (
                    !respuestaEstado.ok ||
                    !datosEstado.ok
                ) {

                    throw new Error(
                        datosEstado.error ||
                        "No se pudo guardar el estado."
                    );

                }


                /*=====================================
                    CERRAR MODAL
                =====================================*/

                cerrarModalDefinitivamente(
                    musicModal
                );


                mostrarNotificacionGuardado(
                    "Música guardada",
                    musicEnabled.checked
                        ? "La música está activada."
                        : "La música está desactivada."
                );


                /*=====================================
                    ACTUALIZAR USUARIO
                =====================================*/

                await iniciarMusicaUsuario();


            } catch(error) {

                console.error(
                    "Error guardando música:",
                    error
                );


                alert(
                    error.message
                );

            }

        };

}

/*====================================================
    MOSTRAR PARLANTES
====================================================*/

function mostrarParlantesMusica() {

    if (!musicSpeakers) {
        return;
    }


    musicSpeakers.classList.add(
        "music-playing"
    );

}


/*====================================================
    OCULTAR PARLANTES
====================================================*/

function ocultarParlantesMusica() {

    if (!musicSpeakers) {
        return;
    }


    musicSpeakers.classList.remove(
        "music-playing"
    );

}


/*====================================================
    CONTROL DE MÚSICA DEL USUARIO
====================================================*/

function mostrarBotonMusicaUsuario(){

    if(!musicUserButton){

        return;

    }


    /*
        EL ADMINISTRADOR NUNCA DEBE
        VER EL BOTÓN DEL USUARIO.
    */

    if(administradorActivo){

        musicUserButton.style.display =
            "none";

        return;

    }


    musicUserButton.classList.add(
        "music-user-visible"
    );

    musicUserButton.style.display =
        "flex";

}


function ocultarBotonMusicaUsuario(){

    if(!musicUserButton){

        return;

    }


    musicUserButton.classList.remove(
        "music-user-visible"
    );

}


function actualizarBotonMusicaUsuario(){


    if(administradorActivo){

    if(musicUserButton){

        musicUserButton.style.display =
            "none";

    }

    return;

}

    if(
        !musicUserButton ||
        !musicUserIcon
    ){

        return;

    }


    if(
        siteMusic &&
        !siteMusic.paused
    ){

        musicUserIcon.className =
            "fa-solid fa-volume-high";


        musicUserButton.title =
            "Apagar música";


        musicUserButton.setAttribute(
            "aria-label",
            "Apagar música"
        );


        musicUserButton.classList.add(
            "music-user-playing"
        );

    }else{

        musicUserIcon.className =
            "fa-solid fa-volume-xmark";


        musicUserButton.title =
            "Escuchar música";


        musicUserButton.setAttribute(
            "aria-label",
            "Escuchar música"
        );


        musicUserButton.classList.remove(
            "music-user-playing"
        );

    }

}

/*====================================================
    CLICK DEL BOTÓN DE MÚSICA
====================================================*/

if(musicUserButton){

    musicUserButton.addEventListener(
        "click",
        async () => {

            if(!siteMusic){

                return;

            }


            /*
                SI ESTÁ REPRODUCIENDO
                → APAGAR PARA ESTE USUARIO
            */

            if(!siteMusic.paused){

                siteMusic.pause();

                actualizarBotonMusicaUsuario();

                ocultarParlantesMusica();

                return;

            }


            /*
                SI ESTÁ PAUSADA
                → REPRODUCIR
            */

            try{

                await siteMusic.play();

                actualizarBotonMusicaUsuario();

            }catch(error){

                console.error(
                    "No se pudo reproducir la música:",
                    error
                );

            }

        }
    );

}


/*====================================================
    EVENTOS DEL AUDIO
====================================================*/

if(siteMusic){

    siteMusic.addEventListener(
        "play",
        () => {

            mostrarParlantesMusica();

            actualizarBotonMusicaUsuario();

        }
    );


    siteMusic.addEventListener(
        "playing",
        () => {

            mostrarParlantesMusica();

            actualizarBotonMusicaUsuario();

        }
    );


    siteMusic.addEventListener(
        "pause",
        () => {

            ocultarParlantesMusica();

            actualizarBotonMusicaUsuario();

        }
    );


    siteMusic.addEventListener(
        "ended",
        () => {

            ocultarParlantesMusica();

            actualizarBotonMusicaUsuario();

        }
    );

}

/*====================================================
    INICIAR MÚSICA DEL USUARIO
====================================================*/

async function iniciarMusicaUsuario() {

    try {

        const respuesta =
            await fetch(
                "/music/config",
                {
                    cache:
                        "no-store"
                }
            );


        if (!respuesta.ok) {
            return;
        }


        const datos =
            await respuesta.json();



            /*
                Si el administrador está conectado,
                no mostramos el botón del usuario.
            */
            if(administradorActivo){

                ocultarBotonMusicaUsuario();

            }

        /*=====================================
            MÚSICA DESACTIVADA
        =====================================*/

                if (
                datos.enabled !== true ||
                !datos.url
            ){

                ocultarParlantesMusica();

                ocultarBotonMusicaUsuario();


                if(siteMusic){

                    siteMusic.pause();

                    siteMusic.removeAttribute(
                        "src"
                    );

                    siteMusic.load();

                }


                musicaUsuarioPermitida =
                    false;

                return;

            }


        /*=====================================
            CARGAR AUDIO
        =====================================*/

        siteMusic.src =
            datos.url;

        siteMusic.loop =
            true;


        siteMusic.volume =
            0.35;


        /*
            Intentamos reproducir.
            El navegador puede bloquear
            autoplay hasta que exista
            interacción del usuario.
        */

 try{

    /*
        El administrador dejó la música activa.

        Intentamos reproducir inmediatamente.
    */

    await siteMusic.play();


    musicaUsuarioPermitida =
        true;

    musicaUsuarioBloqueada =
        false;


if(!administradorActivo){

    mostrarBotonMusicaUsuario();

}

    actualizarBotonMusicaUsuario();


}catch(error){

    /*
        El navegador bloqueó autoplay
        con sonido.

        NO apagamos la música del servidor.

        Simplemente mostramos el botón
        para que el usuario pueda activarla.
    */

    console.log(
        "Autoplay bloqueado por el navegador."
    );


    musicaUsuarioPermitida =
        true;

    musicaUsuarioBloqueada =
        true;


if(!administradorActivo){

    mostrarBotonMusicaUsuario();

}

    actualizarBotonMusicaUsuario();

}


    } catch(error) {

        console.error(
            "Error iniciando música:",
            error
        );

    }

}




const favicon = document.getElementById("favicon");

const logoSize = document.getElementById("logoSize");

const logoSizeValue = document.getElementById("logoSizeValue");

const title = document.getElementById("title");

const subtitle = document.getElementById("subtitle");

const titleSize = document.getElementById("titleSize");

const subtitleSize = document.getElementById("subtitleSize");

const subtitleSizeValue = document.getElementById("subtitleSizeValue");

const titleSizeValue = document.getElementById("titleSizeValue");




const logoModal = document.getElementById("logoModal");

const titleModal = document.getElementById("titleModal");



const colorModal = document.getElementById("colorModal");

const btnBackground = document.getElementById("btnBackground");


const titleColor = document.getElementById("titleColor");


const subtitleColor = document.getElementById("subtitleColor");

const descriptionTextColor = document.getElementById("descriptionTextColor");

const descriptionBackgroundColor = document.getElementById("descriptionBackgroundColor");

const titleColorText = document.getElementById("titleColorText");

const subtitleColorText = document.getElementById("subtitleColorText");

const titleColorFormat = document.getElementById("titleColorFormat");

const subtitleColorFormat = document.getElementById("subtitleColorFormat");

const pageTitle = document.querySelector("title");

const iconColor = document.getElementById("iconColor");

const linkTextColor = document.getElementById("linkTextColor");








/*====================================================
        CONTROLADOR DE DESCRIPCION
====================================================*/

const profileDescription = document.getElementById("profileDescription");

const contadorDescripcion = document.getElementById("contadorDescripcion");

profileDescription.addEventListener("input",()=>{

    contadorDescripcion.textContent = `${profileDescription.value.length} / 220`;

});





/*====================================================
        TÍTULO
====================================================*/
crearEditorColorUniversal(

    titleColor,

    null,

    null,

    "text",

    "--text"

);

/*====================================================
        SUBTÍTULO
====================================================*/

crearEditorColorUniversal(

    subtitleColor,

    null,

    null,

    "textSecondary",

    "--text-secondary"

);

/*====================================================
        COLOR DE LETRA DEL BOTÓN
====================================================*/

crearEditorColorUniversal(

    linkTextColor,

    null,

    null,

    "linkTextColor",

    null,

    (valor)=>{

        if(!botonSeleccionado) return;

        const span =
            botonSeleccionado.querySelector(".center span");

        if(span){
            span.style.color = valor;
        }

        const small =
            botonSeleccionado.querySelector(".center small");

        if(small){
            small.style.color = valor;
        }

        botonSeleccionado.dataset.textColor = valor;

    }

);

/*====================================================
        DESCRIPCIÓN
====================================================*/

vincularEditorUniversal({

    boton: descriptionTextColor,

    picker: descriptionTextColor,

    propiedad: "descriptionTextColor",

    despuesDeAplicar:(valor)=>{

        document.getElementById("description").style.color = valor;

    }

});



vincularEditorUniversal({

    boton: descriptionBackgroundColor,

    picker: descriptionBackgroundColor,

    propiedad: "descriptionBackgroundColor",

    despuesDeAplicar:(valor)=>{

        document.getElementById("description").style.backgroundColor = valor;

    }

});







/*==================================================
            BOTÓN AGREGAR ENLACE
==================================================*/

// Crear botón flotante

const addButton=document.createElement("button");

addButton.id="addLink";

addButton.classList.add("admin-only");

addButton.innerHTML='<i class="fa-solid fa-plus"></i>';

document.body.appendChild(addButton);

addButton.style.cssText=`

position:fixed;

bottom:20px;

right:30px;

width:60px;

height:60px;

border:none;

border-radius:50%;

background:#ffffff;

color:#111;

font-size:24px;

cursor:pointer;

box-shadow:0 10px 30px rgba(0,0,0,.30);

z-index:999;

transition:var(--animation-speed);

`;

addButton.onmouseenter=()=>{

addButton.style.transform="scale(1.1) rotate(90deg)";

}

addButton.onmouseleave=()=>{

addButton.style.transform="scale(1)";

}


/*==================================================
        LÍMITE DE BOTONES
==================================================*/

const LIMITE_BOTONES = 10;

/*   botón flotante  */


function abrirDialogoCrearBoton(){

    const totalBotones =
        document.querySelectorAll(
            "#linksContainer .link-card"
        ).length;

    mostrarEstadoLimiteBotones(
        totalBotones,
        totalBotones < LIMITE_BOTONES
    );

}

addButton.onclick = () => {

    abrirDialogoCrearBoton();

};





const tituloRadius=document.createElement("label");

tituloRadius.innerHTML=

"<a>Esquinas de los botones</a>";

tituloRadius.style.display="block";

tituloRadius.style.marginTop="20px";

tituloRadius.style.marginBottom="8px";

document.querySelector("#colorModal .modal-content")

.appendChild(tituloRadius);


/*==================================================
        CAMBIAR RADIO BOTONES
==================================================*/

const radius=document.createElement("input");

radius.type="range";

radius.min=10;

radius.max=60;

radius.value=Number(configuracion.radius ?? 50);

radius.style.width="100%";

radius.style.marginTop="15px";

document.querySelector("#colorModal .modal-content")
.appendChild(radius);


/*==================================================
           GUARDA NUEVO RADIO
==================================================*/
radius.oninput = ()=>{

    const valor =
        Number(radius.value);

    configuracion.radius =
        valor;

    document.documentElement.style.setProperty(
        "--button-radius",
        valor + "px"
    );

    document
        .querySelectorAll("#linksContainer .link-main")
        .forEach(main => {

            main.style.setProperty(
                "border-radius",
                valor + "px",
                "important"
            );

        });

} 


/*==================================================
    FUENTE  DE LOS BOTONES 
==================================================*/

const tituloFuente=document.createElement("label");

tituloFuente.innerHTML = "Fuente de los botones";

document.querySelector("#colorModal .modal-content")
.appendChild(tituloFuente);


const fuenteTitulo = document.getElementById("titleFont");


/*==================================================
            CAMBIAR FUENTE BOTONES 
==================================================*/

const fuentes=document.createElement("select");

fuentes.innerHTML=`

<option value="'Segoe UI',sans-serif">Segoe UI</option>

<option value="'Poppins',sans-serif">Poppins</option>

<option value="'Montserrat',sans-serif">Montserrat</option>

<option value="'Nunito',sans-serif">Nunito</option>

<option value="Arial,sans-serif">Arial</option>

<option value="Verdana,sans-serif">Verdana</option>

<option value="Tahoma,sans-serif">Tahoma</option>

<option value="Georgia,serif">Georgia</option>


`;

document.querySelector("#colorModal .modal-content")
.appendChild(fuentes);










/*  FUENTES DE LOS BOTONES DE CARD  */

fuentes.onchange = () => {

    document.querySelectorAll(".link-card").forEach(card => {

        card.style.fontFamily = fuentes.value;

        const span = card.querySelector(".center span");
        if (span) {
            span.style.fontFamily = fuentes.value;
        }

        const small = card.querySelector(".center small");
        if (small) {
            small.style.fontFamily = fuentes.value;
        }
    });

    configuracion.font = fuentes.value;

   

};


/*==================================================*
*COLOCAR BOTÓN GUARDAR AL FINAL DEL MODAL*
*==================================================*/

const modalColores =
    document.querySelector(
        "#colorModal .modal-content"
    );

const botonGuardarColores =
    document.getElementById(
        "saveGeneralColors"
    );


if (
    modalColores &&
    botonGuardarColores
) {

    /*
        El contenedor actual del botón
        también se mueve al final.
    */

    const contenedorGuardar =
        botonGuardarColores.closest(
            ".buttons"
        );


    if (contenedorGuardar) {

        modalColores.appendChild(
            contenedorGuardar
        );

    } else {

        modalColores.appendChild(
            botonGuardarColores
        );

    }

}



/*==================================================
    CAMBIAR SOLO EL TÍTULO
==================================================*/

fuenteTitulo.onchange = () => {

    title.style.fontFamily =
        fuenteTitulo.value;

    subtitle.style.fontFamily =
        fuenteTitulo.value;

    configuracion.titleFont =
        fuenteTitulo.value;

};



/*==================================================
    TAMAÑO DEL LOGO
==================================================*/

logoSize.addEventListener("input", ()=>{

    configuracion.logoSize =
        Number(logoSize.value);

    actualizarTamanoLogo(
        configuracion.logoSize
    );

    document
        .getElementById("box1")
        ?.style.setProperty(
            "--logo-size",
            configuracion.logoSize + "px"
        );

});

/*================================================== 
                VELOCIDAD DE ANIMACIONES 
==================================================*/ 


const animationSpeed =
document.getElementById("animationSpeed");

const animationValue =
document.getElementById("animationValue");

animationSpeed.addEventListener("input", ()=>{

    const value = parseFloat(animationSpeed.value);

    animationValue.innerHTML =
    value + " s";

    document.documentElement.style.setProperty(

        "--animation-speed",

        value + "s"

    );

    configuracion.animationSpeed =
    value;

   




});




















/*=========================================
    CERRAR TODOS LOS MODALES
=========================================*/

function cerrarTodosLosModales() {

    document.querySelectorAll(".modal").forEach(modal => {

        modal.style.display = "none";

    });

}



/*====================================================
        SISTEMA DEFINITIVO DE CAMBIOS EN MODALES
====================================================*/

let modalActivo = null;

let estadoInicialModal = null;


/*====================================================
        OBTENER ESTADO DE LOS CONTROLES
====================================================*/

function obtenerControlesModal(modal){

    if(!modal){

        return [];

    }

    return Array.from(

        modal.querySelectorAll(
            "input, textarea, select"
        )

    ).map(control => {

        return {

            id:
                control.id || "",

            type:
                control.type || "",

            value:
                control.value || "",

            checked:
                control.checked || false,

            colorFinal:
                control.dataset.colorFinal || ""

        };

    });

}


/*====================================================
        GUARDAR ESTADO INICIAL
====================================================*/

function guardarEstadoModal(modal){

    if(!modal){

        return;

    }


    modalActivo = modal;


    estadoInicialModal = {

        configuracion:
            JSON.stringify(configuracion),

        controles:
            JSON.stringify(
                obtenerControlesModal(modal)
            ),

        botonHTML:
            null

    };


    /*-----------------------------------------
        GUARDAR HTML ORIGINAL DEL BOTÓN
    -----------------------------------------*/

    if(

        modal.id === "linkModal" &&

        botonSeleccionado

    ){

        estadoInicialModal.botonHTML =
            botonSeleccionado.outerHTML;

    }

}


/*====================================================
        COMPROBAR CAMBIOS
====================================================*/

function modalTieneCambios(){

    if(

        !modalActivo ||

        !estadoInicialModal

    ){

        return false;

    }


    const estadoActual = {

        configuracion:
            JSON.stringify(configuracion),

        controles:
            JSON.stringify(
                obtenerControlesModal(modalActivo)
            ),

        botonHTML:
            null

    };


    if(

        modalActivo.id === "linkModal" &&

        botonSeleccionado

    ){

        estadoActual.botonHTML =
            botonSeleccionado.outerHTML;

    }


    return (

        JSON.stringify(estadoActual) !==

        JSON.stringify(estadoInicialModal)

    );

}


/*====================================================
        RESTAURAR CAMBIOS
====================================================*/

function restaurarEstadoModal(){

    if(

        !modalActivo ||

        !estadoInicialModal

    ){

        return;

    }


    /*=========================================
        RESTAURAR CONFIGURACIÓN
    =========================================*/

    try{

        configuracion =
            JSON.parse(
                estadoInicialModal.configuracion
            );

    }catch(error){

        return;

    }


    /*=========================================
        RESTAURAR CONTROLES
    =========================================*/

    const controles =
        JSON.parse(
            estadoInicialModal.controles
        );


    controles.forEach(estado => {

        const control =
            document.getElementById(
                estado.id
            );


        if(!control){

            return;

        }


        if(control.type === "checkbox"){

            control.checked =
                estado.checked;

        }else{

            control.value =
                estado.value;

        }


        if(estado.colorFinal){

            control.dataset.colorFinal =
                estado.colorFinal;

        }

    });


    /*=========================================
        RESTAURAR BOTÓN
    =========================================*/

    if(

        modalActivo.id === "linkModal" &&

        estadoInicialModal.botonHTML &&

        botonSeleccionado

    ){

        const nuevoBoton =
            document.createElement("div");

        nuevoBoton.innerHTML =
            estadoInicialModal.botonHTML;

        const restaurado =
            nuevoBoton.firstElementChild;


        if(restaurado){

            botonSeleccionado.replaceWith(
                restaurado
            );

            botonSeleccionado =
                restaurado;

        }

    }


    /*=========================================
        RESTAURAR VISTA GENERAL
    =========================================*/

    restaurarTema();

    restaurarLogo();

    restaurarTitulo();

    restaurarColores();

    restaurarFuente();

    restaurarRadius();

    restaurarVelocidadAnimaciones();

    restaurarGlass();

    restaurarNeumorphism();


    /*=========================================
        RESTAURAR BOTONES
    =========================================*/

    if(

        typeof activarBotones ===
        "function"

    ){

        activarBotones();

    }


    /*=========================================
        LIMPIAR EDITOR UNIVERSAL
    =========================================*/

    cerrarEditorUniversal();

}



    /*====================================================
                    ABRIR MODALES
    ====================================================*/

    /*=========================================
                EDITAR LOGO
    =========================================*/
  document.querySelector(".edit-logo").onclick = () => {

    crearEditorGradienteLogo();

    restaurarVistasPreviasActuales();

    const logoURLInput =
        document.getElementById("logoURL");

    if(logoURLInput){
        logoURLInput.value =
            configuracion.logo || "";
    }

    cerrarTodosLosModales();

    logoModal.style.display = "flex";

    

    guardarEstadoModal(logoModal);

};


    /*=========================================
            EDITAR TÍTULO Y SUBTÍTULO
    =========================================*/
    document.querySelector(".edit-title").onclick = () => {


   
        
        /*-----------------------------------------
            RESTAURAR TEXTO
        -----------------------------------------*/

        document.getElementById("newTitle").value =
            title.childNodes[0].textContent.trim();

        document.getElementById("newSubtitle").value =
            subtitle.childNodes[0].textContent.trim();


        /*-----------------------------------------
            RESTAURAR COLOR DEL TÍTULO
        -----------------------------------------*/

        const colorTitulo =
            configuracion.text || "#ffffff";

        titleColor.dataset.colorFinal =
            colorTitulo;

        titleColor.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(
                    colorTitulo
                )
            );


        /*-----------------------------------------
            RESTAURAR COLOR DEL SUBTÍTULO
        -----------------------------------------*/

        const colorSubtitulo =
            configuracion.textSecondary || "#ffffff";

        subtitleColor.dataset.colorFinal =
            colorSubtitulo;

        subtitleColor.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(
                    colorSubtitulo
                )
            );


        /*-----------------------------------------
            RESTAURAR TAMAÑOS
        -----------------------------------------*/

        titleSize.value =
            configuracion.titleSize || 48;

        titleSizeValue.textContent =
            titleSize.value + " px";

        subtitleSize.value =
            configuracion.subtitleSize || 24;

        subtitleSizeValue.textContent =
            subtitleSize.value + " px";


        /*-----------------------------------------
            RESTAURAR COLORES DESCRIPCIÓN
        -----------------------------------------*/

        const colorTextoDescripcion =
            configuracion.descriptionTextColor || "#ffffff";

        descriptionTextColor.dataset.colorFinal =
            colorTextoDescripcion;

        descriptionTextColor.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(
                    colorTextoDescripcion
                )
            );


        const colorFondoDescripcion =
            configuracion.descriptionBackgroundColor || "#2b2b2b";

        descriptionBackgroundColor.dataset.colorFinal =
            colorFondoDescripcion;

        descriptionBackgroundColor.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(
                    colorFondoDescripcion
                )
            );


        /*-----------------------------------------
            APLICAR AL TEXTAREA
        -----------------------------------------*/

        profileDescription.style.color =
            colorTextoDescripcion;

        profileDescription.style.backgroundColor =
            colorFondoDescripcion;


        /*-----------------------------------------
            ABRIR MODAL
        -----------------------------------------*/


        cerrarTodosLosModales();

titleModal.style.display = "flex";

/*=========================================
    GUARDAR ESTADO INICIAL
=========================================*/

guardarEstadoModal(titleModal);

    };


    
/*=========================================
    EDITOR COLOR DE FONDO Y BOTONES
=========================================*/


document.getElementById("btnBackground").onclick = () => {


    /*=========================================
        CERRAR OTROS MODALES
    =========================================*/

    cerrarTodosLosModales();


    /*=========================================
        RESTAURAR DATOS GUARDADOS
    =========================================*/

    restaurarColores();

    restaurarVistasPreviasActuales();

    restaurarVelocidadAnimaciones();


    /* Restaurar fuente */

    if(

        configuracion.font &&

        typeof fuentes !== "undefined"

    ){

        fuentes.value =
            configuracion.font;

    }


    /*=========================================
        ABRIR
    =========================================*/

    colorModal.style.display =
        "flex";



/*====================================================
        RESTAURAR GRADIENTE EN EL MODAL
====================================================*/

document.getElementById(
    "cardColor1"
).value =
    configuracion.cardColor1 ||
    configuracion.card ||
    "#202020";


document.getElementById(
    "cardColor2"
).value =
    configuracion.cardColor2 ||
    "#303030";


    document.getElementById(
        "cardColor3"
    ).value =
    configuracion.cardColor3 ||
    "#101010";

    /* Restaurar esquinas de los botones */
    if(typeof radius !== "undefined" && radius){
        const valorRadius =
            Number(configuracion.radius ?? 50);

        radius.value = valorRadius;

        document.documentElement.style.setProperty(
            "--button-radius",
            valorRadius + "px"
        );
    }


    /*=========================================
        GUARDAR ESTADO INICIAL
    =========================================*/

    guardarEstadoModal(
        colorModal
    );

};



/*====================================================
CERRAR MODALES
====================================================*/

document
.querySelectorAll(".closeModal")
.forEach(btn => {


btn.onclick = () => {

    const modal = btn.closest(".modal");

    if(!modal){

        return;

    }


    /*=========================================
        ¿HAY CAMBIOS?
    =========================================*/


if(modalTieneCambios()){

    mostrarAdvertenciaCambios(() => {

        /*=========================================
            RESTAURAR TODO LO QUE NO SE GUARDÓ
        =========================================*/

        restaurarEstadoModal();


        /*=========================================
            CERRAR MODAL
        =========================================*/

        cerrarModalDefinitivamente(modal);

    });

    return;

}

    /*=========================================
        NO HAY CAMBIOS
    =========================================*/

    cerrarModalDefinitivamente(modal);

};


});

/*====================================================
CERRAR AL HACER CLICK FUERA DEL MODAL
====================================================*/

window.addEventListener("click", e => {


if(!e.target.classList.contains("modal")){

    return;

}


const modal = e.target;


if(modalTieneCambios()){

    mostrarAdvertenciaCambios(() => {

        /*=========================================
            RESTAURAR CAMBIOS NO GUARDADOS
        =========================================*/

        restaurarEstadoModal();


        /*=========================================
            CERRAR MODAL
        =========================================*/

        cerrarModalDefinitivamente(modal);

    });

    return;

}

cerrarModalDefinitivamente(modal);


});



/*====================================================
SISTEMA DE ADVERTENCIA Y NOTIFICACIONES
====================================================*/

const warningModal =
document.getElementById("warningModal");

const warningCancel =
document.getElementById("warningCancel");

const warningConfirm =
document.getElementById("warningConfirm");

const saveNotification =
document.getElementById("saveNotification");




/*====================================================
MOSTRAR ADVERTENCIA / CONFIRMACIÓN
====================================================*/

function mostrarAdvertenciaCambios(
callback,
opciones = {}
){


if(!warningModal){

    if(typeof callback === "function"){

        callback();

    }

    return;

}


/*=========================================
    TEXTOS
=========================================*/

const titulo =
    opciones.titulo ||
    "Cambios sin guardar";

const mensaje =
    opciones.mensaje ||
    "Has realizado modificaciones que todavía no han sido guardadas.";

const detalle =
    opciones.detalle ||
    "Si sales ahora, perderás todos los cambios realizados.";

const textoConfirmar =
    opciones.textoConfirmar ||
    "Salir sin guardar";


/*=========================================
    BUSCAR ELEMENTOS
=========================================*/

const tituloElemento =
    warningModal.querySelector("h2");

const parrafos =
    warningModal.querySelectorAll("p");

const botonConfirmar =
    document.getElementById(
        "warningConfirm"
    );


/*=========================================
    CAMBIAR TEXTO
=========================================*/

if(tituloElemento){

    tituloElemento.textContent =
        titulo;

}


if(parrafos[0]){

    parrafos[0].textContent =
        mensaje;

}


if(parrafos[1]){

    parrafos[1].textContent =
        detalle;

}


if(botonConfirmar){

    botonConfirmar.innerHTML =

        '<i class="fa-solid fa-right-from-bracket"></i> ' +

        textoConfirmar;

}


/*=========================================
    ABRIR
=========================================*/

warningModal.style.display =
    "flex";


/*=========================================
    CANCELAR
=========================================*/

warningCancel.onclick = () => {

    warningModal.style.display =
        "none";

};


/*=========================================
    CONFIRMAR
=========================================*/

warningConfirm.onclick = async () => {

    warningModal.style.display =
        "none";


    if(
        typeof callback ===
        "function"
    ){

        await callback();

    }

};


}


/*====================================================
MOSTRAR NOTIFICACIÓN DE GUARDADO
====================================================*/


let timerNotificacionGuardado = null;

function mostrarNotificacionGuardado(


titulo = "Cambios guardados",

mensaje =
    "La configuración se guardó correctamente."


){


if(!saveNotification){

    return;

}


/*=========================================
    BUSCAR TEXTOS
=========================================*/

const tituloElemento =
    saveNotification.querySelector(
        ".save-notification-content strong"
    );

const mensajeElemento =
    saveNotification.querySelector(
        ".save-notification-content span"
    );


/*=========================================
    ACTUALIZAR TEXTO
=========================================*/

if(tituloElemento){

    tituloElemento.textContent =
        titulo;

}


if(mensajeElemento){

    mensajeElemento.textContent =
        mensaje;

}


/*=========================================
    CANCELAR TEMPORIZADOR ANTERIOR
=========================================*/

clearTimeout(
    timerNotificacionGuardado
);


/*=========================================
    REINICIAR ANIMACIÓN
=========================================*/

saveNotification.classList.remove(
    "hide"
);

saveNotification.classList.remove(
    "show"
);


const barra =
    saveNotification.querySelector(
        ".save-notification-progress span"
    );


if(barra){

    barra.style.animation =
        "none";

    void barra.offsetWidth;

    barra.style.animation =
        "saveProgress 3.5s linear forwards";

}


/*=========================================
    MOSTRAR
=========================================*/

void saveNotification.offsetWidth;

saveNotification.classList.add(
    "show"
);


/*=========================================
    OCULTAR DESPUÉS DE 3.5 SEGUNDOS
=========================================*/

timerNotificacionGuardado =
    setTimeout(() => {

        saveNotification.classList.remove(
            "show"
        );

        saveNotification.classList.add(
            "hide"
        );

    }, 3500);


}


/*====================================================
CERRAR MODAL REALMENTE
====================================================*/

function cerrarModalDefinitivamente(modal){


if(!modal){

    return;

}


modal.style.display = "none";


if(modalActivo === modal){

    modalActivo = null;

}


estadoInicialModal = null;


}




/*====================================================
GUARDAR LOGO
====================================================*/

document.getElementById("saveLogo").onclick = async () => {

/*==============================
        URL DEL LOGO
==============================*/

const url = document
    .getElementById("logoURL")
    .value
    .trim();

if (url !== "") {

    logo.src = url;

    favicon.href = url;

    configuracion.logo = url;

}


/*==============================
        TAMAÑO
==============================*/

configuracion.logoSize =
    Number(logoSize.value);

actualizarTamanoLogo(
    configuracion.logoSize
);


/*==============================
    GUARDAR COLORES DEL ANILLO
==============================*/

const colores = [];

document
    .querySelectorAll(
        "#logoGradientEditor input[type=color]"
    )
    .forEach(input => {

        colores.push(input.value);

    });

configuracion.logoGradient =
    colores;

actualizarGradienteLogo();


/*==============================
        GUARDAR SERVIDOR
==============================*/

try {

    await guardarConfiguracionServidor();


     /*=========================================
        MOSTRAR NOTIFICACIÓN
    =========================================*/

mostrarNotificacionGuardado();


/*=========================================
        CERRAR MODAL
=========================================*/

cerrarModalDefinitivamente(logoModal);


} catch (error) {

    console.error(
        "Error al guardar el logo:",
        error
    );

}

};



/*====================================================
            LOGO DESDE COMPUTADORA
====================================================*/
document.getElementById("logoFile").addEventListener("change", async (e) => {

    const archivo = e.target.files[0];

    if (!archivo) return;

    const datos = new FormData();

    datos.append("logo", archivo);

    try {

        const respuesta = await fetch("/uploadLogo", {

            method: "POST",
            body: datos

        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {

            alert("No se pudo subir el logo.");

            return;

        }


configuracion.logo =
resultado.logo;

logo.src =
resultado.logo;

favicon.href =
resultado.logo;

/*=========================================
GUARDAR EN SERVIDOR
=========================================*/

await guardarConfiguracionServidor();

/*=========================================
ACTUALIZAR ESTADO GUARDADO
=========================================*/

guardarEstadoModal(logoModal);

/*=========================================
NOTIFICACIÓN
=========================================*/

mostrarNotificacionGuardado();





    } catch (error) {

        console.error(error);

    }

});





/*====================================================
            GUARDAR TITULO 
====================================================*/
document.getElementById("saveTitle").onclick = async () => {

    const nuevoTitulo =
    document.getElementById("newTitle")
    .value
    .trim();

    const nuevoSubtitulo =
    document.getElementById("newSubtitle")
    .value
    .trim();

    const nuevaDescripcion =
    document.getElementById("profileDescription")
    .value
    .trim();




    if(nuevoTitulo !== ""){

        configuracion.title =
        nuevoTitulo;

        title.childNodes[0].textContent =
        nuevoTitulo + " ";

        document.title =
        nuevoTitulo;

    }

    configuracion.subtitle =
    nuevoSubtitulo;

    configuracion.description =
    nuevaDescripcion;


/*====================================================
        GUARDAR ESTILO DE LA DESCRIPCIÓN
====================================================*/

const descripcionElemento = document.getElementById("description");

configuracion.descriptionAlign =
    desc.style.textAlign || "justify";

/* Guardar colores desde los inputs del modal */

configuracion.descriptionTextColor =
    descriptionTextColor.dataset.colorFinal ||
    descriptionTextColor.value;

configuracion.descriptionBackgroundColor =
    descriptionBackgroundColor.dataset.colorFinal ||
    descriptionBackgroundColor.value;

/* Aplicarlos inmediatamente */

descripcionElemento.style.color =
    configuracion.descriptionTextColor;

descripcionElemento.style.backgroundColor =
    configuracion.descriptionBackgroundColor;


    profileDescription.style.color =
    configuracion.descriptionTextColor;

profileDescription.style.backgroundColor =
    configuracion.descriptionBackgroundColor;

/* Guardar texto */

descripcionElemento.textContent =
    nuevaDescripcion;

    subtitle.childNodes[0].textContent =
    nuevoSubtitulo + " ";


/*====================================================
        GUARDAR FUENTE DEL TÍTULO
====================================================*/

configuracion.titleFont = fuenteTitulo.value;

title.style.fontFamily = fuenteTitulo.value;

subtitle.style.fontFamily = fuenteTitulo.value;

configuracion.text =
    titleColor.dataset.colorFinal || titleColor.value;

configuracion.textSecondary =
    subtitleColor.dataset.colorFinal || subtitleColor.value;




/*====================================================
        GUARDAR TAMAÑOS
====================================================*/

configuracion.titleSize = Number(titleSize.value);

configuracion.subtitleSize = Number(subtitleSize.value);



/* Aplicar colores */

document.documentElement.style.setProperty(

    "--text",

    configuracion.text

);

document.documentElement.style.setProperty(

    "--text-secondary",

    configuracion.textSecondary

);


/* Aplicar tamaños */

actualizarTamanoTitulo(

    configuracion.titleSize

);

actualizarTamanoSubtitulo(

    configuracion.subtitleSize

);









/* Guardar configuración */


/*=========================================
        GUARDAR EN SERVIDOR
=========================================*/

await guardarConfiguracionServidor();


/*=========================================
        MOSTRAR NOTIFICACIÓN
=========================================*/

mostrarNotificacionGuardado();


/*=========================================
        CERRAR MODAL DEFINITIVAMENTE
=========================================*/

cerrarModalDefinitivamente(titleModal);

};


/*====================================================
    HERRAMIENTAS DE LA DESCRIPCIÓN
====================================================*/

const desc =
    document.getElementById("description");


if (desc) {


    /*=========================================
        JUSTIFICAR DESCRIPCIÓN
    =========================================*/

    document
        .getElementById("descJustify")
        ?.addEventListener("click", () => {

            desc.style.textAlign =
                "justify";

            desc.style.textAlignLast =
                "left";


            /*
                CAMBIO TEMPORAL

                NO se guarda en servidor.
            */

            configuracion.descriptionAlign =
                "justify";

        });


    /*=========================================
        CENTRAR DESCRIPCIÓN
    =========================================*/

    document
        .getElementById("descCenter")
        ?.addEventListener("click", () => {

            desc.style.textAlign =
                "center";

            desc.style.textAlignLast =
                "center";


            /*
                CAMBIO TEMPORAL

                NO se guarda en servidor.
            */

            configuracion.descriptionAlign =
                "center";

        });

}



/* guardado se haga al pulsar Guardar. */


titleSize.oninput = ()=>{

    const valor = Number(titleSize.value);

    actualizarTamanoTitulo(valor);

    titleSizeValue.textContent = valor + " px";

};


subtitleSize.oninput = ()=>{

    const valor = Number(subtitleSize.value);

    actualizarTamanoSubtitulo(valor);

    subtitleSizeValue.textContent = valor + " px";

};

/*====================================================
            COLORES
====================================================*/

const fondo = document.getElementById("backgroundColor");

const tarjeta1 =
    document.getElementById("cardColor1");

const tarjeta2 =
    document.getElementById("cardColor2");

const tarjeta3 =
    document.getElementById("cardColor3");

const botones = document.getElementById("buttonColor");

const borde = document.getElementById("borderColor");

const sombra = document.getElementById("shadowColor");






/*====================================================
        EDITOR UNIVERSAL DE COLORES GENERALES
====================================================*/

vincularEditorUniversal({
    boton: fondo,
    picker: fondo,
    propiedad: "background",
    variableCSS: "--background",
    despuesDeAplicar: () => actualizarColorFooter()
});



/*====================================================
        COLOR 1 DEL GRADIENTE
        EDITOR UNIVERSAL
====================================================*/

if(tarjeta1){

    tarjeta1.addEventListener(
        "input",
        () => {

            configuracion.cardColor1 =
                tarjeta1.value;

            actualizarGradienteTarjeta();

        }
    );


    vincularEditorUniversal({

        boton: tarjeta1,

        picker: tarjeta1,

        propiedad:
            "cardColor1",

        variableCSS:
            "--card-color-1",

        despuesDeAplicar: (valor) => {

            configuracion.cardColor1 =
                valor;

            actualizarGradienteTarjeta();

        }

    });

}




/*====================================================
        COLOR 2 DEL GRADIENTE
        EDITOR UNIVERSAL
====================================================*/

if(tarjeta2){

    tarjeta2.addEventListener(
        "input",
        () => {

            configuracion.cardColor2 =
                tarjeta2.value;

            actualizarGradienteTarjeta();

        }
    );


    vincularEditorUniversal({

        boton: tarjeta2,

        picker: tarjeta2,

        propiedad:
            "cardColor2",

        variableCSS:
            "--card-color-2",

        despuesDeAplicar: (valor) => {

            configuracion.cardColor2 =
                valor;

            actualizarGradienteTarjeta();

        }

    });

}




/*====================================================
        COLOR 3 DEL GRADIENTE
        EDITOR UNIVERSAL
====================================================*/

if(tarjeta3){

    tarjeta3.addEventListener(
        "input",
        () => {

            configuracion.cardColor3 =
                tarjeta3.value;

            actualizarGradienteTarjeta();

        }
    );


    vincularEditorUniversal({

        boton: tarjeta3,

        picker: tarjeta3,

        propiedad:
            "cardColor3",

        variableCSS:
            "--card-color-3",

        despuesDeAplicar: (valor) => {

            configuracion.cardColor3 =
                valor;

            actualizarGradienteTarjeta();

        }

    });

}





vincularEditorUniversal({
    boton: botones,
    picker: botones,
    propiedad: "button",
    variableCSS: "--button"
});

vincularEditorUniversal({
    boton: borde,
    picker: borde,
    propiedad: "border",
    variableCSS: "--border"
});

vincularEditorUniversal({
    boton: sombra,
    picker: sombra,
    propiedad: "shadow",
    variableCSS: "--shadow"
});










/*=====================================================
        REGISTRAR FUENTE EN EL NAVEGADOR
=====================================================*/

function registrarFuente(nombre, url) {

    const id = "font-" + nombre.replace(/\s+/g, "-");

    if (document.getElementById(id)) {

        return;

    }

    const style = document.createElement("style");

    style.id = id;

    style.textContent = `
@font-face{
    font-family:"${nombre}";
    src:url("${url}");
}
`;

    document.head.appendChild(style);

}

/*=====================================================
        AGREGAR FUENTE AL SELECT
=====================================================*/

function agregarFuenteSelect(nombre){

    [fuentes, fuenteTitulo].forEach(select=>{

        if(!select) return;

        const existe=[...select.options].some(
            op=>op.value===nombre
        );

        if(existe) return;

        const opcion=document.createElement("option");

        opcion.value=nombre;

        opcion.textContent=nombre;

        select.appendChild(opcion);

    });

}

/*=====================================================
        CARGAR TODAS LAS FUENTES
=====================================================*/

async function cargarFuentes(){

    try{

        const respuesta = await fetch("/fonts-list");

        const resultado = await respuesta.json();

        if(!resultado.ok){

            return;

        }

        resultado.fonts.forEach(fuente=>{

            registrarFuente(

                fuente.name,

                fuente.url

            );

            agregarFuenteSelect(

                fuente.name

            );

        });

if (

    configuracion.titleFont &&

    [...fuenteTitulo.options].some(

        op => op.value === configuracion.titleFont

    )

) {

    fuenteTitulo.value = configuracion.titleFont;

}

    }

    catch(error){

        console.error(

            "Error cargando fuentes:",

            error

        );

    }

}


/*=====================================================
        CAMBIAR FUENTE DEL TÍTULO
=====================================================*/

titleFont.addEventListener("change",()=>{

    if(!title || !subtitle) return;

    title.style.fontFamily = titleFont.value;

    subtitle.style.fontFamily = titleFont.value;

});



/*====================================================
        SUBIR FUENTE AL SERVIDOR
====================================================*/

fontFile.addEventListener("change", async (e) => {

    const archivo = e.target.files[0];

    if (!archivo) return;

    const datos = new FormData();

    datos.append("font", archivo);

    try{

        const respuesta = await fetch("/uploadFont",{

            method:"POST",

            body:datos

        });

        const resultado = await respuesta.json();

        if(!resultado.ok){

            alert(resultado.error || "No se pudo subir la fuente.");

            return;

        }

        registrarFuente(

            resultado.font,

            resultado.url

        );

        agregarFuenteSelect(

            resultado.font

        );

        fuenteTitulo.value = resultado.font;

        title.style.fontFamily = resultado.font;

        subtitle.style.fontFamily = resultado.font;



    }

    catch(error){

        console.error(error);

    }

    finally{

        fontFile.value = "";

    }

});



/*====================================================
        IMAGEN DE FONDO PENDIENTE
====================================================*/

let imagenCardPendiente = null;

/*====================================================
            FONDO DE CARD
====================================================*/


const backgroundImage = document.getElementById("backgroundImage");

/*====================================================
        SELECCIONAR IMAGEN DE FONDO
        NO SUBIR TODAVÍA
====================================================*/

backgroundImage.addEventListener(
    "change",
    (e) => {

        const archivo =
            e.target.files[0];


        if(!archivo){

            imagenCardPendiente = null;

            return;

        }


        /*
            Guardamos solamente el archivo
            en memoria.

            TODAVÍA NO se envía al servidor.
        */

        imagenCardPendiente =
            archivo;


        /*
            Vista previa inmediata
        */

        const vistaPrevia =
            URL.createObjectURL(
                archivo
            );


        const card =
            document.querySelector(".card");


if(card){

    const color1 =
    configuracion.cardColor1 ||
    configuracion.card ||
    "#202020";

const degradadoColor1 =
    `linear-gradient(
        to top,
        ${color1} 0%,
        ${color1} 20%,
        rgba(0,0,0,0) 65%,
        rgba(0,0,0,0) 100%
    )`;

card.style.backgroundImage = `
    ${degradadoColor1},
    url("${vistaPrevia}")
`;

card.style.backgroundSize =
    "cover, cover";

card.style.backgroundPosition =
    "center, center";

card.style.backgroundRepeat =
    "no-repeat, no-repeat";
}

    }
);



/*=========================================
    QUITAR IMAGEN DE LA TARJETA
=========================================*/

document.getElementById("removeCardImage").onclick = async () => {

    try{

        const respuesta = await fetch("/removeCardImage",{

            method:"POST"

        });

        const resultado = await respuesta.json();

        if(!resultado.ok){

            alert("No se pudo eliminar la imagen.");

            return;

        }

        configuracion.cardImage = "";

        await guardarConfiguracionServidor();





/*=========================================
    RESTAURAR DEGRADADO DE 3 COLORES
=========================================*/

actualizarGradienteTarjeta();






    }catch(error){

        console.error(error);

    }

};




/*====================================================
        APLICAR MARCA DE AGUA SVG
====================================================*/

function aplicarMarcaAguaTarjeta(){

    const card =
        document.querySelector(
            ".card"
        );


    if(!card){

        return;

    }


    const logo =
        configuracion.cardWatermark;


    /*-----------------------------------------
        NO EXISTE LOGO
    -----------------------------------------*/

if(!logo){

    card.classList.remove(
        "has-watermark"
    );

    document.documentElement.style
        .setProperty(
            "--card-watermark",
            "none"
        );


    /*=========================================
        LIMPIAR PATRÓN SVG
    =========================================*/

    const contenedor =
        document.querySelector(
            ".card-watermark-container"
        );

    if(contenedor){

        contenedor.innerHTML = "";

    }


    return;
}


    /*-----------------------------------------
        EVITAR CACHE DEL SVG
    -----------------------------------------*/

    const logoActualizado =
        logo +
        "?v=" +
        Date.now();


    /*-----------------------------------------
        APLICAR SVG
    -----------------------------------------*/

    document.documentElement.style
        .setProperty(
            "--card-watermark",
            `url("${logoActualizado}")`
        );


    /*-----------------------------------------
        ACTIVAR MARCA DE AGUA
    -----------------------------------------*/

   card.classList.add(
    "has-watermark"
);


/*====================================================
    CREAR PATRÓN ESCALONADO SVG
====================================================*/

crearPatronMarcaAgua();


console.log(
    "Marca de agua aplicada:",
    logoActualizado
);

}


/*====================================================
        LOGO SVG MARCA DE AGUA
====================================================*/

const cardWatermarkLogo =
    document.getElementById(
        "cardWatermarkLogo"
    );


if(cardWatermarkLogo){

    cardWatermarkLogo.addEventListener(
        "change",
        async (e) => {


            const archivo =
                e.target.files[0];


            if(!archivo){

                return;

            }


            /*-----------------------------------------
                VALIDAR SVG
            -----------------------------------------*/

            const extension =
                archivo.name
                .toLowerCase()
                .split(".")
                .pop();


            if(
                extension !== "svg" &&
                archivo.type !==
                "image/svg+xml"
            ){

                alert(
                    "Solo puedes subir archivos SVG."
                );

                e.target.value = "";

                return;

            }


            /*-----------------------------------------
                FORM DATA
            -----------------------------------------*/

            const datos =
                new FormData();


            datos.append(
                "cardWatermark",
                archivo
            );


            try{

                const respuesta =
                    await fetch(
                        "/uploadCardWatermark",
                        {

                            method:"POST",

                            body:datos

                        }
                    );


                const resultado =
                    await respuesta.json();


                if(!resultado.ok){

                    alert(
                        resultado.error ||
                        "No se pudo subir el logo."
                    );

                    return;

                }


                /*-----------------------------------------
                    GUARDAR RUTA TEMPORAL
                -----------------------------------------*/


configuracion.cardWatermark =
    resultado.cardWatermark;


/*-----------------------------------------
    GUARDAR CONFIGURACIÓN
-----------------------------------------*/

await guardarConfiguracionServidor();


/*-----------------------------------------
    APLICAR MARCA DE AGUA
-----------------------------------------*/

aplicarMarcaAguaTarjeta();


/*-----------------------------------------
    VERIFICAR QUE EL SVG RESPONDE
-----------------------------------------*/

const imagenPrueba =
    new Image();

imagenPrueba.onload = () => {

    console.log(
        "SVG cargado correctamente:",
        resultado.cardWatermark
    );

};


imagenPrueba.onerror = () => {

    console.error(
        "El SVG fue guardado pero el navegador no pudo cargarlo:",
        resultado.cardWatermark
    );

};


imagenPrueba.src =
    resultado.cardWatermark +
    "?v=" +
    Date.now();




                /*-----------------------------------------
                    MARCAR CAMBIO
                -----------------------------------------*/

                /*
                    No guardamos la configuración
                    general aquí.

                    El archivo SVG sí fue subido
                    al servidor porque es necesario
                    para poder mostrarlo.
                */

                e.target.value = "";


            }catch(error){

                console.error(
                    "Error subiendo logo SVG:",
                    error
                );

            }

        }
    );

}

/*====================================================
        COLOR DE LOS ICONOS
====================================================*/

const colorIconos = document.getElementById("iconColor");

vincularEditorUniversal({

    boton: colorIconos,

    picker: colorIconos,

    propiedad: "iconColor",

    variableCSS: "--link-icon-color",

    despuesDeAplicar:(valor)=>{

        document.documentElement.style.setProperty(

            "--link-icon-color",

            valor

        );

        configuracion.iconColor = valor;

    }

});


/*====================================================
        ICONO → TEXTO AUTOMÁTICO
====================================================*/

const linkIcon = document.getElementById("linkIcon");
const linkTitle = document.getElementById("linkTitle");

if (linkIcon && linkTitle) {

    linkIcon.addEventListener("change", () => {

        const opcionSeleccionada =
            linkIcon.options[linkIcon.selectedIndex];

        if (!opcionSeleccionada) return;

        const nombreIcono =
            opcionSeleccionada.textContent.trim();

        linkTitle.value = nombreIcono;

    });

}





/*====================================================
    CAMPOS DINÁMICOS DEL EDITOR DE BOTONES
====================================================*/

activarCamposDinamicosEditor();


/*====================================================
    ESTADO DEL LÍMITE DE BOTONES
====================================================*/


function mostrarEstadoLimiteBotones(totalBotones, puedeCrear = true){

    const modal =
        document.getElementById("warningModal");

    if(!modal){
        return;
    }

    const disponibles =
        Math.max(LIMITE_BOTONES - totalBotones, 0);

    const porcentaje =
        Math.min(
            Math.round((totalBotones / LIMITE_BOTONES) * 100),
            100
        );

    const titulo = modal.querySelector("h2");
    const parrafos = modal.querySelectorAll("p");
    const icono = modal.querySelector(".warning-icon i");
    const barra = modal.querySelector(".warning-progress span");
    const botones = modal.querySelector(".warning-buttons");

    if(icono){
        icono.className = puedeCrear
            ? "fa-solid fa-circle-info"
            : "fa-solid fa-triangle-exclamation";
    }

    if(titulo){
        titulo.textContent = puedeCrear
            ? "Estado de tus botones"
            : "Límite de botones alcanzado";
    }

    if(parrafos[0]){
        parrafos[0].innerHTML =
            `Tienes <strong>${totalBotones}</strong> de <strong>${LIMITE_BOTONES}</strong> botones creados.`;
    }

    if(parrafos[1]){
        parrafos[1].innerHTML = puedeCrear
            ? `Te quedan <strong>${disponibles}</strong> botón(es) disponibles. Máximo permitido: <strong>${LIMITE_BOTONES}</strong>.`
            : `Ya utilizaste los <strong>${LIMITE_BOTONES}</strong> botones permitidos. No puedes crear otro hasta eliminar uno.`;
    }

    if(barra){
        barra.style.width = porcentaje + "%";
        barra.style.background = porcentaje >= 100 ? "#ff3b30" : "#ffb300";
    }

    let porcentajeEl = modal.querySelector(".warning-percentage");
    if(!porcentajeEl){
        porcentajeEl = document.createElement("div");
        porcentajeEl.className = "warning-percentage";
        const progress = modal.querySelector(".warning-progress");
        if(progress){
            progress.insertAdjacentElement("afterend", porcentajeEl);
        }
    }
    porcentajeEl.innerHTML = `<strong>${porcentaje}%</strong> del límite utilizado`;

    if(botones){
        botones.innerHTML = puedeCrear
            ? `
                <button type="button" id="warningCancel" class="warning-continue">
                    <i class="fa-solid fa-xmark"></i>
                    Cancelar
                </button>
                <button type="button" id="warningConfirm" class="warning-exit">
                    <i class="fa-solid fa-plus"></i>
                    Crear botón
                </button>
            `
            : `
                <button type="button" id="warningCancel" class="warning-continue">
                    <i class="fa-solid fa-check"></i>
                    Entendido
                </button>
                <button type="button" id="warningConfirm" class="warning-exit" style="display:none;">
                    Cerrar
                </button>
            `;
    }

    modal.style.display = "flex";

    const cancelar = document.getElementById("warningCancel");
    const confirmar = document.getElementById("warningConfirm");

    if(cancelar){
        cancelar.onclick = () => {
            modal.style.display = "none";
        };
    }

    if(confirmar && puedeCrear){
        confirmar.onclick = async () => {
            modal.style.display = "none";

            const totalActual = document.querySelectorAll(
                "#linksContainer .link-card"
            ).length;

            if(totalActual >= LIMITE_BOTONES){
                mostrarEstadoLimiteBotones(totalActual, false);
                return;
            }

            agregarBoton();
            await guardarBotones();
            activarBotones();
            activarLinks();
            activarDragDrop();
            activarBotonesInfoUsuario();
        };
    }
}


    /*====================================================
                EDITOR DE BOTONES
    ====================================================*/

    let botonSeleccionado = null;


/*====================================================
    INFORMACIÓN MANUAL DEL BOTÓN / RED SOCIAL
====================================================*/

let socialPhotoPendingFile = null;

function detectarTipoEnlace(url = "", icono = ""){
    const valor = `${url} ${icono}`.toLowerCase();

    if(
        valor.includes("whatsapp") ||
        valor.includes("wa.me")
    ){
        return "whatsapp";
    }

    if(
        valor.includes("facebook") ||
        valor.includes("fb.com")
    ){
        return "facebook";
    }

    if(valor.includes("instagram")){
        return "instagram";
    }

    if(valor.includes("tiktok")){
        return "tiktok";
    }

    if(
        valor.includes("youtube") ||
        valor.includes("youtu.be")
    ){
        return "youtube";
    }

    if(
        valor.includes("graduation-cap") ||
        valor.includes("curso")
    ){
        return "curso";
    }

    if(
        valor.includes("fa-file-pdf") ||
        /\.pdf(?:[?#].*)?$/i.test(url)
    ){
        return "pdf";
    }

    return "generic";
}

function obtenerYouTubeThumbnail(url = ""){
    try{

        const u = new URL(url);

        /*
            La miniatura automática se obtiene exclusivamente
            desde la URL de YouTube del campo superior.
            Se utiliza el formato estándar:
            https://www.youtube.com/watch?v=VIDEO_ID
        */

        const esYouTube =
            u.hostname === "youtube.com" ||
            u.hostname === "www.youtube.com" ||
            u.hostname.endsWith(".youtube.com");

        if(!esYouTube || u.pathname !== "/watch"){
            return "";
        }

        const id =
            u.searchParams.get("v") || "";

        if(!id){
            return "";
        }

        return `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;

    }catch(error){

        return "";

    }
}

function escaparHTML(valor = ""){
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/*====================================================
    AMPLIAR MINIATURAS DEL PROYECTO
    - 4x respecto al tamaño visible
    - centrada dentro del modal si existe
    - muestra la imagen completa sin recorte
    - vuelve automáticamente a normal después de 2 minutos
====================================================*/

function abrirMiniaturaAmpliada(imagenOrigen){

    if(!imagenOrigen || !imagenOrigen.src){
        return;
    }

    const modalPadre =
        imagenOrigen.closest(".modal-content");

    const contenedor =
        modalPadre || document.body;

    const overlay =
        document.createElement("div");

    overlay.className =
        "project-thumbnail-lightbox";

    if(modalPadre){
        overlay.classList.add("inside-modal");
    }

    const imagen =
        document.createElement("img");

    imagen.src =
        imagenOrigen.currentSrc ||
        imagenOrigen.src;

    imagen.alt =
        imagenOrigen.alt ||
        "Miniatura ampliada";

    const rect =
        imagenOrigen.getBoundingClientRect();

    const ancho4x =
        Math.max(40, rect.width * 4);

    const alto4x =
        Math.max(40, rect.height * 4);

    imagen.style.width =
        `${ancho4x}px`;

    imagen.style.height =
        `${alto4x}px`;

    imagen.style.maxWidth =
        "92vw";

    imagen.style.maxHeight =
        "88vh";

    imagen.style.objectFit =
        "contain";

    overlay.appendChild(imagen);
    contenedor.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add("is-visible");
    });

    const cerrar = () => {

        overlay.classList.remove("is-visible");

        setTimeout(() => {
            overlay.remove();
        }, 250);

    };

    overlay.addEventListener("click", cerrar);

    /* Unos minutos: 2 minutos. */
    setTimeout(() => {

        if(document.body.contains(overlay) ||
           contenedor.contains(overlay)){

            cerrar();

        }

    }, 120000);

}

function obtenerIconoActualEditor(){
    return document.getElementById("linkIcon")?.value || "";
}

function actualizarVistaPreviaFotoEditor(url = ""){
    const preview = document.getElementById("linkSocialPhotoPreview");
    const box = preview?.closest(".file-preview-box");

    if(!preview){
        return;
    }

    preview.src = url || "";
    preview.style.display = url ? "block" : "none";

    if(box){
        box.classList.toggle(
            "has-image",
            Boolean(url)
        );
    }
}

function limpiarFotoPendienteEditor(){
    socialPhotoPendingFile = null;

    const input = document.getElementById("linkSocialPhoto");

    if(input){
        input.value = "";
    }
}

function actualizarCamposSocialesEditor(){
    const editor = document.getElementById("linkSocialEditor");

    if(!editor){
        return;
    }

    const tipo = detectarTipoEnlace(
        document.getElementById("linkURL")?.value || "",
        obtenerIconoActualEditor()
    );

    editor.classList.remove(
        "social-type-whatsapp",
        "social-type-social",
        "social-type-youtube",
        "social-type-curso",
        "social-type-pdf",
        "social-type-generic"
    );

    editor.classList.add(
        `social-type-${tipo === "facebook" ||
        tipo === "instagram" ||
        tipo === "tiktok"
            ? "social"
            : tipo}`
    );

    const help = document.getElementById("linkSocialHelp");
    const photoHelp = document.getElementById("linkSocialPhotoHelp");

    if(help){
        if(tipo === "whatsapp"){
            help.textContent =
                "Esta información aparecerá al pulsar la flecha ↑ del botón de WhatsApp.";
        }else if(
            tipo === "facebook" ||
            tipo === "instagram" ||
            tipo === "tiktok"
        ){
            help.textContent =
                "Esta información aparecerá al pulsar la flecha ↑ del botón.";
         }else if(tipo === "youtube"){
            help.textContent =
                "Puedes utilizar una fotografía subida manualmente para sustituir la miniatura de YouTube.";
        }else if(tipo === "curso"){
            help.textContent =
                "El curso mostrará un panel informativo con su logo o imagen y la descripción que escribas.";
        }else if(tipo === "pdf"){
            help.textContent =
                "El PDF se mostrará con su primera página y debajo aparecerá únicamente la descripción.";
        }else{
            help.textContent = "";
        }
    }

    if(photoHelp){
        photoHelp.textContent =
            "Selecciona una imagen desde tu computadora.";
    }

    const photoField =
        document.getElementById("linkSocialPhotoField");

    if(photoField){
        photoField.querySelector("label[for='linkSocialPhoto']").textContent =
            tipo === "youtube"
                ? "Fotografía manual para miniatura de YouTube"
                : tipo === "curso"
                    ? "Logo / imagen del curso"
                    : "Foto / imagen";
    }

    if(editor){
        editor.classList.toggle(
            "social-type-youtube-manual-photo",
            tipo === "youtube" || tipo === "curso"
        );
    }

    const panelColors =
        document.getElementById("socialPanelColors");

    if(panelColors){
        panelColors.style.display = "grid";
    }

    if(tipo === "pdf" || tipo === "generic"){
        limpiarFotoPendienteEditor();
        actualizarVistaPreviaFotoEditor("");
    }
}

function renderizarInformacionBoton(card){
    if(!card) return;

    const panel = card.querySelector(".social-info-panel");

    if(!panel) return;

    const url = card.dataset.url || "";

    const tipo = detectarTipoEnlace(
        url,
        card.querySelector(".left i")?.className || ""
    );

    const nombre = card.dataset.socialName || "";
    const usuario = card.dataset.socialUsername || "";
    const telefono = card.dataset.socialPhone || "";
    const foto = card.dataset.socialPhoto || "";
    const siguiendo = card.dataset.socialFollowing || "";
    const seguidores = card.dataset.socialFollowers || "";
    const meGusta = card.dataset.socialLikes || "";
    const descripcion = card.dataset.description || "";
    const infoNombre =
        card.dataset.infoName ||
        card.dataset.socialName ||
        "";
    const infoDescripcion =
        card.dataset.infoDescription ||
        descripcion ||
        "";
    const youtubeDescription =
        card.dataset.youtubeDescription || "";

    const youtube = obtenerYouTubeThumbnail(url);

    let contenido = "";

    if(tipo === "youtube"){
        // Si existe una foto subida manualmente, esta sustituye la miniatura de YouTube.
        const thumb = foto || youtube;

        contenido = `
            <div class="social-info-inner youtube-info-inner">
                ${
                    thumb
                    ? `
                        <div class="youtube-thumbnail-wrap">
                            <img
                                class="youtube-thumbnail"
                                src="${escaparHTML(thumb)}"
                                alt="Miniatura de YouTube">
                            <span class="youtube-play">
                                <i class="fab fa-youtube"></i>
                            </span>
                        </div>
                    `
                    : `
                        <div class="youtube-thumbnail-wrap">
                            <div class="social-placeholder">
                                <i class="fab fa-youtube"></i>
                            </div>
                        </div>
                    `
                }

                ${
                    youtubeDescription
                    ? `<span class="social-info-description">${escaparHTML(youtubeDescription)}</span>`
                    : ""
                }
            </div>
        `;

    }else if(tipo === "curso"){

        const logoCurso = foto || "";

        contenido = `
            <div class="social-info-inner curso-info-inner">
                ${
                    logoCurso
                    ? `<div class="curso-logo-wrap" title="Toca la imagen para ampliarla">
                           <img class="curso-logo" src="${escaparHTML(logoCurso)}" alt="Logo del curso">
                       </div>`
                    : `<div class="social-info-avatar social-placeholder curso-placeholder">
                           <i class="fa-solid fa-graduation-cap"></i>
                       </div>`
                }

                <div class="curso-info-content">
                    <strong class="social-info-name">
                        ${escaparHTML(infoNombre || "Curso")}
                    </strong>

                    ${
                        infoDescripcion
                        ? `<span class="social-info-description">${escaparHTML(infoDescripcion)}</span>`
                        : ""
                    }
                </div>
            </div>
        `;

    }else if(tipo === "pdf"){

        contenido = `
            <div class="social-info-inner pdf-info-inner">
                <div class="pdf-preview-wrap">
                    <iframe
                        class="pdf-preview"
                        src="${escaparHTML(url)}#page=1&toolbar=0&navpanes=0&scrollbar=0"
                        title="Primera página del PDF">
                    </iframe>
                </div>

                ${
                    descripcion
                    ? `<span class="social-info-description">${escaparHTML(descripcion)}</span>`
                    : ""
                }
            </div>
        `;

    }else if(tipo === "whatsapp"){

        contenido = `
            <div class="social-info-inner whatsapp-info-inner">
                ${
                    foto
                    ? `
                        <img
                            class="social-info-avatar"
                            src="${escaparHTML(foto)}"
                            alt="Foto de WhatsApp">
                    `
                    : `
                        <div class="social-info-avatar social-placeholder">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                    `
                }

                <strong class="social-info-name">
                    ${escaparHTML(nombre || "WhatsApp")}
                </strong>

                <span class="social-info-user">
                    ${escaparHTML(telefono || "Número no registrado")}
                </span>

                <span class="social-info-url">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </span>
            </div>
        `;

    }else if(
        ["facebook","instagram","tiktok"].includes(tipo)
    ){

        const icon =
            tipo === "facebook"
                ? "fab fa-facebook-f"
                : tipo === "instagram"
                    ? "fab fa-instagram"
                    : "fab fa-tiktok";

        const avatar = foto
            ? `
                <img
                    class="social-info-avatar"
                    src="${escaparHTML(foto)}"
                    alt="Foto de perfil">
            `
            : `
                <div class="social-info-avatar social-placeholder">
                    <i class="${icon}"></i>
                </div>
            `;

        contenido = `
            <div class="social-info-inner">
                ${avatar}

                <strong class="social-info-name">
                    ${escaparHTML(nombre || "Sin nombre")}
                </strong>

                ${
                    usuario
                    ? `<span class="social-info-user">${escaparHTML(usuario)}</span>`
                    : ""
                }

                <div class="social-info-stats">
                    <div>
                        <i class="fa-solid fa-user-group"></i>
                        <strong>${escaparHTML(siguiendo || "—")}</strong>
                        <span>Siguiendo</span>
                    </div>

                    <div>
                        <i class="fa-solid fa-users"></i>
                        <strong>${escaparHTML(seguidores || "—")}</strong>
                        <span>Seguidores</span>
                    </div>

                    <div>
                        <i class="fa-solid fa-heart"></i>
                        <strong>${escaparHTML(meGusta || "—")}</strong>
                        <span>Me gusta</span>
                    </div>
                </div>
            </div>
        `;

    }else{

        contenido = `
            <div class="social-info-inner generic-info-inner">
                <strong class="social-info-name">
                    ${escaparHTML(infoNombre || "Información")}
                </strong>

                ${
                    infoDescripcion
                    ? `<span class="social-info-description">${escaparHTML(infoDescripcion)}</span>`
                    : `<span class="social-info-description">No hay información adicional.</span>`
                }
            </div>
        `;
    }

    panel.innerHTML = contenido;

    /*====================================================
        AMPLIAR TODAS LAS MINIATURAS DEL PANEL
    ====================================================*/

    panel.querySelectorAll(
        ".curso-logo, .youtube-thumbnail"
    ).forEach(miniatura => {

        miniatura.style.cursor = "pointer";

        miniatura.onclick = (e) => {

            e.preventDefault();
            e.stopPropagation();

            abrirMiniaturaAmpliada(miniatura);

        };

    });

}

function actualizarContadorDescripcionYouTube(){

    const input =
        document.getElementById("linkYoutubeDescription");

    const contador =
        document.getElementById("youtubeDescriptionCounter");

    if(!input || !contador){
        return;
    }

    input.value =
        input.value.slice(0,100);

    contador.textContent =
        `${input.value.length} / 100`;
}

function limitarCamposInformacionEditor(){

    const nombre =
        document.getElementById("linkInfoName");

    const descripcion =
        document.getElementById("linkInfoDescription");

    if(nombre){
        nombre.value =
            nombre.value.slice(0,30);
    }

    if(descripcion){
        descripcion.value =
            descripcion.value.slice(0,200);
    }

}

function cargarCamposSocialesEditor(card){

    const fotoActual =
        card?.dataset.socialPhoto || "";

    actualizarVistaPreviaFotoEditor(
        fotoActual
    );



    const infoName =
        document.getElementById("linkInfoName");
    const infoDescription =
        document.getElementById("linkInfoDescription");

    if(infoName){
        infoName.value =
            (
                card.dataset.infoName ||
                card.dataset.socialName ||
                ""
            ).slice(0,30);
    }

    if(infoDescription){
        infoDescription.value =
            (
                card.dataset.infoDescription ||
                card.dataset.description ||
                ""
            ).slice(0,200);
    }

    const map = {
        linkSocialName: "socialName",
        linkSocialUsername: "socialUsername",
        linkSocialPhone: "socialPhone",
        linkSocialFollowing: "socialFollowing",
        linkSocialFollowers: "socialFollowers",
        linkSocialLikes: "socialLikes"
    };

    Object.entries(map).forEach(([id, data]) => {
        const el = document.getElementById(id);

        if(el){
            el.value =
                card.dataset[data] || "";
        }
    });

    limpiarFotoPendienteEditor();

    actualizarVistaPreviaFotoEditor(
        card.dataset.socialPhoto || ""
    );

    const youtubeDescription =
        document.getElementById("linkYoutubeDescription");

    if(youtubeDescription){
        youtubeDescription.value =
            card.dataset.youtubeDescription || "";
        actualizarContadorDescripcionYouTube();
    }

    const panelColor =
        document.getElementById("linkPanelColor");

    const panelTextColor =
        document.getElementById("linkPanelTextColor");

    if(panelColor){
        const valor =
            card.dataset.socialPanelColor ||
            "#202020";

        panelColor.dataset.colorFinal = valor;
        panelColor.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(valor)
            );
    }

    if(panelTextColor){
        const valor =
            card.dataset.socialPanelTextColor ||
            "#ffffff";

        panelTextColor.dataset.colorFinal = valor;
        panelTextColor.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(valor)
            );
    }

    actualizarCamposSocialesEditor();
}

function guardarCamposSocialesEditor(card){

    const infoName =
        document.getElementById("linkInfoName");
    const infoDescription =
        document.getElementById("linkInfoDescription");

    if(infoName){
        card.dataset.infoName =
            infoName.value.trim().slice(0,30);
    }

    if(infoDescription){
        card.dataset.infoDescription =
            infoDescription.value.trim().slice(0,200);
    }

    const map = {
        linkSocialName: "socialName",
        linkSocialUsername: "socialUsername",
        linkSocialPhone: "socialPhone",
        linkSocialFollowing: "socialFollowing",
        linkSocialFollowers: "socialFollowers",
        linkSocialLikes: "socialLikes"
    };

    Object.entries(map).forEach(([id, data]) => {

        const el =
            document.getElementById(id);

        if(el){
            card.dataset[data] =
                el.value.trim();
        }

    });

    const youtubeDescription =
        document.getElementById("linkYoutubeDescription");

    if(youtubeDescription){
        card.dataset.youtubeDescription =
            youtubeDescription.value.trim().slice(0,100);
    }

    const panelColor =
        document.getElementById("linkPanelColor");

    const panelTextColor =
        document.getElementById("linkPanelTextColor");

    card.dataset.socialPanelColor =
        panelColor?.dataset.colorFinal ||
        panelColor?.value ||
        card.dataset.socialPanelColor ||
        "#202020";

    card.dataset.socialPanelTextColor =
        panelTextColor?.value ||
        card.dataset.socialPanelTextColor ||
        "#ffffff";

    aplicarColoresPanelInformacion(card);
}

async function subirFotoSocialEditor(){

    if(!socialPhotoPendingFile){
        return null;
    }

    const datos = new FormData();

    datos.append(
        "socialImage",
        socialPhotoPendingFile
    );

    const respuesta = await fetch(
        "/uploadSocialImage",
        {
            method:"POST",
            body:datos
        }
    );

    const resultado =
        await respuesta.json();

    if(!respuesta.ok || !resultado.ok){
        throw new Error(
            resultado.error ||
            "No se pudo subir la imagen."
        );
    }

    socialPhotoPendingFile = null;

    const input =
        document.getElementById("linkSocialPhoto");

    if(input){
        input.value = "";
    }

    return resultado.socialPhoto;
}

function activarEditorFotoSocial(){

    const input =
        document.getElementById("linkSocialPhoto");

    if(!input || input.dataset.bound === "true"){
        return;
    }

    input.dataset.bound = "true";

    input.addEventListener("change", () => {

        const archivo =
            input.files?.[0];

        if(!archivo){
            return;
        }

        if(!archivo.type.startsWith("image/")){
            input.value = "";

            mostrarNotificacionGuardado(
                "Archivo no válido",
                "Selecciona una imagen."
            );

            return;
        }

        if(archivo.size > 5 * 1024 * 1024){
            input.value = "";

            mostrarNotificacionGuardado(
                "Imagen demasiado grande",
                "El tamaño máximo permitido es 5 MB."
            );

            return;
        }

        socialPhotoPendingFile =
            archivo;

        const lector =
            new FileReader();

        lector.onload = () => {
            actualizarVistaPreviaFotoEditor(
                lector.result
            );
        };

        lector.readAsDataURL(archivo);
    });
}

function aplicarColoresPanelInformacion(card){

    if(!card){
        return;
    }

    const fondo =
        card.dataset.socialPanelColor ||
        "#202020";

    const texto =
        card.dataset.socialPanelTextColor ||
        "#ffffff";

    card.style.setProperty(
        "--social-panel-bg",
        fondo
    );

    card.style.setProperty(
        "--social-panel-text",
        texto
    );
}

function activarCamposDinamicosEditor(){

    const infoName =
        document.getElementById("linkInfoName");

    const infoDescription =
        document.getElementById("linkInfoDescription");

    if(infoName && infoName.dataset.limitBound !== "true"){
        infoName.dataset.limitBound = "true";
        infoName.maxLength = 30;
        infoName.addEventListener(
            "input",
            limitarCamposInformacionEditor
        );
    }

    if(infoDescription && infoDescription.dataset.limitBound !== "true"){
        infoDescription.dataset.limitBound = "true";
        infoDescription.maxLength = 200;
        infoDescription.addEventListener(
            "input",
            limitarCamposInformacionEditor
        );
    }

    limitarCamposInformacionEditor();

    const linkIcon =
        document.getElementById("linkIcon");

    const linkURL =
        document.getElementById("linkURL");

    if(linkIcon){
        linkIcon.addEventListener(
            "change",
            actualizarCamposSocialesEditor
        );
    }

    if(linkURL){
        linkURL.addEventListener(
            "input",
            actualizarCamposSocialesEditor
        );
    }

    activarEditorFotoSocial();
    activarColoresPanelEditor();

    const youtubeDescription =
        document.getElementById("linkYoutubeDescription");

    if(
        youtubeDescription &&
        youtubeDescription.dataset.bound !== "true"
    ){
        youtubeDescription.dataset.bound = "true";
        youtubeDescription.addEventListener(
            "input",
            actualizarContadorDescripcionYouTube
        );
    }

    actualizarCamposSocialesEditor();
}

function activarColoresPanelEditor(){

    const fondo =
        document.getElementById("linkPanelColor");

    const texto =
        document.getElementById("linkPanelTextColor");

    const aplicar = () => {

        if(!botonSeleccionado){
            return;
        }

        if(fondo){
            botonSeleccionado.dataset.socialPanelColor =
                fondo.dataset.colorFinal ||
                fondo.value;
        }

        if(texto){
            botonSeleccionado.dataset.socialPanelTextColor =
                texto.dataset.colorFinal ||
                texto.value;
        }

        aplicarColoresPanelInformacion(
            botonSeleccionado
        );

        if(
            botonSeleccionado.classList.contains(
                "social-info-open"
            )
        ){
            renderizarInformacionBoton(
                botonSeleccionado
            );
        }

    };

    /*
        Estos dos controles utilizan el mismo Editor Universal
        de colores que el resto de los colores del proyecto.
    */
    [fondo,texto].forEach(input => {

        if(!input || input.dataset.universalColorBound === "true"){
            return;
        }

        input.dataset.universalColorBound = "true";

        vincularEditorUniversal({
            boton: input,
            picker: input,
            propiedad: null,
            variableCSS: null,
            despuesDeAplicar: (valor) => {

                input.dataset.colorFinal = valor;

                if(!botonSeleccionado){
                    return;
                }

                if(input === fondo){
                    botonSeleccionado.dataset.socialPanelColor =
                        valor;
                }

                if(input === texto){
                    botonSeleccionado.dataset.socialPanelTextColor =
                        valor;
                }

                aplicarColoresPanelInformacion(
                    botonSeleccionado
                );

                if(
                    botonSeleccionado.classList.contains(
                        "social-info-open"
                    )
                ){
                    renderizarInformacionBoton(
                        botonSeleccionado
                    );

                    ajustarEspacioPanelInformacion(
                        botonSeleccionado
                    );
                }

            }
        });

    });


}

/*====================================================
    AJUSTAR ESPACIO DEL PANEL INFORMATIVO
====================================================*/

function ajustarEspacioPanelInformacion(card){

    if(!card) return;

    const panel =
        card.querySelector(".social-info-panel");

    if(!panel) return;

    if(!card.classList.contains("social-info-open")){

        card.style.removeProperty("margin-top");
        return;

    }

    /*
        El panel se dibuja por encima del botón, pero la tarjeta
        se desplaza solo lo necesario para que el panel no tape
        el botón anterior. Los botones siguientes quedan debajo
        de forma natural porque la tarjeta conserva su espacio en el flujo.

        Puedes ajustar la separación desde CSS con:
        --social-info-gap: 5px;
    */
    requestAnimationFrame(() => {

        const alturaPanel =
            Math.min(
                panel.scrollHeight,
                430
            );

        const links =
            document.getElementById(
                "linksContainer"
            );

        const gapConfigurado =
            links
                ? parseFloat(
                    getComputedStyle(links)
                        .getPropertyValue("--social-info-gap")
                ) || 5
                : 5;

        const cardRect =
            card.getBoundingClientRect();

        const panelTopActual =
            cardRect.top -
            alturaPanel -
            8;

        let desplazamiento =
            alturaPanel + 8;

        const tarjetas =
            Array.from(
                document.querySelectorAll(
                    "#linksContainer .link-card"
                )
            );

        const indice =
            tarjetas.indexOf(card);

        if(indice > 0){

            const tarjetaAnterior =
                tarjetas[indice - 1];

            const anteriorRect =
                tarjetaAnterior.getBoundingClientRect();

            const panelTopDeseado =
                anteriorRect.bottom +
                gapConfigurado;

            const desplazamientoNecesario =
                panelTopDeseado -
                panelTopActual;

            desplazamiento =
                Math.max(0, desplazamientoNecesario);

        }else if(links){

            const linksRect =
                links.getBoundingClientRect();

            const panelTopDeseado =
                linksRect.top +
                gapConfigurado;

            const desplazamientoNecesario =
                panelTopDeseado -
                panelTopActual;

            desplazamiento =
                Math.max(0, desplazamientoNecesario);

        }

        card.style.setProperty(
            "margin-top",
            `${Math.ceil(desplazamiento)}px`,
            "important"
        );

    });

}


function activarBotonesInfoUsuario(){

    document.querySelectorAll(
        ".user-info-toggle"
    ).forEach(btn => {

        if(btn.dataset.infoBound === "true"){
            return;
        }

        btn.dataset.infoBound = "true";

        btn.onclick = (e) => {

            e.preventDefault();
            e.stopPropagation();

            const card =
                btn.closest(".link-card");

            if(!card){
                return;
            }

            const abierto =
                card.classList.toggle(
                    "social-info-open"
                );

            const icono =
                btn.querySelector("i");

            if(icono){

                icono.className =
                    abierto
                    ? "fa-solid fa-chevron-down"
                    : "fa-solid fa-chevron-up";

            }

            if(abierto){
                renderizarInformacionBoton(card);

                ajustarEspacioPanelInformacion(card);

                if(card._infoAutoHideTimer){
                    clearTimeout(
                        card._infoAutoHideTimer
                    );
                }

                card._infoAutoHideTimer =
                    setTimeout(() => {

                        if(!card.classList.contains(
                            "social-info-open"
                        )){
                            return;
                        }

                        card.classList.remove(
                            "social-info-open"
                        );

                        card.style.removeProperty(
                            "margin-top"
                        );

                        if(icono){
                            icono.className =
                                "fa-solid fa-chevron-up";
                        }

                    }, 4000);

            }else{

                card.style.removeProperty("margin-top");

                if(card._infoAutoHideTimer){
                    clearTimeout(
                        card._infoAutoHideTimer
                    );

                    card._infoAutoHideTimer = null;
                }

            }

        };

    });

}

/*====================================================
            ABRIR MODAL DESDE LOS TRES PUNTOS
    ====================================================*/

    function activarBotones(){

        document.querySelectorAll(".options").forEach(btn => {

        btn.onmousedown = (e) => {

                e.stopPropagation();

                botonSeleccionado =
                    btn.closest(".link-card");

                const texto =
                    botonSeleccionado.querySelector(".center span");

                const icono =
                    botonSeleccionado.querySelector(".left i");

                const descripcion =
                    botonSeleccionado.querySelector(".center small");

                /* TEXTO */

                document.getElementById("linkTitle").value =
                    texto.innerText;

                /* URL */

                document.getElementById("linkURL").value =
                    botonSeleccionado.dataset.url || "";

                /* ICONO */

                document.getElementById("linkIcon").value =
                    icono.className;

                /* COLOR DE TEXTO */

                /* COLOR DE TEXTO */

    const colorTexto =
    botonSeleccionado.dataset.textColor || "#ffffff";



/* Guardar el color real */

linkTextColor.dataset.colorFinal =
    colorTexto;

/* El input solo recibe HEX */

linkTextColor.value =
    rgbObjetoAHex(
        obtenerRGBDesdeColor(
            colorTexto
        )
    );



                /* DESCRIPCIÓN */

                document.getElementById("linkDescription").value =
                    botonSeleccionado.dataset.description || "";

                    actualizarContadorDescripcionBoton();

                /* NUEVA PESTAÑA */

                document.getElementById("linkNewTab").checked =
                    botonSeleccionado.dataset.newTab === "true";

                cargarCamposSocialesEditor(
                    botonSeleccionado
                );





                /* ABRIR MODAL */

cerrarTodosLosModales();

document.getElementById("linkModal")
    .style.display = "flex";

   guardarEstadoModal(
    document.getElementById("linkModal")
);

            };

        });

    }




    /*====================================================
            GUARDAR CAMBIOS DEL BOTÓN
    ====================================================*/

    document.getElementById("saveLink").onclick = async () => {
        if(!botonSeleccionado) return;


        const texto =
            document.getElementById("linkTitle")
            .value
            .trim();


        const url =
            document.getElementById("linkURL")
            .value
            .trim();


        const icono =
            document.getElementById("linkIcon")
            .value;


   let colorTexto =
    linkTextColor.dataset.colorFinal ||
    linkTextColor.value;

    /*=========================================
        SI EL EDITOR UNIVERSAL ESTÁ ACTIVO
    =========================================*/




        const descripcion =
            document.getElementById("linkDescription")
            .value
            .trim();


        const nuevaPestana =
            document.getElementById("linkNewTab")
            .checked;

        /*=========================================
            SUBIR FOTO / MINIATURA
        =========================================*/

        const tipoEnlace =
            detectarTipoEnlace(
                url,
                icono
            );

        if(
            socialPhotoPendingFile &&
            (
                tipoEnlace === "whatsapp" ||
                tipoEnlace === "facebook" ||
                tipoEnlace === "instagram" ||
                tipoEnlace === "tiktok" ||
                tipoEnlace === "youtube" ||
                tipoEnlace === "curso"
            )
        ){
            try{

                const nuevaFoto =
                    await subirFotoSocialEditor();

                if(nuevaFoto){
                    botonSeleccionado.dataset.socialPhoto =
                        nuevaFoto;
                }

            }catch(error){

                console.error(
                    "Error subiendo foto del botón:",
                    error
                );

                mostrarNotificacionGuardado(
                    "No se pudo subir la imagen",
                    error.message
                );

                return;
            }
        }


        /* ACTUALIZAR TEXTO */

        botonSeleccionado
            .querySelector(".center span")
            .innerText = texto;


        /* ACTUALIZAR ICONO */

        botonSeleccionado
            .querySelector(".left i")
            .className = icono;


        /* ACTUALIZAR URL */

        botonSeleccionado.dataset.url = url;


        /* ACTUALIZAR COLOR DE LA LETRA */


    const span = botonSeleccionado.querySelector(".center span");

    span.style.color = colorTexto;

    const small =
    botonSeleccionado.querySelector(".center small");

    if(small){

        small.style.color = colorTexto;

    }

    botonSeleccionado.dataset.textColor = colorTexto;
        


        /* ACTUALIZAR DESCRIPCIÓN */

        let descripcionElemento =
            botonSeleccionado.querySelector(".center small");

            botonSeleccionado.dataset.description = descripcion;


        if(descripcion !== ""){

            if(!descripcionElemento){

                descripcionElemento =
                    document.createElement("small");

                botonSeleccionado
                    .querySelector(".center")
                    .appendChild(descripcionElemento);

            }

            descripcionElemento.innerText =
                descripcion;

        }else{


                botonSeleccionado.dataset.description = "";


            if(descripcionElemento){

                descripcionElemento.remove();

            }

        }


        /* ABRIR EN NUEVA PESTAÑA */

        botonSeleccionado.dataset.newTab =
            nuevaPestana;

        guardarCamposSocialesEditor(
            botonSeleccionado
        );

        aplicarColoresPanelInformacion(
            botonSeleccionado
        );

        renderizarInformacionBoton(
            botonSeleccionado
        );


 /*=========================================
        GUARDAR BOTONES
=========================================*/

await guardarBotones();


/*=========================================
        NOTIFICACIÓN
=========================================*/

mostrarNotificacionGuardado(
    "Cambios guardados",
    "El botón se guardó correctamente."
);


/*=========================================
        CERRAR MODAL
=========================================*/

cerrarModalDefinitivamente(
    document.getElementById("linkModal")
);


    };




/*====================================================
ELIMINAR BOTÓN
====================================================*/

document.getElementById(
    "deleteLink"
).onclick = () => {

    if(!botonSeleccionado){
        return;
    }

    const botonAEliminar =
        botonSeleccionado;

    mostrarAdvertenciaCambios(
        async () => {

            try{

                if(botonAEliminar._infoAutoHideTimer){
                    clearTimeout(
                        botonAEliminar._infoAutoHideTimer
                    );
                    botonAEliminar._infoAutoHideTimer = null;
                }

                botonAEliminar.classList.remove(
                    "social-info-open"
                );

                botonAEliminar.remove();

                botonSeleccionado = null;
                modalActivo = null;
                estadoInicialModal = null;

                const linkModal =
                    document.getElementById("linkModal");

                if(linkModal){
                    linkModal.style.display = "none";
                }

                cerrarTodosLosModales();

                await guardarBotones();

                mostrarNotificacionGuardado(
                    "Botón eliminado",
                    "El botón fue eliminado correctamente."
                );

            }catch(error){

                console.error(
                    "Error eliminando botón:",
                    error
                );

                mostrarNotificacionGuardado(
                    "Error al eliminar",
                    "No se pudo guardar la eliminación."
                );

            }

        },
        {
            titulo:
                "¿Deseas eliminar este botón?",

            mensaje:
                "Esta acción eliminará el botón seleccionado.",

            detalle:
                "El botón se quitará y el cambio se guardará inmediatamente.",

            textoConfirmar:
                "Eliminar botón"

        }
    );

};


/*====================================================
            DUPLICAR BOTÓN
====================================================*/

document.getElementById("duplicateLink").onclick = () => {

    if(!botonSeleccionado) return;


    const texto =
        botonSeleccionado
        .querySelector(".center span")
        .innerText;


    const icono =
        botonSeleccionado
        .querySelector(".left i")
        .className;


    const url =
        botonSeleccionado.dataset.url || "";


    const colorTexto =
        botonSeleccionado.dataset.textColor ||
        "#ffffff";


    const descripcion =
        botonSeleccionado.dataset.description ||
        "";


    const nuevaPestana =
        botonSeleccionado.dataset.newTab === "true";

    const socialData = {
        socialName: botonSeleccionado.dataset.socialName || "",
        infoName: botonSeleccionado.dataset.infoName || "",
        infoDescription: botonSeleccionado.dataset.infoDescription || "",
        socialUsername: botonSeleccionado.dataset.socialUsername || "",
        socialPhone: botonSeleccionado.dataset.socialPhone || "",
        socialPhoto: botonSeleccionado.dataset.socialPhoto || "",
        socialFollowing: botonSeleccionado.dataset.socialFollowing || "",
        socialFollowers: botonSeleccionado.dataset.socialFollowers || "",
        socialLikes: botonSeleccionado.dataset.socialLikes || "",
        youtubeDescription:
            botonSeleccionado.dataset.youtubeDescription || "",
        socialPanelColor:
            botonSeleccionado.dataset.socialPanelColor || "#202020",
        socialPanelTextColor:
            botonSeleccionado.dataset.socialPanelTextColor || "#ffffff"
    };


    agregarBoton(

        texto + " - Copia",

        icono,

        url,

        colorTexto,

        descripcion,

        nuevaPestana,

        socialData

    );

    
    guardarBotones();

    // Activar eventos únicamente para el nuevo botón
activarBotones();

activarLinks();

activarDragDrop();

activarBotonesInfoUsuario();

};


/*====================================================
            ABRIR ENLACES
====================================================*/

function activarLinks(){

    document
        .querySelectorAll(".link-card")
        .forEach(card => {


        card.onclick = (e) => {


            if(
                e.target.closest(".options") ||
                e.target.closest(".user-info-toggle") ||
                e.target.closest(".social-info-panel")
            )
                return;


            const url =
                card.dataset.url;


            if(!url)

                return;


            const nuevaPestana =
                card.dataset.newTab === "true";


            if(nuevaPestana){

                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            }else{

                window.location.href =
                    url;

            }

        };

    });

}




/*====================================================
            AGREGAR BOTÓN
====================================================*/

function agregarBoton(

    texto = "Nuevo botón",

    icono = "fa-solid fa-link",

    url = "",

    colorTexto = "#fffefe",

    descripcion = "",

    nuevaPestana = false,

    socialData = {}

){

    const contenedor =
        document.getElementById("linksContainer");


    const div =
        document.createElement("div");


    div.className =
        "link-card";


    div.dataset.url =
        url;


    div.dataset.textColor =
        colorTexto;


    div.dataset.description =
        descripcion;


    div.dataset.newTab =
        nuevaPestana;

    div.dataset.socialName =
        socialData.socialName || "";
    div.dataset.infoName =
        socialData.infoName ||
        "";
    div.dataset.infoDescription =
        socialData.infoDescription ||
        descripcion ||
        "";
    div.dataset.socialUsername =
        socialData.socialUsername || "";
    div.dataset.socialPhone =
        socialData.socialPhone || "";
    div.dataset.socialPhoto =
        socialData.socialPhoto || "";
    div.dataset.socialFollowing =
        socialData.socialFollowing || "";
    div.dataset.socialFollowers =
        socialData.socialFollowers || "";
    div.dataset.socialLikes =
        socialData.socialLikes || "";

    div.dataset.youtubeDescription =
        socialData.youtubeDescription || "";

    div.dataset.socialPanelColor =
        socialData.socialPanelColor ||
        "#202020";

    div.dataset.socialPanelTextColor =
        socialData.socialPanelTextColor ||
        "#ffffff";

    aplicarColoresPanelInformacion(div);


    div.innerHTML = `

        <div class="link-main">

            <div class="left">
                <i class="${icono}"></i>
            </div>

            <div class="center">
                <span style="color:${colorTexto};">
                    ${escaparHTML(texto)}
                </span>

                ${
                    descripcion
                    ? `<small style="color:${colorTexto};">${escaparHTML(descripcion)}</small>`
                    : ""
                }
            </div>

            <div class="link-actions">
                <button class="options admin-only" type="button" aria-label="Editar botón">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>

                <button class="user-info-toggle" type="button" aria-label="Mostrar información">
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
            </div>

        </div>

        <div class="social-info-panel"></div>

    `;


 
contenedor.appendChild(div);

const infoToggleNuevo =
    div.querySelector(".user-info-toggle");

if(infoToggleNuevo){
    infoToggleNuevo.style.display =
        administradorActivo
            ? "none"
            : "flex";
}

const radioBoton =
    Number(configuracion.radius ?? 50);

div.style.setProperty(
    "--button-radius",
    radioBoton + "px"
);

const mainVisual =
    div.querySelector(".link-main");

if(mainVisual){
    mainVisual.style.setProperty(
        "border-radius",
        radioBoton + "px",
        "important"
    );
}

div.style.fontFamily =
configuracion.font ||
"'Segoe UI',sans-serif";

aplicarColoresPanelInformacion(div);

// Mantener ocultos los controles si no es administrador

}



/*====================================================
    IDENTIFICADOR DEL DISPOSITIVO
====================================================*/

function obtenerDeviceId() {

    let deviceId =
        localStorage.getItem(
            "jmDeveloperDeviceId"
        );


    if (!deviceId) {

        deviceId =
            crypto.randomUUID();


        localStorage.setItem(
            "jmDeveloperDeviceId",
            deviceId
        );

    }


    return deviceId;
}







/*====================================================
    ESTADÍSTICAS DE LA TARJETA
====================================================*/

const cardStats =
    document.getElementById("cardStats");

const cardViewsCounter =
    document.getElementById("cardViewsCounter");

const cardLikesCounter =
    document.getElementById("cardLikesCounter");

const cardLikeButton =
    document.getElementById("cardLikeButton");

const cardViewsIcon =
    document.getElementById("cardViewsIcon");




    const cardShareButton =
    document.getElementById("cardShareButton");

const cardSharesCounter =
    document.getElementById("cardSharesCounter");

const cardStatsAdminButton =
    document.getElementById("cardStatsAdminButton");

const cardStatsModal =
    document.getElementById("cardStatsModal");




/*====================================================
    REGISTRAR VISUALIZACIÓN
====================================================*/

async function cargarVisualizaciones() {

    if (!cardViewsCounter) return;


    try {

        const deviceId =
            obtenerDeviceId();


        const respuesta =
            await fetch(
                "/stats/view",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            deviceId
                        })

                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (
            typeof datos.views === "number"
        ) {

            cardViewsCounter.textContent =
                datos.views;

        }


        /*
            Solo animamos cuando esta
            visita realmente fue registrada.
        */

        if (datos.registrada) {

            animarOjo();

        }


    } catch (error) {

        console.error(
            "Error registrando visualización:",
            error
        );

    }

}

/*====================================================
    ANIMACIÓN DEL OJO
====================================================*/

function animarOjo() {

    if (!cardViewsIcon) return;

    cardViewsIcon.classList.remove(
        "card-eye-animation"
    );

    void cardViewsIcon.offsetWidth;

    cardViewsIcon.classList.add(
        "card-eye-animation"
    );

}


cargarVisualizaciones();
cargarEstadoLike();
cargarEstadoShare();
actualizarColorIconosCardStats();


/*====================================================
    CARGAR ESTADO DE COMPARTIDOS
====================================================*/

async function cargarEstadoShare() {

    if (!cardShareButton) {
        return;
    }


    try {

        const deviceId =
            obtenerDeviceId();


        const respuesta =
            await fetch(
                `/stats/share?deviceId=${encodeURIComponent(deviceId)}`,
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (
            typeof datos.shares === "number"
        ) {

            cardSharesCounter.textContent =
                datos.shares;

        }


    } catch (error) {

        console.error(
            "Error cargando compartidos:",
            error
        );

    }

}



/*====================================================
    CARGAR ESTADO DE LIKE
====================================================*/

async function cargarEstadoLike() {

    if (!cardLikeButton) return;


    try {

        const deviceId =
            obtenerDeviceId();


        const respuesta =
            await fetch(
                `/stats/like?deviceId=${encodeURIComponent(deviceId)}`,
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (
            typeof datos.likes === "number"
        ) {

            cardLikesCounter.textContent =
                datos.likes;

        }


        /*=========================================
            SOLO ACTUALIZAR ESTADO VISUAL
        =========================================*/

        if (datos.liked) {

            cardLikeButton.classList.add(
                "liked"
            );

        } else {

            cardLikeButton.classList.remove(
                "liked"
            );

        }


    } catch (error) {

        console.error(
            "Error cargando Like:",
            error
        );

    }

}


/*====================================================
    SONIDO LIKE
====================================================*/

const sonidoLike = new Audio(
    "/sounds/like.mp3"
);


function reproducirSonidoLike(){

    sonidoLike.currentTime = 0;

    sonidoLike.volume = 0.7;

    sonidoLike.play().catch(
        error => {

            console.warn(
                "No se pudo reproducir el sonido Like:",
                error
            );

        }
    );

}









/*====================================================
    TOGGLE LIKE
====================================================*/

async function cambiarLike() {

    if (!cardLikeButton) return;


    /*
        Evitar doble clic mientras
        esperamos al servidor.
    */

    if (
        cardLikeButton.dataset.procesando === "true"
    ) {

        return;

    }


    cardLikeButton.dataset.procesando =
        "true";


    try {

        const deviceId =
            obtenerDeviceId();


        const respuesta =
            await fetch(
                "/stats/like",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({
                            deviceId
                        })

                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


 const datos =
    await respuesta.json();


if (
    typeof datos.likes === "number"
) {

    cardLikesCounter.textContent =
        datos.likes;

}


/*=========================================
    ESTADO VISUAL
=========================================*/

if (datos.liked) {

    cardLikeButton.classList.add(
        "liked"
    );


      /*=====================================
        SONIDO LIKE
    =====================================*/

    reproducirSonidoLike();



    /*=====================================
        ANIMACIÓN
    =====================================*/

    animarPulgares();

} else {

    cardLikeButton.classList.remove(
        "liked"
    );

}


    } catch (error) {

        console.error(
            "Error cambiando Like:",
            error
        );

    } finally {

        cardLikeButton.dataset.procesando =
            "false";

    }

}

if (cardLikeButton) {

    cardLikeButton.addEventListener(
        "click",
        cambiarLike
    );

}

if (cardShareButton) {

    cardShareButton.addEventListener(
        "click",
        compartirPagina
    );

}






/*====================================================
    ANIMACIÓN DE APLAUSOS
====================================================*/

function animarAplausos() {

    const cantidad = 18;


    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        const aplauso =
            document.createElement(
                "div"
            );


        aplauso.className =
            "share-float";

/*
        aplauso.innerHTML =
            "👏🏼"; */

            aplauso.innerHTML = `
    <span class="clap-bubble">
        <i class="fa-solid fa-hands-clapping"></i>
    </span>
`;


        aplauso.style.left =
            (
                Math.random() * 100
            ) + "%";


        aplauso.style.fontSize =
            (
                18 +
                Math.random() * 22
            ) + "px";


        aplauso.style.animationDuration =
            (
                1.8 +
                Math.random() * 1.7
            ) + "s";


        aplauso.style.animationDelay =
            (
                Math.random() * 0.5
            ) + "s";


        document.body.appendChild(
            aplauso
        );


        setTimeout(() => {

            aplauso.remove();

        }, 4000);

    }

}

/*====================================================
    COMPARTIR URL
====================================================*/

async function compartirPagina() {

    if (!cardShareButton) {
        return;
    }


    if (
        cardShareButton.dataset.procesando === "true"
    ) {

        return;

    }


    cardShareButton.dataset.procesando =
        "true";


    try {

        const url =
            window.location.href;


        const shareData = {

            title:
                document.title,

            text:
                "Mira este perfil:",

            url:
                url

        };


        /*
            NAVEGADOR CON WEB SHARE
        */

        if (
            navigator.share &&
            (
                !navigator.canShare ||
                navigator.canShare(shareData)
            )
        ) {

            await navigator.share(
                shareData
            );


            await registrarCompartido();

            activarEstadoCompartido();
            animarAplausos();


            return;

        }


        /*
            FALLBACK:
            COPIAR URL
        */

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                url
            );


            await registrarCompartido();

           activarEstadoCompartido();
            animarAplausos();

            mostrarNotificacionGuardado(
                "Enlace copiado",
                "El enlace se copió correctamente."
            );


            return;

        }


        /*
            NAVEGADORES MUY ANTIGUOS
        */

        const textarea =
            document.createElement("textarea");

        textarea.value =
            url;

        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();


        await registrarCompartido();

                   activarEstadoCompartido();
            animarAplausos();


        mostrarNotificacionGuardado(
            "Enlace copiado",
            "El enlace se copió correctamente."
        );


    } catch (error) {

        /*
            Si el usuario cancela el
            diálogo de compartir NO contamos.
        */

        if (
            error &&
            error.name === "AbortError"
        ) {

            return;

        }


        console.error(
            "Error compartiendo:",
            error
        );


    } finally {

        cardShareButton.dataset.procesando =
            "false";

    }

}

/*====================================================
    REGISTRAR COMPARTIDO EN SERVIDOR
====================================================*/

async function registrarCompartido() {

    const deviceId =
        obtenerDeviceId();


    const respuesta =
        await fetch(
            "/stats/share",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        deviceId
                    })
            }
        );


    if (!respuesta.ok) {

        throw new Error(
            `HTTP ${respuesta.status}`
        );

    }


    const datos =
        await respuesta.json();


    if (
        typeof datos.shares === "number"
    ) {

        cardSharesCounter.textContent =
            datos.shares;

    }


    return datos;

}



/*====================================================
    SONIDOS  COMPARTIR
====================================================*/


const sonidoShare = new Audio(
    "/sounds/share.mp3"
);




/*====================================================
    REPRODUCIR SONIDO COMPARTIR
====================================================*/

function reproducirSonidoShare(){

    sonidoShare.currentTime = 0;

    sonidoShare.volume = 0.7;

    sonidoShare.play().catch(
        () => {}
    );

}



/*====================================================
    ANIMACIÓN DEL BOTÓN COMPARTIR
====================================================*/

function activarEstadoCompartido() {

    if (!cardShareButton) {
        return;
    }


    cardShareButton.classList.add(
        "shared"
    );

      reproducirSonidoShare();

}




/*====================================================
    PERMISO PARA MOVER CARDSTATS
====================================================*/

let cardStatsAdminPuedeMover = false;


/*====================================================
    MOVER ESTADÍSTICAS DENTRO DE LA CARD
====================================================*/


function activarArrastreCardStats() {

    const stats =
        document.getElementById("cardStats");

    if (!stats) return;


    const card =
        stats.closest(".card");

    if (!card) return;


    let arrastrando = false;

    let inicioX = 0;
    let inicioY = 0;

    let posicionInicialX = 0;
    let posicionInicialY = 0;


    /*================================================
        INICIAR
    =================================================*/

function iniciarArrastre(e) {



    


 const tipo =
        obtenerTipoDispositivoCardStats();

    const posicion =
        cardStatsPositions[tipo];


    if(
        posicion &&
        posicion.locked
    ){

        return;

    }


    if(!cardStatsAdminPuedeMover){

        return;

    }


    /*
        SOLO EL ADMINISTRADOR
        PUEDE MOVER CARDSTATS
    */

    if (!cardStatsAdminPuedeMover) {
        return;
    }


 
/*
    Los botones no deben iniciar
    el movimiento de cardStats.
*/

if (
    e.target.closest("button")
) {

    return;

} 


        const punto =
            e.touches
                ? e.touches[0]
                : e;


        const cardRect =
            card.getBoundingClientRect();


        const statsRect =
            stats.getBoundingClientRect();


        inicioX =
            punto.clientX;

        inicioY =
            punto.clientY;


        /*
            Convertimos la posición visual
            a posición relativa a la card.
        */

        posicionInicialX =
            statsRect.left -
            cardRect.left;


        posicionInicialY =
            statsRect.top -
            cardRect.top;


        /*
            Desde este momento dejamos
            de utilizar translateX(-50%).
        */

        stats.style.transform =
            "none";


        /*
            Aplicamos directamente
            la posición calculada.
        */

        stats.style.left =
            posicionInicialX + "px";


        stats.style.top =
            posicionInicialY + "px";


        arrastrando = true;


        stats.classList.add(
            "dragging"
        );


        e.preventDefault();
    }




    /*================================================
        MOVER
    =================================================*/

    function mover(e) {

        if (!arrastrando) return;


        const punto =
            e.touches
                ? e.touches[0]
                : e;


        const cardRect =
            card.getBoundingClientRect();


        const statsRect =
            stats.getBoundingClientRect();


        let nuevaX =
            posicionInicialX +
            (
                punto.clientX -
                inicioX
            );


        let nuevaY =
            posicionInicialY +
            (
                punto.clientY -
                inicioY
            );


        /*
            Límites
        */

        const limiteIzquierdo =
            0;


        const limiteSuperior =
            0;


        const limiteDerecho =
            cardRect.width -
            statsRect.width;


        const limiteInferior =
            cardRect.height -
            statsRect.height;


        /*
            Evitar salir de la card
        */

        nuevaX =
            Math.max(
                limiteIzquierdo,
                Math.min(
                    nuevaX,
                    limiteDerecho
                )
            );


        nuevaY =
            Math.max(
                limiteSuperior,
                Math.min(
                    nuevaY,
                    limiteInferior
                )
            );


        /*
            Aplicar posición
        */

        stats.style.left =
            nuevaX + "px";


        stats.style.top =
            nuevaY + "px";


        e.preventDefault();
    }


    /*================================================
        TERMINAR
    =================================================*/

    function terminarArrastre() {

        if (!arrastrando) return;


        arrastrando = false;


        stats.classList.remove(
            "dragging"
        );


        guardarPosicionCardStats();
    }


    /*================================================
        MOUSE
    =================================================*/

    stats.addEventListener(
        "mousedown",
        iniciarArrastre
    );


    document.addEventListener(
        "mousemove",
        mover
    );


    document.addEventListener(
        "mouseup",
        terminarArrastre
    );


    /*================================================
        TOUCH
    =================================================*/

    stats.addEventListener(
        "touchstart",
        iniciarArrastre,
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchmove",
        mover,
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchend",
        terminarArrastre
    );
}


/*====================================================
    POSICIONES INDEPENDIENTES DE CARDSTATS
    WEB + CELULAR
====================================================*/

let cardStatsPositions = {

    web: {

        x: 0,

        y: 230,

        locked: false

    },

    mobile: {

        x: 0,

        y: 230,

        locked: false

    }

};


/*====================================================
    DETECTAR TIPO DE DISPOSITIVO
====================================================*/

function obtenerTipoDispositivoCardStats(){

    return window.matchMedia(
        "(max-width: 600px)"
    ).matches

        ? "mobile"

        : "web";

}


/*====================================================
    CARGAR POSICIONES DESDE SERVIDOR
====================================================*/

async function cargarPosicionesCardStats(){

    try{

        const respuesta =
            await fetch(
                "/card-stats/position",
                {
                    cache:"no-store"
                }
            );


        if(!respuesta.ok){

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        /*=========================================
            WEB
        =========================================*/

        if(datos.web){

            cardStatsPositions.web = {

                x:
                    Number.isFinite(
                        Number(
                            datos.web.x
                        )
                    )
                        ? Number(
                            datos.web.x
                        )
                        : 0,

                y:
                    Number.isFinite(
                        Number(
                            datos.web.y
                        )
                    )
                        ? Number(
                            datos.web.y
                        )
                        : 230,

                locked:
                    datos.web.locked === true

            };

        }


        /*=========================================
            CELULAR
        =========================================*/

        if(datos.mobile){

            cardStatsPositions.mobile = {

                x:
                    Number.isFinite(
                        Number(
                            datos.mobile.x
                        )
                    )
                        ? Number(
                            datos.mobile.x
                        )
                        : 0,

                y:
                    Number.isFinite(
                        Number(
                            datos.mobile.y
                        )
                    )
                        ? Number(
                            datos.mobile.y
                        )
                        : 230,

                locked:
                    datos.mobile.locked === true

            };

        }


        /*=========================================
            APLICAR LA POSICIÓN DEL DISPOSITIVO
        =========================================*/

        aplicarPosicionCardStats();


        /*=========================================
            ACTUALIZAR INPUTS DEL MODAL
        =========================================*/

        cargarPosicionesEnModal();


    }catch(error){

        console.error(
            "Error cargando posiciones de CardStats:",
            error
        );

    }

}


/*====================================================
    APLICAR POSICIÓN SEGÚN DISPOSITIVO
====================================================*/

function aplicarPosicionCardStats(){

    const stats =
        document.getElementById(
            "cardStats"
        );


    if(!stats){

        return;

    }


    const tipo =
        obtenerTipoDispositivoCardStats();


    const posicion =
        cardStatsPositions[tipo];


    if(!posicion){

        return;

    }


    stats.style.transform =
        "none";


    stats.style.left =
        posicion.x + "px";


    stats.style.top =
        posicion.y + "px";

}


/*====================================================
    CARGAR LAS DOS POSICIONES EN EL MODAL
====================================================*/

function cargarPosicionesEnModal(){

    if(cardStatsWebX){

        cardStatsWebX.value =
            Math.round(
                cardStatsPositions.web.x
            );

    }


    if(cardStatsWebY){

        cardStatsWebY.value =
            Math.round(
                cardStatsPositions.web.y
            );

    }


    if(cardStatsWebLock){

        cardStatsWebLock.checked =
            cardStatsPositions.web.locked;

    }


    if(cardStatsMobileX){

        cardStatsMobileX.value =
            Math.round(
                cardStatsPositions.mobile.x
            );

    }


    if(cardStatsMobileY){

        cardStatsMobileY.value =
            Math.round(
                cardStatsPositions.mobile.y
            );

    }


    if(cardStatsMobileLock){

        cardStatsMobileLock.checked =
            cardStatsPositions.mobile.locked;

    }

}


/*====================================================
    GUARDAR TODAS LAS POSICIONES
====================================================*/

async function guardarTodasLasPosicionesCardStats(){

    try{

        const respuesta =
            await fetch(
                "/card-stats/position",
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            cardStatsPositions
                        )

                }
            );


        if(!respuesta.ok){

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


    }catch(error){

        console.error(
            "Error guardando posiciones de CardStats:",
            error
        );

    }

}


/*====================================================
    GUARDAR POSICIÓN DESPUÉS DE ARRASTRAR
====================================================*/

async function guardarPosicionCardStats(){

    const stats =
        document.getElementById(
            "cardStats"
        );


    if(!stats){

        return;

    }


    const tipo =
        obtenerTipoDispositivoCardStats();


    const posicion =
        cardStatsPositions[tipo];


    if(!posicion){

        return;

    }


    if(posicion.locked){

        return;

    }


    posicion.x =
        Math.round(
            stats.offsetLeft
        );


    posicion.y =
        Math.round(
            stats.offsetTop
        );


    cargarPosicionesEnModal();


    await guardarTodasLasPosicionesCardStats();

}


/*====================================================
    INPUTS MANUALES DE POSICIÓN
====================================================*/

function conectarInputPosicionCardStats(
    inputX,
    inputY,
    tipo
){

    if(!inputX || !inputY){

        return;

    }


    function aplicar(){

        const x =
            Math.max(
                0,
                Number(inputX.value) || 0
            );


        const y =
            Math.max(
                0,
                Number(inputY.value) || 0
            );


        cardStatsPositions[tipo].x =
            x;


        cardStatsPositions[tipo].y =
            y;


        if(
            obtenerTipoDispositivoCardStats()
            === tipo
        ){

            const stats =
                document.getElementById(
                    "cardStats"
                );


            if(stats){

                stats.style.left =
                    x + "px";


                stats.style.top =
                    y + "px";

            }

        }


        guardarTodasLasPosicionesCardStats();

    }


    inputX.addEventListener(
        "input",
        aplicar
    );


    inputY.addEventListener(
        "input",
        aplicar
    );

}


/*====================================================
    BLOQUEAR POSICIÓN WEB
====================================================*/

if(cardStatsWebLock){

    cardStatsWebLock.addEventListener(
        "change",
        () => {

            cardStatsPositions.web.locked =
                cardStatsWebLock.checked;


            guardarTodasLasPosicionesCardStats();

        }
    );

}


/*====================================================
    BLOQUEAR POSICIÓN CELULAR
====================================================*/

if(cardStatsMobileLock){

    cardStatsMobileLock.addEventListener(
        "change",
        () => {

            cardStatsPositions.mobile.locked =
                cardStatsMobileLock.checked;


            guardarTodasLasPosicionesCardStats();

        }
    );

}


/*====================================================
    CONECTAR INPUTS WEB
====================================================*/

conectarInputPosicionCardStats(

    cardStatsWebX,

    cardStatsWebY,

    "web"

);


/*====================================================
    CONECTAR INPUTS CELULAR
====================================================*/

conectarInputPosicionCardStats(

    cardStatsMobileX,

    cardStatsMobileY,

    "mobile"

);


/*====================================================
    CAMBIAR ENTRE WEB Y CELULAR
====================================================*/

window.addEventListener(
    "resize",
    () => {

        aplicarPosicionCardStats();

        cargarPosicionesEnModal();

    }
);


/*====================================================
    INICIALIZAR
====================================================*/

activarArrastreCardStats();

cargarPosicionesCardStats();







/*====================================================
    COLOR AUTOMÁTICO DE ICONOS CARDSTATS
====================================================*/

function actualizarColorIconosCardStats() {

    const stats =
        document.getElementById("cardStats");

    if (!stats) {
        return;
    }


    /*
     * cardStats está directamente dentro de .card
     */
    const card =
        stats.parentElement;

    if (!card) {
        return;
    }


    const estilo =
        getComputedStyle(card);


    const backgroundColor =
        estilo.backgroundColor;

    const backgroundImage =
        estilo.backgroundImage;


    let r = null;
    let g = null;
    let b = null;


    /*================================================
        1. BUSCAR COLORES EN EL GRADIENTE
    =================================================*/

    const colores =
        backgroundImage.match(
            /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+[\d.]+)?\s*\)/g
        );


    if (
        colores &&
        colores.length > 0
    ) {

        let sumaR = 0;
        let sumaG = 0;
        let sumaB = 0;

        let cantidad = 0;


        colores.forEach(color => {

            const rgb =
                color.match(
                    /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/
                );

            if (!rgb) {
                return;
            }


            sumaR += Number(rgb[1]);
            sumaG += Number(rgb[2]);
            sumaB += Number(rgb[3]);

            cantidad++;

        });


        if (cantidad > 0) {

            r = sumaR / cantidad;
            g = sumaG / cantidad;
            b = sumaB / cantidad;

        }

    }


    /*================================================
        2. SI NO HAY GRADIENTE → USAR COLOR
    =================================================*/

    if (
        r === null ||
        g === null ||
        b === null
    ) {

        const rgb =
            backgroundColor.match(
                /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/
            );


        if (rgb) {

            r = Number(rgb[1]);
            g = Number(rgb[2]);
            b = Number(rgb[3]);

        }

    }


    /*================================================
        3. SI TODAVÍA NO HAY COLOR
    =================================================*/

    if (
        r === null ||
        g === null ||
        b === null
    ) {

        return;

    }


    /*================================================
        4. LUMINOSIDAD
    =================================================*/

    const luminosidad =
        (
            r * 299 +
            g * 587 +
            b * 114
        ) / 1000;


    /*================================================
        5. COLOR FINAL
    =================================================*/

    const colorIconos =
        luminosidad >= 150
            ? "#000000"
            : "#ffffff";


    /*================================================
        6. APLICAR
    =================================================*/

    stats.style.setProperty(
        "--card-stats-icon-color",
        colorIconos
    );


    console.log(
        "CARDSTATS → fondo:",
        backgroundColor
    );

    console.log(
        "CARDSTATS → imagen:",
        backgroundImage
    );

    console.log(
        "CARDSTATS → RGB:",
        Math.round(r),
        Math.round(g),
        Math.round(b)
    );

    console.log(
        "CARDSTATS → luminosidad:",
        Math.round(luminosidad)
    );

    console.log(
        "CARDSTATS → iconos:",
        colorIconos
    );
}


function detectarColorFondoCardStats() {

    const card =
        document.querySelector(".card");

    const stats =
        document.getElementById("cardStats");


    if (!card || !stats) {
        return;
    }


    const rect =
        stats.getBoundingClientRect();


    /*
        Tomamos el centro de cardStats.
    */

    const x =
        rect.left +
        rect.width / 2;


    const y =
        rect.top +
        rect.height / 2;


    /*
        Ocultamos temporalmente cardStats
        para poder consultar qué hay detrás.
    */

    const visibilidad =
        stats.style.visibility;


    stats.style.visibility =
        "hidden";


    const elementoDebajo =
        document.elementFromPoint(
            x,
            y
        );


    stats.style.visibility =
        visibilidad;


    if (!elementoDebajo) {
        return;
    }


    /*
        Buscamos la tarjeta real.
    */

    const tarjeta =
        elementoDebajo.closest(".card");


    if (!tarjeta) {
        return;
    }


    const estilo =
        getComputedStyle(tarjeta);


    /*
        Si tenemos un color sólido,
        lo utilizamos.
    */

    const rgb =
        estilo.backgroundColor.match(
            /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/
        );


    if (!rgb) {
        return;
    }


    const r =
        Number(rgb[1]);

    const g =
        Number(rgb[2]);

    const b =
        Number(rgb[3]);


    const luminosidad =
        (
            r * 299 +
            g * 587 +
            b * 114
        ) / 1000;


    const color =
        luminosidad >= 150
            ? "#000000"
            : "#ffffff";


    stats.style.setProperty(
        "--card-stats-icon-color",
        color
    );
}


/*====================================================
            GUARDAR BOTONES
====================================================*/

let guardandoBotones = false;
let guardarBotonesPendiente = false;

async function guardarBotones(){

    const contenedor =
        document.getElementById("linksContainer");

    if(!contenedor) return;

    if(guardandoBotones){

        guardarBotonesPendiente = true;

        return;

    }

    guardandoBotones = true;

    try{

        do{

            guardarBotonesPendiente = false;

            const datos = [];

            contenedor
                .querySelectorAll(".link-card")
                .forEach(card => {

                    const span =
                        card.querySelector(".center span");

                    const icon =
                        card.querySelector(".left i");

                    if(!span || !icon) return;

                    datos.push({

                        texto:
                            span.innerText.trim(),

                        icono:
                            icon.className,

                        url:
                            card.dataset.url || "",

                        textColor:
                            card.dataset.textColor ||
                            "#ffffff",

                        description:
                            card.dataset.description ||
                            "",

                        newTab:
                            card.dataset.newTab === "true",

                        socialName:
                            card.dataset.socialName || "",

                        infoName:
                            card.dataset.infoName || "",

                        infoDescription:
                            card.dataset.infoDescription || "",

                        socialUsername:
                            card.dataset.socialUsername || "",

                        socialPhone:
                            card.dataset.socialPhone || "",

                        socialPhoto:
                            card.dataset.socialPhoto || "",

                        socialFollowing:
                            card.dataset.socialFollowing || "",

                        socialFollowers:
                            card.dataset.socialFollowers || "",

                        socialLikes:
                            card.dataset.socialLikes || "",

                        youtubeDescription:
                            card.dataset.youtubeDescription || "",

                        socialPanelColor:
                            card.dataset.socialPanelColor ||
                            "#202020",

                        socialPanelTextColor:
                            card.dataset.socialPanelTextColor ||
                            "#ffffff"

                    });

                });

            const respuesta = await fetch("/botones", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(datos)

            });

            if(!respuesta.ok){

                throw new Error(
                    `HTTP ${respuesta.status}`
                );

            }

      

        }while(guardarBotonesPendiente);

    }catch(error){

        console.error(
            "Error guardando botones:",
            error
        );

    }finally{

        guardandoBotones = false;

    }

}

/*====================================================
                PASO 10
            CARGAR BOTONES
====================================================*/

async function cargarBotones() {

    const contenedor =
        document.getElementById("linksContainer");

    if (!contenedor) return;

    try {

        const respuesta =
            await fetch("/botones", {
                cache: "no-store"
            });

        if(!respuesta.ok){

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }

        const botonesServidor =
            await respuesta.json();

        if(!Array.isArray(botonesServidor)){

            throw new Error(
                "La respuesta de /botones no es un arreglo."
            );

        }

        /*
            Primero validamos los datos del servidor.
            Después limpiamos el HTML inicial.
            Durante esta carga NO se llama guardarBotones().
        */

        contenedor.innerHTML = "";

        botonesServidor.forEach(btn => {

            agregarBoton(

                btn.texto,
                btn.icono,
                btn.url,
                btn.textColor,
                btn.description,
                btn.newTab,
                {
                    socialName: btn.socialName || "",
                    infoName: btn.infoName || "",
                    infoDescription: btn.infoDescription || btn.description || "",
                    socialUsername: btn.socialUsername || "",
                    socialPhone: btn.socialPhone || "",
                    socialPhoto: btn.socialPhoto || "",
                    socialFollowing: btn.socialFollowing || "",
                    socialFollowers: btn.socialFollowers || "",
                    socialLikes: btn.socialLikes || "",
                    youtubeDescription:
                        btn.youtubeDescription || "",
                    socialPanelColor:
                        btn.socialPanelColor || "#202020",
                    socialPanelTextColor:
                        btn.socialPanelTextColor || "#ffffff"
                }

            );

        });

    } catch (error) {

        console.error(
            "Error cargando botones:",
            error
        );

        /*
            IMPORTANTE:
            Si /botones falla, NO se recuperan los botones
            escritos en index.html. El servidor es la única
            fuente de verdad para la carga inicial.
        */

       

    }

    activarBotonesInfoUsuario();

}


 /*====================================================
        CONTADOR DESCRIPCIÓN DEL BOTÓN
        MÁXIMO 30 CARACTERES
====================================================*/

const linkDescription =
    document.getElementById("linkDescription");

const contadorDescripcionBoton =
    document.getElementById("contadorDescripcionBoton");


function actualizarContadorDescripcionBoton() {

    if (
        !linkDescription ||
        !contadorDescripcionBoton
    ) {
        return;
    }

    contadorDescripcionBoton.textContent =
        `${linkDescription.value.length} / 30`;

}


if (linkDescription) {

    linkDescription.addEventListener(
        "input",
        actualizarContadorDescripcionBoton
    );

}


function cambiarTema(){

    document.body.classList.toggle("dark");

    const esModoOscuro = document.body.classList.contains("dark");

    configuracion.theme = esModoOscuro ? "dark" : "light";

    /*=========================================
        DESCRIPCIÓN DEL PERFIL
    =========================================*/

    const textColor = document.getElementById("descriptionTextColor");
    const backgroundColor = document.getElementById("descriptionBackgroundColor");
    const descripcion = document.getElementById("description");




if(esModoOscuro){

    textColor.value = "#ffffff";
    backgroundColor.value = "#2b2b2b";

    descripcion.style.color = "#ffffff";
    descripcion.style.backgroundColor = "#2b2b2b";

}else{

    textColor.value =
        configuracion.descriptionTextColor;

    backgroundColor.value =
        configuracion.descriptionBackgroundColor;

    descripcion.style.color =
        configuracion.descriptionTextColor;

    descripcion.style.backgroundColor =
        configuracion.descriptionBackgroundColor;

}
    guardarConfiguracionServidor();

}


const btnTheme =
document.getElementById("btnTheme");

btnTheme.onclick=()=>{

    cambiarTema();

    btnTheme.innerHTML=
document.body.classList.contains("dark")

?

'<i class="fa-solid fa-sun"></i>'

:

'<i class="fa-solid fa-moon"></i>';

}


/*================================================== 
                ACTIVAR GLASS
==================================================*/ 


async function activarGlass() {

    const card = document.querySelector(".card");

    if (!card) return;

    card.classList.toggle("glass");

    configuracion.glass =
        card.classList.contains("glass");

    await guardarConfiguracionServidor();





}


/*================================================== 
                ACTIVAR NEUMORPHISM
==================================================*/ 


async function activarNeumorphism() {

    const card = document.querySelector(".card");

    if (!card) return;

    card.classList.toggle("neumorphism");

    configuracion.neumorphism =
        card.classList.contains("neumorphism");

    await guardarConfiguracionServidor();



   

}


/*==================================================
            DRAG & DROP
==================================================*/

function activarDragDrop(){

    const container = document.getElementById("linksContainer");

    const cards = container.querySelectorAll(".link-card");

    cards.forEach(card=>{

        card.draggable = true;

        card.ondragstart = ()=>{

            card.classList.add("dragging");

        };

        card.ondragend = ()=>{

            card.classList.remove("dragging");

            document.querySelectorAll(".drag-over")
            .forEach(c=>c.classList.remove("drag-over"));

            guardarBotones();

        };

    });

}

const containerDrag = document.getElementById("linksContainer");

containerDrag.ondragover = (e)=>{

    e.preventDefault();

    const dragging =
    document.querySelector(".dragging");

    if(!dragging) return;

    const afterElement =
    getDragAfterElement(containerDrag,e.clientY);

    document.querySelectorAll(".drag-over")
    .forEach(card=>card.classList.remove("drag-over"));

    if(afterElement){

        afterElement.classList.add("drag-over");

        containerDrag.insertBefore(
            dragging,
            afterElement
        );

    }else{

        containerDrag.appendChild(dragging);

    }

};

function getDragAfterElement(container,y){

    const elements=[...container.querySelectorAll(".link-card:not(.dragging)")];

    return elements.reduce((closest,child)=>{

        const box=child.getBoundingClientRect();

        const offset=y-box.top-box.height/2;

        if(offset<0 && offset>closest.offset){

            return{

                offset:offset,

                element:child

            };

        }else{

            return closest;

        }

    },{

        offset:Number.NEGATIVE_INFINITY

    }).element;

}



/*====================================
        ADMINISTRADOR
=====================================*/



const adminModal=document.getElementById("adminModal");

const footerLogo = document.getElementById("footerLogo");

document
.getElementById("footerLogo")
.onclick = () => {

    adminModal.style.display = "flex";

};



adminModal.onclick=(e)=>{

    if(e.target===adminModal)

        adminModal.style.display="none";

};



/*====================================
     BOTON LOGIN
=====================================*/

document
.getElementById("loginAdmin")
.onclick = async () => {

    const user =
        document
        .getElementById("adminUser")
        .value
        .trim();

    const pass =
        document
        .getElementById("adminPass")
        .value;


    if (!user || !pass) {

        alert(
            "Introduce usuario y contraseña."
        );

        return;

    }


    try {

        const respuesta =
            await fetch("/admin/login", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    usuario: user,

                    password: pass

                })

            });


        const datos =
            await respuesta.json();


        if (!respuesta.ok || !datos.ok) {

            alert(
                datos.error ||
                "Usuario o contraseña incorrectos."
            );

            return;

        }


        adminModal.style.display =
            "none";


        document
        .getElementById("adminUser")
        .value = "";


        document
        .getElementById("adminPass")
        .value = "";


        mostrarControles();


    } catch (error) {

        console.error(
            "Error iniciando sesión:",
            error
        );


        alert(
            "No se pudo conectar con el servidor."
        );

    }

};





function mostrarControles(){

     administradorActivo =
        true;

    document.body.classList.add("admin-mode");
    document.body.classList.remove("user-mode");

    document.querySelectorAll(".admin-only").forEach(el=>{
        el.style.display="";
    });

    document.querySelectorAll(".options").forEach(btn=>{
        btn.style.display="flex";
    });

    document.querySelectorAll(".user-info-toggle").forEach(btn=>{
        btn.style.display="none";
    });

    activarBotonesInfoUsuario();

    activarBotones();

    activarLinks();

    activarDragDrop();

      /*
        HABILITAR MOVIMIENTO DE CARDSTATS
        SOLO PARA ADMIN
    */


    cardStatsAdminPuedeMover = true;

     /*
        EL ADMINISTRADOR YA TIENE
        SU PROPIO CONTROL DE MÚSICA.

        NO MOSTRAR BOTÓN DEL USUARIO.
    */

   

    /*=========================================
        OCULTAR BOTÓN DE MÚSICA DEL USUARIO

        EL ADMINISTRADOR YA TIENE
        SU PROPIO BOTÓN DE MÚSICA.
    =========================================*/

    if(musicUserButton){

    musicUserButton.style.display =
        "none";

}

}



function ocultarControles(){

 administradorActivo =
        false;

    document.body.classList.remove("admin-mode");
    document.body.classList.add("user-mode");


    document.querySelectorAll(".admin-only").forEach(el=>{
        el.style.display="none";
    });


    document.querySelectorAll(".options").forEach(btn=>{
        btn.style.display="none";
    });

    document.querySelectorAll(".user-info-toggle").forEach(btn=>{
        btn.style.display="flex";
    });

    activarBotonesInfoUsuario();


    cardStatsAdminPuedeMover =
        false;


    /*=========================================
        BOTÓN DE MÚSICA DEL USUARIO

        SOLO SE MUESTRA SI EL ADMINISTRADOR
        TIENE LA MÚSICA ACTIVADA.
    =========================================*/

    if(
        musicUserButton &&
        musicaUsuarioPermitida
    ){

        musicUserButton.style.display =
            "flex";


        actualizarBotonMusicaUsuario();

    }

}



/*==============================
      CERRAR SESIÓN
==============================*/
document
.getElementById("logoutAdmin")
.onclick = async () => {

    await fetch("/admin/logout", {
        method: "POST"
    });

    ocultarControles();

    adminModal.style.display = "none";

};



async function cargarEstadoAdmin(){

    const res=await fetch("/admin/status");

    const datos=await res.json();

    if(datos.admin){

        mostrarControles();

    }else{

        ocultarControles();

    }

}




/*====================================================
            PASO 14
        INICIALIZAR APLICACIÓN
====================================================*/


/*====================================================
        EDITOR DE ICONOS DE REDES
====================================================*/

const REDES_ICONOS = {
    whatsapp: { nombre:"WhatsApp", icono:"fab fa-whatsapp" },
    facebook: { nombre:"Facebook", icono:"fab fa-facebook" },
    instagram: { nombre:"Instagram", icono:"fab fa-instagram" },
    tiktok: { nombre:"TikTok", icono:"fab fa-tiktok" },
    youtube: { nombre:"YouTube", icono:"fab fa-youtube" },
    telegram: { nombre:"Telegram", icono:"fab fa-telegram" },
    linkedin: { nombre:"LinkedIn", icono:"fab fa-linkedin" },
    github: { nombre:"GitHub", icono:"fab fa-github" },
    x: { nombre:"X", icono:"fab fa-x-twitter" },
    web: { nombre:"Web", icono:"fa-solid fa-globe" }
};

function normalizarRedesSociales(){

    if(typeof configuracion.socialIconsEnabled !== "boolean"){
        configuracion.socialIconsEnabled = true;
    }

    if(!Array.isArray(configuracion.socialIcons)){
        configuracion.socialIcons = [
            {tipo:"whatsapp", url:"https://api.whatsapp.com/"},
            {tipo:"facebook", url:"https://www.facebook.com/"},
            {tipo:"instagram", url:"https://www.instagram.com/"},
            {tipo:"tiktok", url:"https://www.tiktok.com/"},
            {tipo:"youtube", url:"https://www.youtube.com/"}
        ];
    }

    configuracion.socialIcons =
        configuracion.socialIcons
            .filter(red => red && REDES_ICONOS[red.tipo])
            .slice(0,6);

    if(!configuracion.socialIconsColor){
        configuracion.socialIconsColor = "#ffffff";
    }

    if(
        configuracion.socialIconsPosition !== "bottom" &&
        configuracion.socialIconsPosition !== "top"
    ){
        configuracion.socialIconsPosition = "top";
    }
}

function aplicarEstiloIconosRedes(){
    const color =
        configuracion.socialIconsColor || "#ffffff";

    document.documentElement.style.setProperty(
        "--social-icons-color",
        color
    );
}

function renderizarIconosRedes(){
    normalizarRedesSociales();

    const area =
        document.getElementById("socialNetworksArea");
    const container =
        document.getElementById("socialNetworksContainer");
    const links =
        document.getElementById("linksContainer");
    const card =
        document.querySelector(".card");

    if(!area || !container || !links || !card){
        return;
    }

    container.innerHTML = "";

    configuracion.socialIcons.forEach(red => {
        const meta = REDES_ICONOS[red.tipo];
        if(!meta) return;

        const a = document.createElement("a");
        a.className = "social-network-icon";
        a.href = red.url || "#";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.title = meta.nombre;
        a.dataset.type = red.tipo;
        a.innerHTML = `<i class="${meta.icono}"></i>`;

        if(!red.url){
            a.addEventListener("click", e => e.preventDefault());
        }

        container.appendChild(a);
    });

    aplicarEstiloIconosRedes();

    if(configuracion.socialIconsPosition === "bottom"){
        card.insertBefore(area, null);
        card.appendChild(area);
    }else{
        card.insertBefore(area, links);
    }

    const iconosActivos =
        configuracion.socialIconsEnabled !== false;

    container.style.display =
        iconosActivos ? "flex" : "none";

    const adminBtn =
        document.getElementById("socialNetworksAdminButton");

    if(adminBtn){
        adminBtn.style.display =
            administradorActivo ? "flex" : "none";
    }

    /*
        El área permanece visible para el administrador aunque
        los iconos estén desactivados, para conservar el botón
        "Editar iconos de redes".
    */
    area.style.display =
        (
            iconosActivos &&
            configuracion.socialIcons.length
        ) || administradorActivo
            ? "flex"
            : "none";
}




/*
    La fila conserva el tipo aunque se vuelva a renderizar.
*/
function crearFilaRedSocial(red, indice){
    const meta =
        REDES_ICONOS[red.tipo] || REDES_ICONOS.web;

    const fila = document.createElement("div");
    fila.className = "social-network-row";
    fila.dataset.index = indice;
    fila.dataset.type = red.tipo;

    fila.innerHTML = `
        <div class="social-network-row-icon">
            <i class="${meta.icono}"></i>
        </div>

        <div class="social-network-row-main">
            <strong>${escaparHTML(meta.nombre)}</strong>
            <input
                type="url"
                class="social-network-url"
                placeholder="https://..."
                value="${escaparHTML(red.url || "")}">
        </div>

        <button
            type="button"
            class="social-network-remove"
            title="Eliminar icono"
            aria-label="Eliminar ${escaparHTML(meta.nombre)}">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    fila.querySelector(".social-network-remove").onclick = () => {
        fila.remove();
    };

    return fila;
}


/*====================================================
    RENDERIZAR FILAS DEL EDITOR DE REDES
====================================================*/

function renderizarFilasEditorRedes(){

    const contenedor =
        document.getElementById("socialNetworkRows");

    if(!contenedor){
        return;
    }

    contenedor.innerHTML = "";

    normalizarRedesSociales();

    configuracion.socialIcons.forEach((red, indice) => {

        const fila =
            crearFilaRedSocial(red, indice);

        contenedor.appendChild(fila);

    });
}


function leerFilasEditorRedes(){

    const filas =
        document.querySelectorAll(
            "#socialNetworkRows .social-network-row"
        );

    const redes = [];

    filas.forEach(fila => {

        const tipo =
            fila.dataset.type;

        const input =
            fila.querySelector(".social-network-url");

        if(!tipo || !REDES_ICONOS[tipo]){
            return;
        }

        redes.push({
            tipo: tipo,
            url: input ? input.value.trim() : ""
        });

    });

    return redes.slice(0, 6);
}

function abrirEditorIconosRedes(){
    normalizarRedesSociales();

    const modal =
        document.getElementById("socialNetworksModal");

    if(!modal) return;

    renderizarFilasEditorRedes();

    const posicion =
        document.getElementById("socialNetworksPosition");

    if(posicion){
        posicion.value =
            configuracion.socialIconsPosition;
    }

    const picker =
        document.getElementById("socialNetworksColorPicker");

    if(picker){
        const actual =
            configuracion.socialIconsColor || "#ffffff";
        picker.value =
            rgbObjetoAHex(
                obtenerRGBDesdeColor(actual)
            );
        picker.dataset.colorFinal = actual;
    }

    const socialIconsEnabled =
        document.getElementById("socialIconsEnabled");

    if(socialIconsEnabled){
        socialIconsEnabled.checked =
            configuracion.socialIconsEnabled !== false;
    }

    cerrarTodosLosModales();

    modal.style.display = "flex";
    guardarEstadoModal(modal);
}

function activarEditorIconosRedes(){
    normalizarRedesSociales();

    const abrir =
        document.getElementById("socialNetworksAdminButton");

    const modal =
        document.getElementById("socialNetworksModal");

    const select =
        document.getElementById("socialNetworkSelect");

    const add =
        document.getElementById("addSocialNetwork");

    const save =
        document.getElementById("saveSocialNetworks");

    const close =
        document.getElementById("closeSocialNetworks");

    const colorBtn =
        document.getElementById("socialNetworksColor");

    const picker =
        document.getElementById("socialNetworksColorPicker");

    if(abrir && abrir.dataset.bound !== "true"){
        abrir.dataset.bound = "true";
        abrir.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            abrirEditorIconosRedes();
        };
    }

    if(add && add.dataset.bound !== "true"){
        add.dataset.bound = "true";
        add.onclick = () => {
            const rows =
                document.querySelectorAll(
                    "#socialNetworkRows .social-network-row"
                );

            if(rows.length >= 6){
                mostrarNotificacionGuardado(
                    "Límite alcanzado",
                    "Solo puedes crear máximo 6 iconos de redes."
                );
                return;
            }

            const tipo =
                select?.value || "web";

            const fila =
                crearFilaRedSocial(
                    {tipo, url:""},
                    rows.length
                );

            document.getElementById(
                "socialNetworkRows"
            )?.appendChild(fila);
        };
    }

    if(save && save.dataset.bound !== "true"){
        save.dataset.bound = "true";
        save.onclick = async () => {
            const filas =
                leerFilasEditorRedes();

            if(filas.length > 6){
                mostrarNotificacionGuardado(
                    "Límite alcanzado",
                    "Solo puedes tener máximo 6 iconos."
                );
                return;
            }

            const posicion =
                document.getElementById(
                    "socialNetworksPosition"
                )?.value || "top";

            const socialIconsEnabled =
                document.getElementById(
                    "socialIconsEnabled"
                );

            configuracion.socialIconsEnabled =
                socialIconsEnabled
                    ? socialIconsEnabled.checked
                    : configuracion.socialIconsEnabled !== false;

            configuracion.socialIcons = filas;
            configuracion.socialIconsPosition = posicion;

            aplicarEstiloIconosRedes();
            renderizarIconosRedes();

            await guardarConfiguracionServidor();

            cerrarModalDefinitivamente(modal);

            mostrarNotificacionGuardado(
                "Cambios guardados",
                "Los iconos de redes fueron actualizados."
            );
        };
    }

    if(colorBtn && colorBtn.dataset.bound !== "true"){
        colorBtn.dataset.bound = "true";

        colorBtn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();

            if(!picker) return;

            abrirEditorColor({
                picker,
                despuesDeAplicar: async valor => {
                    configuracion.socialIconsColor = valor;
                    picker.dataset.colorFinal = valor;
                    aplicarEstiloIconosRedes();
                    renderizarIconosRedes();
                    await guardarConfiguracionServidor();
                }
            });
        };
    }

    if(close && close.dataset.bound !== "true"){
        close.dataset.bound = "true";

        close.onclick = () => {

            /*-----------------------------------------
                ADVERTENCIA SI EXISTEN CAMBIOS
            -----------------------------------------*/
            if(modalTieneCambios()){

                mostrarAdvertenciaCambios(() => {

                    /* Restaurar todo lo que no se guardó */
                    restaurarEstadoModal();

                    /* Cerrar definitivamente */
                    cerrarModalDefinitivamente(modal);

                });

                return;
            }

            cerrarModalDefinitivamente(modal);
        };
    }

    renderizarIconosRedes();
}

/*====================================================
    MODO CELULAR: PRIORIZAR ORIENTACIÓN VERTICAL
====================================================*/

function intentarBloquearOrientacionVertical(){
    try{
        if(
            window.screen &&
            screen.orientation &&
            typeof screen.orientation.lock === "function"
        ){
            screen.orientation.lock("portrait").catch(() => {});
        }
    }catch(error){
        // Los navegadores pueden impedir el bloqueo fuera de PWA/fullscreen.
    }
}

async function inicializarAplicacion() {

 
 try{
/*----------------------------------
        PASO 0
----------------------------------*/

await cargarConfiguracion();

/*----------------------------------
    NUEVO PASO
    CARGAR TODAS LAS FUENTES
----------------------------------*/

await cargarFuentes();

/*----------------------------------
        PASO 1
----------------------------------*/

restaurarTema();
    /*----------------------------------
        PASO 2
    ----------------------------------*/

    restaurarLogo();

    /*----------------------------------
        PASO 3
    ----------------------------------*/

    restaurarTitulo();



if (configuracion.titleFont) {

    const existe = [...fuenteTitulo.options].some(
        op => op.value === configuracion.titleFont
    );

    if (existe) {

        fuenteTitulo.value = configuracion.titleFont;

        title.style.fontFamily = configuracion.titleFont;

        subtitle.style.fontFamily = configuracion.titleFont;

    }

    

}




    /*----------------------------------
        PASO 4
    ----------------------------------*/


    restaurarColores();




    /*----------------------------------
        PASO 5
    ----------------------------------*/

    restaurarFuente();

    /*----------------------------------
        PASO 6
    ----------------------------------*/

    restaurarRadius();

    /*----------------------------------
        PASO 7
    ----------------------------------*/

    restaurarVelocidadAnimaciones();

    /*----------------------------------
        PASO 8
    ----------------------------------*/

    restaurarGlass();

    /*----------------------------------
        PASO 9
    ----------------------------------*/

    restaurarNeumorphism();

    /*----------------------------------
        PASO 10
    ----------------------------------*/

    await cargarBotones();

    /*----------------------------------
        PASO 11
    ----------------------------------*/

    activarBotones();

    /*----------------------------------
        PASO 12
    ----------------------------------*/

    activarLinks();

    /*----------------------------------
        PASO 13
    ----------------------------------*/

    activarDragDrop();

    /*----------------------------------
        PASO 14
    ----------------------------------*/    
    
    await cargarEstadoAdmin();

    /*----------------------------------
        REDES SOCIALES
    ----------------------------------*/
    normalizarRedesSociales();
    aplicarEstiloIconosRedes();
    activarEditorIconosRedes();
    renderizarIconosRedes();
    intentarBloquearOrientacionVertical();

    /*----------------------------------
    MÚSICA DEL SITIO
----------------------------------*/

await iniciarMusicaUsuario();

 }catch(error){

    console.error(
        "Error inicializando la aplicación:",
        error
    );

 }finally{

    document.body.classList.remove("app-loading");

    document.body.classList.add("app-ready");

 }

}

/*====================================================
        INICIO DEL SISTEMA
====================================================*/

window.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await inicializarAplicacion();
        setTimeout(() => {

    const d = document.getElementById("description");



}, 1000);

    }

);

let guardandoConfiguracion = false;




async function guardarConfiguracionServidor(){

    if(guardandoConfiguracion){

        return;

    }

    guardandoConfiguracion = true;

    try{

        await fetch("/config",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(configuracion)

        });

    }finally{

        guardandoConfiguracion = false;

    }

}


function actualizarColorFooter() {


      // Solo en celulares
    if (window.innerWidth > 768) {

        return;

    }

    const card = document.querySelector(".card");
    const footer = document.querySelector(".creator-footer");

    if (!card || !footer) return;

    const enlace = footer.querySelector("a");
    const logo = footer.querySelector("img");

    const color = getComputedStyle(card).backgroundColor;

    const rgb = color.match(/\d+/g);

    if (!rgb) return;

    const r = Number(rgb[0]);
    const g = Number(rgb[1]);
    const b = Number(rgb[2]);

    const luminosidad = (r * 299 + g * 587 + b * 114) / 1000;

    if (luminosidad > 170) {

        enlace.style.color = "#000";
        enlace.style.textShadow = "0 1px 3px rgba(255,255,255,.5)";
        logo.style.borderColor = "#000";

    } else {

        enlace.style.color = "#fff";
        enlace.style.textShadow = "0 2px 8px rgba(0,0,0,.8)";
        logo.style.borderColor = "#fff";

    }

}



window.addEventListener("resize", () => {

    if (window.innerWidth <= 768) {

        actualizarColorFooter();

    } else {

        const enlace = document.querySelector(".creator-footer a");
        const logo = document.querySelector("#footerLogo");

        enlace.style.color = "";
        enlace.style.textShadow = "";
        logo.style.borderColor = "";

    }

});


/*====================================================*
    CREAR PATRÓN ESCALONADO SVG
*====================================================*/

function crearPatronMarcaAgua(){

    const contenedor =
        document.querySelector(
            ".card-watermark-container"
        );

    if(!contenedor){
        return;
    }

    /*
        Limpiar patrón anterior
    */

    contenedor.innerHTML = "";

    /*
        Si no existe SVG,
        no crear nada.
    */

    if(!configuracion.cardWatermark){
        return;
    }

    /*
        TAMAÑO DEL SVG
    */

    const tamanoLogo = 65;

    /*
        DISTANCIA ENTRE LOGOS
    */

    const separacionX = 180;

    const separacionY = 140;

    /*
        Área suficientemente grande
    */

    const ancho =
        contenedor.offsetWidth ||
        1000;

    const alto =
        contenedor.offsetHeight ||
        1000;

    /*
        Cantidad de columnas
    */

    const columnas =
        Math.ceil(
            ancho / separacionX
        ) + 4;

    /*
        Cantidad de filas
    */

    const filas =
        Math.ceil(
            alto / separacionY
        ) + 4;

    /*
        Crear filas
    */

    for(
        let fila = -2;
        fila < filas;
        fila++
    ){

        /*
            ESCALONAMIENTO
        */

        const desplazamiento =
            fila % 2 === 0
                ? 0
                : separacionX / 2;

        for(
            let columna = -2;
            columna < columnas;
            columna++
        ){

            const logo =
                document.createElement(
                    "img"
                );

            logo.className =
                "card-watermark-item";

            /*
                ANIMACIÓN ESCALONADA
            */

            logo.style.animationDelay =
                (
                    (fila + columna) *
                    -0.45
                ) + "s";

            /*
                SVG
            */

            logo.src =
                configuracion.cardWatermark;

            /*
                Posición horizontal
            */

            logo.style.left =
                (
                    columna *
                    separacionX
                    +
                    desplazamiento
                ) + "px";

            /*
                Posición vertical
            */

            logo.style.top =
                (
                    fila *
                    separacionY
                ) + "px";

            /*
                Tamaño
            */

            logo.style.width =
                tamanoLogo + "px";

            logo.style.height =
                tamanoLogo + "px";

            /*
                Agregar al contenedor
            */

            contenedor.appendChild(
                logo
            );

        }

    }

}


/*====================================================
    ACTUALIZAR PATRÓN AL CAMBIAR TAMAÑO
====================================================*/

window.addEventListener(
    "resize",
    () => {

        if(
            configuracion.cardWatermark
        ){

            crearPatronMarcaAgua();

        }

    }
);






/*====================================================
    ABRIR EDITOR DE ESTADÍSTICAS
====================================================*/

if (cardStatsAdminButton) {

    cardStatsAdminButton.onclick =
        async () => {

            try {

                /*
                    Verificar nuevamente
                    que realmente sea admin.
                */

                const respuesta =
                    await fetch(
                        "/admin/status",
                        {
                            cache: "no-store"
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!datos.admin) {

                    alert(
                        "No autorizado."
                    );

                    return;

                }




                /*
                    Necesitamos los tres
                    contadores, así que usamos
                    una ruta administrativa.
                */

                const stats =
                    await obtenerEstadisticasAdmin();


                adminViewsCounter.value =
                    stats.views;

                adminLikesCounter.value =
                    stats.likes;

                adminSharesCounter.value =
                    stats.shares;

                    await cargarPosicionesCardStats();

                cargarPosicionesEnModal();


                cerrarTodosLosModales();


                cardStatsModal.style.display =
                    "flex";


                guardarEstadoModal(
                    cardStatsModal
                );


            } catch (error) {

                console.error(
                    "Error abriendo editor de estadísticas:",
                    error
                );

                alert(
                    "No se pudieron cargar las estadísticas."
                );

            }

        };

}


/*====================================================
    OBTENER ESTADÍSTICAS ADMIN
====================================================*/

async function obtenerEstadisticasAdmin() {

    const respuesta =
        await fetch(
            "/admin/stats",
            {
                cache: "no-store"
            }
        );


    if (!respuesta.ok) {

        throw new Error(
            `HTTP ${respuesta.status}`
        );

    }


    const datos =
        await respuesta.json();


    if (!datos.ok) {

        throw new Error(
            datos.error ||
            "No se pudieron obtener estadísticas."
        );

    }


    return datos;

}

/*====================================================
    GUARDAR ESTADÍSTICAS
====================================================*/

if (saveCardStats) {

    saveCardStats.onclick =
        async () => {

            const views =
                Number(
                    adminViewsCounter.value
                );

            const likes =
                Number(
                    adminLikesCounter.value
                );

            const shares =
                Number(
                    adminSharesCounter.value
                );


            /*
                VALIDACIONES
            */

            if (
                !Number.isInteger(views) ||
                views < 0 ||
                views > 1000000000
            ) {

                alert(
                    "Las visualizaciones deben ser un número entero entre 0 y 1,000,000,000."
                );

                adminViewsCounter.focus();

                return;

            }


            if (
                !Number.isInteger(likes) ||
                likes < 0 ||
                likes > 1000000000
            ) {

                alert(
                    "Los likes deben ser un número entero entre 0 y 1,000,000,000."
                );

                adminLikesCounter.focus();

                return;

            }


            if (
                !Number.isInteger(shares) ||
                shares < 0 ||
                shares > 1000000000
            ) {

                alert(
                    "Los compartidos deben ser un número entero entre 0 y 1,000,000,000."
                );

                adminSharesCounter.focus();

                return;

            }


            try {

                const respuesta =
                    await fetch(
                        "/admin/stats",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    views,
                                    likes,
                                    shares
                                })
                        }
                    );


                const datos =
                    await respuesta.json();


                if (
                    !respuesta.ok ||
                    !datos.ok
                ) {

                    throw new Error(
                        datos.error ||
                        "No se pudieron guardar las estadísticas."
                    );

                }


                /*
                    ACTUALIZAR PANTALLA
                */

                cardViewsCounter.textContent =
                    datos.views;

                cardLikesCounter.textContent =
                    datos.likes;

                cardSharesCounter.textContent =
                    datos.shares;


                /*
                    NOTIFICACIÓN
                */

                mostrarNotificacionGuardado(
                    "Estadísticas guardadas",
                    "Los contadores se actualizaron correctamente."
                );


                /*
                    CERRAR SIN ADVERTENCIA
                */

                cerrarModalDefinitivamente(
                    cardStatsModal
                );


            } catch (error) {

                console.error(
                    "Error guardando estadísticas:",
                    error
                );


                alert(
                    error.message ||
                    "No se pudieron guardar las estadísticas."
                );

            }

        };

}


/*====================================================
    REINICIAR ESTADÍSTICAS
====================================================*/

if (resetCardStats) {

    resetCardStats.onclick =
        () => {

            const confirmar =
                confirm(
                    "¿Seguro que deseas reiniciar las visualizaciones, likes y compartidos a 0?"
                );


            if (!confirmar) {

                return;

            }


            adminViewsCounter.value =
                0;

            adminLikesCounter.value =
                0;

            adminSharesCounter.value =
                0;

        };

}





/*====================================================
    ANIMACIÓN DE MUCHOS PULGARES
====================================================*/

function animarPulgares() {

    const cantidad = 18;


    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        const pulgar =
            document.createElement(
                "div"
            );


        pulgar.className =
            "like-float";

/*
        pulgar.innerHTML =
            "👍🏼"; */

/*=========================================
    ICONO PULGAR DENTRO DE BURBUJA
=========================================*/

pulgar.innerHTML = `
    <span class="like-bubble">
        <i class="fa-solid fa-thumbs-up"></i>
    </span>
`;


        /*=================================
            POSICIÓN HORIZONTAL ALEATORIA
        =================================*/

        pulgar.style.left =
            (
                Math.random() * 100
            ) + "%";


        /*=================================
            TAMAÑO ALEATORIO
        =================================*/

        pulgar.style.fontSize =
            (
                18 +
                Math.random() * 22
            ) + "px";


        /*=================================
            DURACIÓN ALEATORIA
        =================================*/

        pulgar.style.animationDuration =
            (
                1.8 +
                Math.random() * 1.7
            ) + "s";


        /*=================================
            RETRASO
        =================================*/

        pulgar.style.animationDelay =
            (
                Math.random() * 0.5
            ) + "s";


        document.body.appendChild(
            pulgar
        );


        setTimeout(() => {

            pulgar.remove();

        }, 4000);

    }

}


