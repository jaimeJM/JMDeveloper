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

            `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

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

if(pickerColor){

    pickerColor.insertAdjacentElement(
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

        return JSON.parse(
            localStorage.getItem(
                HISTORIAL_COLORES
            )
        ) || [];

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
        historial.slice(0,10);


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




const universalColorHistory =
    document.createElement("div");

universalColorHistory.id =
    "universalColorHistory";


universalColorHistory.style.display =
    "flex";


universalColorHistory.style.flexWrap =
    "wrap";


universalColorHistory.style.gap =
    "8px";


const previewParent =
    previewColor.parentElement;


if(previewParent){



    previewParent.appendChild(
        universalColorHistory
    );

}


mostrarHistorialColores();


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
        `rgb(
            ${nuevoRGB.r},
            ${nuevoRGB.g},
            ${nuevoRGB.b}
        )`;


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
    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;


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
        `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;


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

    const valor = configuracion.radius || 28;

    // Restaurar Slider
    if (radius) {

        radius.value = valor;

    }

    // Restaurar todos los botones
    document.querySelectorAll(".link-card").forEach(card => {

        card.style.borderRadius = valor + "px";

    });

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

            preview.classList.toggle(
                "preview-ampliada"
            );

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

bottom:30px;

right:30px;

width:65px;

height:65px;

border:none;

border-radius:50%;

background:#111;

color:white;

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


addButton.onclick = async () => {

    const totalBotones =
        document.querySelectorAll(
            "#linksContainer .link-card"
        ).length;


    if(totalBotones >= LIMITE_BOTONES){

        alert(
            "Solo puedes crear un máximo de " +
            LIMITE_BOTONES +
            " botones."
        );

        return;

    }


    /*
        Crear botón
    */

    agregarBoton();


    /*
        Guardar y ESPERAR
        a que termine el servidor.
    */

    await guardarBotones();


    /*
        Activar eventos
    */

    activarBotones();

    activarLinks();

    activarDragDrop();

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

radius.value=50;

radius.style.width="100%";

radius.style.marginTop="15px";

document.querySelector("#colorModal .modal-content")
.appendChild(radius);


/*==================================================
           GUARDA NUEVO RADIO
==================================================*/
radius.oninput = ()=>{

    document.querySelectorAll(".link-card").forEach(card=>{

        card.style.borderRadius =
        radius.value + "px";

    });

    configuracion.radius =
    Number(radius.value);

   



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

    variableCSS: "--icon-color",

    despuesDeAplicar:(valor)=>{

        document.documentElement.style.setProperty(

            "--icon-color",

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
                EDITOR DE BOTONES
    ====================================================*/

    let botonSeleccionado = null;


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


/*=========================================
    MOSTRAR CONFIRMACIÓN PERSONALIZADA
=========================================*/

mostrarAdvertenciaCambios(

    async () => {

        /*=====================================
            GUARDAR REFERENCIA
        =====================================*/

        const botonEliminado =
            botonSeleccionado;


        /*=====================================
            ELIMINAR DE LA VISTA
        =====================================*/

        botonEliminado.remove();


        /*=====================================
            LIMPIAR SELECCIÓN
        =====================================*/

        botonSeleccionado =
            null;


        /*=====================================
            GUARDAR CAMBIOS
        =====================================*/

        await guardarBotones();


        /*=====================================
            LIMPIAR ESTADO DEL MODAL
        =====================================*/

        modalActivo =
            null;

        estadoInicialModal =
            null;


        /*=====================================
            CERRAR EDITOR DEL BOTÓN
        =====================================*/

        const linkModal =
            document.getElementById(
                "linkModal"
            );

        if(linkModal){

            linkModal.style.display =
                "none";

        }


        /*=====================================
            MOSTRAR NOTIFICACIÓN
        =====================================*/

        mostrarNotificacionGuardado(
            "Botón eliminado",
            "El botón fue eliminado correctamente."
        );

    },

    {

        titulo:
            "¿Deseas eliminar este botón?",

        mensaje:
            "Esta acción eliminará el botón seleccionado.",

        detalle:
            "El botón será eliminado y este cambio se guardará.",

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


    agregarBoton(

        texto + " - Copia",

        icono,

        url,

        colorTexto,

        descripcion,

        nuevaPestana

    );

    
    guardarBotones();

    // Activar eventos únicamente para el nuevo botón
activarBotones();

activarLinks();

activarDragDrop();

};


/*====================================================
            ABRIR ENLACES
====================================================*/

function activarLinks(){

    document
        .querySelectorAll(".link-card")
        .forEach(card => {


        card.onclick = (e) => {


            if(e.target.closest(".options"))

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

    nuevaPestana = false

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


    div.innerHTML = `

        <div class="left">

            <i class="${icono}"></i>

        </div>


                <div class="center">

                    <span style="color:${colorTexto};">

                        ${texto}

                    </span>

                    ${
                        descripcion
                        ? `<small style="color:${colorTexto};">
${descripcion}
</small>`
                        : ""
                    }

                </div>


        <button class="options admin-only">

            <i class="fa-solid fa-ellipsis-vertical"></i>

        </button>

    `;


 
contenedor.appendChild(div);

div.style.borderRadius =
(configuracion.radius || 28) + "px";

div.style.fontFamily =
configuracion.font ||
"'Segoe UI',sans-serif";

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

actualizarColorIconosCardStats();


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


        /*
            LIKE ACTIVADO
        */

        if (datos.liked) {

            cardLikeButton.classList.add(
                "liked"
            );

        }

        /*
            LIKE QUITADO
        */

        else {

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

    /*
        SOLO EL ADMINISTRADOR
        PUEDE MOVER CARDSTATS
    */

    if (!cardStatsAdminPuedeMover) {
        return;
    }


    /*
        El Like siempre debe funcionar.
        No debe iniciar el movimiento.
    */

    if (
        e.target.closest("#cardLikeButton")
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
    GUARDAR POSICIÓN DE CARDSTATS EN SERVIDOR
====================================================*/

async function guardarPosicionCardStats() {

    const stats =
        document.getElementById("cardStats");

    if (!stats) return;


    const posicion = {

        left:
            Math.round(
                stats.offsetLeft
            ),

        top:
            Math.round(
                stats.offsetTop
            )

    };


    try {

        const respuesta =
            await fetch(
                "/card-stats/position",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            posicion
                        )

                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


    } catch (error) {

        console.error(
            "Error guardando posición:",
            error
        );

    }
}



/*====================================================
    RESTAURAR POSICIÓN DE CARDSTATS DESDE SERVIDOR
====================================================*/

async function restaurarPosicionCardStats() {

    const stats =
        document.getElementById("cardStats");

    if (!stats) return;


    try {

        const respuesta =
            await fetch(
                "/card-stats/position",
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const posicion =
            await respuesta.json();


        if (
            !posicion ||
            typeof posicion.left !== "number" ||
            typeof posicion.top !== "number"
        ) {

            return;

        }


        stats.style.transform =
            "none";


        stats.style.left =
            posicion.left + "px";


        stats.style.top =
            posicion.top + "px";


    } catch (error) {

        console.error(
            "Error restaurando posición:",
            error
        );

    }
}

activarArrastreCardStats();
restaurarPosicionCardStats();




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
                            card.dataset.newTab === "true"

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
                btn.newTab

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

}


    
/*====================================================
        CONTADOR DESCRIPCIÓN DEL BOTÓN
====================================================*/

const linkDescription =
    document.getElementById("linkDescription");

const contadorDescripcionBoton =
    document.getElementById("contadorDescripcion");


function actualizarContadorDescripcionBoton(){

    if(!linkDescription || !contadorDescripcionBoton){
        return;
    }

    contadorDescripcionBoton.textContent =
        `${linkDescription.value.length} / 30`;

}


if(linkDescription){

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

const ADMIN_USER="jaime";

/* SHA256 de 123456789 */

const ADMIN_HASH="15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225";

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

async function sha256(text){

    const msg=new TextEncoder().encode(text);

    const hashBuffer=await crypto.subtle.digest("SHA-256",msg);

    const hashArray=[...new Uint8Array(hashBuffer)];

    return hashArray

    .map(b=>b.toString(16).padStart(2,"0"))

    .join("");

}

document

.getElementById("loginAdmin")

.onclick=async()=>{

    const user=

    document

    .getElementById("adminUser")

    .value

    .trim()

    .toLowerCase();

    const pass=

    document

    .getElementById("adminPass")

    .value;

    const hash=

    await sha256(pass);

    if(

        user===ADMIN_USER

        &&

        hash===ADMIN_HASH

    ){

await fetch("/admin/login",{

    method:"POST"

});

mostrarControles();

        adminModal.style.display="none";

        document.getElementById("adminUser").value="";

        document.getElementById("adminPass").value="";

        mostrarControles();

    }

    else{

        alert("Usuario o contraseña incorrectos");

    }

};

function mostrarControles(){

    document.querySelectorAll(".admin-only").forEach(el=>{
        el.style.display="";
    });

    document.querySelectorAll(".options").forEach(btn=>{
        btn.style.display="flex";
    });


    activarBotones();

    activarLinks();

    activarDragDrop();

      /*
        HABILITAR MOVIMIENTO DE CARDSTATS
        SOLO PARA ADMIN
    */


    cardStatsAdminPuedeMover = true;

}




function ocultarControles(){

    document.querySelectorAll(".admin-only").forEach(el=>{
        el.style.display="none";
    });

    // Ocultar cualquier botón de opciones que haya sido creado dinámicamente
    document.querySelectorAll(".options").forEach(btn=>{
        btn.style.display="none";
    });

     /*
        BLOQUEAR MOVIMIENTO DE CARDSTATS
    */

    cardStatsAdminPuedeMover = false;

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

