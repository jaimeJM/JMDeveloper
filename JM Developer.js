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

    /* Tarjeta */

if(configuracion.card){

    document.documentElement.style.setProperty(

        "--card",

        configuracion.card

    );

    tarjeta.dataset.colorFinal =
        configuracion.card;

    tarjeta.value =
        rgbObjetoAHex(
            obtenerRGBDesdeColor(
                configuracion.card
            )
        );

    actualizarColorFooter();

}



   if(configuracion.cardImage){

        document.documentElement.style.setProperty(
            "--card-image",
            `url("${configuracion.cardImage}")`
        );

        document.querySelector(".card").style.backgroundImage = `
            linear-gradient(
                to bottom,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0) 45%,
                var(--card) 100%
            ),
            url('${configuracion.cardImage}')
        `;

    }






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


/*====================================================
        BOTÓN APLICAR
====================================================*/

saveUniversalColor.onclick = async ()=>{

    if(!editorColorActivo.picker){

        return;

    }


    /*=========================================
        OBTENER COLOR FINAL
    =========================================*/

    const colorFinal =
        obtenerColorFinal();

        editorColorActivo.colorFinal = colorFinal;


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

editorColorActivo.picker.value = hex;

/* Guardar también el color completo (HEX o RGBA) */

editorColorActivo.picker.dataset.colorFinal =
    colorFinal;

    console.log("COLOR FINAL:", colorFinal);
console.log("DATASET:", editorColorActivo.picker.dataset.colorFinal);



    /*=========================================
        APLICAR VARIABLE CSS
    =========================================*/

    if(editorColorActivo.variableCSS){

        document.documentElement.style.setProperty(

            editorColorActivo.variableCSS,

            colorFinal

        );

    }


    /*=========================================
        GUARDAR CONFIGURACIÓN
    =========================================*/

    if(editorColorActivo.propiedad){

        configuracion[
            editorColorActivo.propiedad
        ] = colorFinal;

    }

/*=========================================
    ACTUALIZAR TEXTO EXTERNO
=========================================*/

if(editorColorActivo.texto){

    editorColorActivo.texto.value =
        editorColorActivo.colorFinal;

}

/*=========================================
    EJECUTAR ACCIONES ADICIONALES
=========================================*/

if(
    typeof editorColorActivo.despuesDeAplicar === "function"
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
    GUARDAR SERVIDOR
=========================================*/

await guardarConfiguracionServidor();
hayCambiosSinGuardar = false;
/*=========================================
    CERRAR
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

    contadorDescripcion.textContent =
        `${profileDescription.value.length} / 220`;

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

addButton.onclick = () => {

    const totalBotones =
        document.querySelectorAll("#linksContainer .link-card").length;

    if (totalBotones >= LIMITE_BOTONES) {

        alert("Solo puedes crear un máximo de " + LIMITE_BOTONES + " botones.");

        return;
    }

    agregarBoton();

    guardarBotones();

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
radius.oninput = async ()=>{

    document.querySelectorAll(".link-card").forEach(card=>{

        card.style.borderRadius =
        radius.value + "px";

    });

    configuracion.radius =
    Number(radius.value);

    await guardarConfiguracionServidor();
hayCambiosSinGuardar = false;
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

fuentes.onchange = async () => {

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

    await guardarConfiguracionServidor();
    hayCambiosSinGuardar = false;
};

/*==================================================
    CAMBIAR SOLO EL TÍTULO
==================================================*/

fuenteTitulo.onchange = async () => {

    title.style.fontFamily = fuenteTitulo.value;

    subtitle.style.fontFamily = fuenteTitulo.value;

    configuracion.titleFont = fuenteTitulo.value;

    await guardarConfiguracionServidor();
hayCambiosSinGuardar = false;
}


logoSize.addEventListener("input", async ()=>{

    configuracion.logoSize =
        Number(logoSize.value);

    actualizarTamanoLogo(
        configuracion.logoSize
    );

    // Sincroniza el aro de colores con el tamaño del logo
    document
        .getElementById("box1")
        ?.style.setProperty(
            "--logo-size",
            configuracion.logoSize + "px"
        );

    await guardarConfiguracionServidor();
hayCambiosSinGuardar = false;
});

/*================================================== 
                VELOCIDAD DE ANIMACIONES 
==================================================*/ 


const animationSpeed =
document.getElementById("animationSpeed");

const animationValue =
document.getElementById("animationValue");

animationSpeed.addEventListener("input", async ()=>{

    const value = parseFloat(animationSpeed.value);

    animationValue.innerHTML =
    value + " s";

    document.documentElement.style.setProperty(

        "--animation-speed",

        value + "s"

    );

    configuracion.animationSpeed =
    value;

    await guardarConfiguracionServidor();
hayCambiosSinGuardar = false;
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
        CONTROL DE CAMBIOS EN MODALES
====================================================*/

let hayCambiosSinGuardar = false;

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

    };


    
/*=========================================
    EDITOR COLOR DE FONDO Y BOTONES
=========================================*/
document.getElementById("btnBackground").onclick = () => {

    cerrarTodosLosModales();

    colorModal.style.display = "flex";

};



/*====================================================
    DETECTAR CAMBIOS EN LOS MODALES
====================================================*/

document.querySelectorAll(".modal input, .modal textarea, .modal select").forEach(control => {

    control.addEventListener("input", () => {

        hayCambiosSinGuardar = true;

    });

});


/*====================================================
            CERRAR MODALES
====================================================*/

document.querySelectorAll(".closeModal").forEach(btn => {

    btn.onclick = () => {

        if (hayCambiosSinGuardar) {

            const salir = confirm(

                "Has realizado modificaciones.\n\n" +
                "Si cierras esta ventana sin guardar, perderás todos los cambios.\n\n" +
                "¿Deseas cerrar de todas formas?"

            );

            if (!salir) return;

        }

        document.querySelectorAll(".modal").forEach(modal => {

            modal.style.display = "none";

        });

        hayCambiosSinGuardar = false;

    };

});

window.onclick = (e) => {

    if (!e.target.classList.contains("modal")) return;

    if (hayCambiosSinGuardar) {

        const salir = confirm(

            "Has realizado modificaciones.\n\n" +
            "Si cierras esta ventana sin guardar, perderás todos los cambios.\n\n" +
            "¿Deseas continuar?"

        );

        if (!salir) return;

    }

    e.target.style.display = "none";

    hayCambiosSinGuardar = false;

};




document.getElementById("saveLogo").onclick = async () => {

    /*==============================
            URL DEL LOGO
    ==============================*/

    const url = document
        .getElementById("logoURL")
        .value
        .trim();

    if(url !== ""){

        logo.src = url;

        favicon.href = url;

        configuracion.logo = url;

    }

    /*==============================
            TAMAÑO
    ==============================*/

    configuracion.logoSize = Number(logoSize.value);

    actualizarTamanoLogo(configuracion.logoSize);

    /*==============================
        GUARDAR COLORES DEL ANILLO
    ==============================*/

    const colores = [];

    document
        .querySelectorAll("#logoGradientEditor input[type=color]")
        .forEach(input => {

            colores.push(input.value);

        });

    configuracion.logoGradient = colores;

    actualizarGradienteLogo();

    /*==============================
            GUARDAR
    ==============================*/

    await guardarConfiguracionServidor();

    hayCambiosSinGuardar = false;
    logoModal.style.display = "none";

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

        configuracion.logo = resultado.logo;

        logo.src = resultado.logo;

        favicon.href = resultado.logo;

        await guardarConfiguracionServidor();
        hayCambiosSinGuardar = false;

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

const desc = document.getElementById("description");

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

desc.style.color =
    configuracion.descriptionTextColor;

desc.style.backgroundColor =
    configuracion.descriptionBackgroundColor;


    profileDescription.style.color =
    configuracion.descriptionTextColor;

profileDescription.style.backgroundColor =
    configuracion.descriptionBackgroundColor;

/* Guardar texto */

desc.textContent =
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
console.log("ANTES DE GUARDAR");
console.log(configuracion.descriptionTextColor);
console.log(configuracion.descriptionBackgroundColor);

await guardarConfiguracionServidor();


hayCambiosSinGuardar = false;

    titleModal.style.display="none";

};


/*====================================================
    HERRAMIENTAS DE LA DESCRIPCIÓN
====================================================*/

const desc = document.getElementById("description");

if (desc) {

    document.getElementById("descJustify")?.addEventListener("click", () => {

        desc.style.textAlign = "justify";
        desc.style.textAlignLast = "left";

    });

    document.getElementById("descCenter")?.addEventListener("click", () => {

        desc.style.textAlign = "center";
        desc.style.textAlignLast = "center";

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

const tarjeta = document.getElementById("cardColor");

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

vincularEditorUniversal({
    boton: tarjeta,
    picker: tarjeta,
    propiedad: "card",
    variableCSS: "--card",
    despuesDeAplicar: () => actualizarColorFooter()
});

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


const fontFile = document.getElementById("fontFile");







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

        console.log("Fuente instalada:", resultado.font);

    }

    catch(error){

        console.error(error);

    }

    finally{

        fontFile.value = "";

    }

});


/*====================================================
            FONDO DE CARD
====================================================*/


const backgroundImage = document.getElementById("backgroundImage");

backgroundImage.addEventListener("change", async (e) => {

    const archivo = e.target.files[0];

    if (!archivo) return;

    const datos = new FormData();

    datos.append("cardImage", archivo);

    try{

        const respuesta = await fetch("/uploadCardImage",{

            method:"POST",

            body:datos

        });

        if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
}

const resultado = await respuesta.json();



        if(!resultado.ok){

    alert("No se pudo subir la imagen.");

    return;

}

        configuracion.cardImage = resultado.cardImage;

        await guardarConfiguracionServidor();

        hayCambiosSinGuardar = false;

        document.querySelector(".card").style.backgroundImage = `
            linear-gradient(
                to bottom,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0) 45%,
                var(--card) 100%
            ),
            url('${resultado.cardImage}')
        `;

        document.documentElement.style.setProperty(
            "--card-image",
            `url("${resultado.cardImage}")`
        );


    }catch(error){

        console.error("Error subiendo imagen:", error);

    }

});


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
        hayCambiosSinGuardar = false;

        document.querySelector(".card").style.backgroundImage = `
        linear-gradient(
            to bottom,
            rgba(255,255,255,.15) 0%,
            rgba(255,255,255,.08) 45%,
            var(--card) 100%
        )`;

        document.documentElement.style.setProperty(
            "--card-image",
            "none"
        );

    }catch(error){

        console.error(error);

    }

};

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

console.log("Color guardado:", colorTexto);

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

console.log("Valor del input:", linkTextColor.value);

                /* DESCRIPCIÓN */

                document.getElementById("linkDescription").value =
                    botonSeleccionado.dataset.description || "";

                /* NUEVA PESTAÑA */

                document.getElementById("linkNewTab").checked =
                    botonSeleccionado.dataset.newTab === "true";





                /* ABRIR MODAL */

cerrarTodosLosModales();

document.getElementById("linkModal")
    .style.display = "flex";

            };

        });

    }




    /*====================================================
            GUARDAR CAMBIOS DEL BOTÓN
    ====================================================*/

    document.getElementById("saveLink").onclick = () => {

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


        guardarBotones();


        document.getElementById("linkModal")
            .style.display = "none";

    };


/*====================================================
            ELIMINAR BOTÓN
====================================================*/

document.getElementById("deleteLink").onclick = () => {

    if(!botonSeleccionado) return;


    if(confirm("¿Deseas eliminar este botón?")){

        botonSeleccionado.remove();

        guardarBotones();

        botonSeleccionado = null;

        document.getElementById("linkModal")
            .style.display = "none";

    }

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

            console.log("Botones guardados");

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

        contenedor.innerHTML = "";

    }

}
    

const descripcion=document.getElementById("linkDescription");
const contador=document.getElementById("contadorDescripcion");

descripcion.addEventListener("input",()=>{

contador.innerHTML=

descripcion.value.length+" / 30";

});



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
    hayCambiosSinGuardar = false;

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
    hayCambiosSinGuardar = false;

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

}




function ocultarControles(){

    document.querySelectorAll(".admin-only").forEach(el=>{
        el.style.display="none";
    });

    // Ocultar cualquier botón de opciones que haya sido creado dinámicamente
    document.querySelectorAll(".options").forEach(btn=>{
        btn.style.display="none";
    });

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

    console.log(
    "Después de restaurarTitulo:",
    description.style.backgroundColor
);

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

const d = document.getElementById("description");

console.log(
    "Antes restaurarColores:",
    d.style.backgroundColor
);


    restaurarColores();


    console.log(
    "Después restaurarColores:",
    d.style.backgroundColor
);

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

    console.log("1 segundo después:", d.style.backgroundColor);

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

