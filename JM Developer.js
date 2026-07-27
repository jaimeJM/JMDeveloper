/*====================================================
        PASO 0
        CARGAR CONFIGURACIÓN
====================================================*/

let configuracion = {};

async function cargarConfiguracion() {

    try {

        const respuesta = await fetch("/config");

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






/*==================================================
        TAMAÑOS DEL LOGO
==================================================*/


function actualizarTamanoLogo(valor){

    logo.style.width = valor + "px";

    logo.style.height = valor + "px";

    logoSize.value = valor;

    logoSizeValue.innerHTML = valor + " px";

}


/*====================================================
                PASO 3
        RESTAURAR TÍTULO Y SUBTÍTULO
====================================================*/

function restaurarTitulo() {

    // Restaurar título de la pestaña
    document.title =
        configuracion.title || "";

    // Restaurar título principal
    title.childNodes[0].textContent =
        (configuracion.title || "") + " ";

    // Restaurar subtítulo
    subtitle.childNodes[0].textContent =
        (configuracion.subtitle || "") + " ";


        if(configuracion.titleFont){

    title.style.fontFamily=

    configuracion.titleFont;

    subtitle.style.fontFamily=

    configuracion.titleFont;

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

        fondo.value=configuracion.background;

       actualizarColorFooter();

    }

    /* Tarjeta */

    if(configuracion.card){

        document.documentElement.style.setProperty(

            "--card",

            configuracion.card

        );

        tarjeta.value=configuracion.card;

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

        botones.value=configuracion.button;

    }

    /* Borde */

    if(configuracion.border){

        document.documentElement.style.setProperty(

            "--border",

            configuracion.border

        );

        borde.value=configuracion.border;

    }

    /* Sombra */

    if(configuracion.shadow){

        document.documentElement.style.setProperty(

            "--shadow",

            configuracion.shadow

        );

        sombra.value=configuracion.shadow;

    }

    /* Color del título */

    if(configuracion.text){

        document.documentElement.style.setProperty(

            "--text",

            configuracion.text

        );

        titleColor.value=configuracion.text;

    }

    /* Color del subtítulo */

    if(configuracion.textSecondary){

        document.documentElement.style.setProperty(

            "--text-secondary",

            configuracion.textSecondary

        );

        subtitleColor.value=configuracion.textSecondary;

    }

    /* Color de iconos */

    if(configuracion.iconColor){

        document.documentElement.style.setProperty(

            "--icon-color",

            configuracion.iconColor

        );

        colorIconos.value=configuracion.iconColor;

    }

}


/*====================================================
        ACTUALIZAR COLOR DEL FOOTER
====================================================*/

function actualizarColorFooter(color){

    color = color.replace("#","");

    const r = parseInt(color.substring(0,2),16);
    const g = parseInt(color.substring(2,4),16);
    const b = parseInt(color.substring(4,6),16);

    const brillo = (r*299 + g*587 + b*114)/1000;

    const colorTexto = brillo > 150 ? "#000000" : "#ffffff";

    document.documentElement.style.setProperty(
        "--footer-text",
        colorTexto
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

const logoModal = document.getElementById("logoModal");

const titleModal = document.getElementById("titleModal");

const colorModal = document.getElementById("colorModal");

const btnBackground = document.getElementById("btnBackground");


const titleColor = document.getElementById("titleColor");

const subtitleColor = document.getElementById("subtitleColor");

const pageTitle = document.querySelector("title");



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


/*   botón flotante  */

addButton.onclick = () => {

    agregarBoton();

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
};

/*==================================================
    CAMBIAR SOLO EL TÍTULO
==================================================*/

fuenteTitulo.onchange = async () => {

    title.style.fontFamily = fuenteTitulo.value;

    subtitle.style.fontFamily = fuenteTitulo.value;

    configuracion.titleFont = fuenteTitulo.value;

    await guardarConfiguracionServidor();

}


logoSize.addEventListener("input", async ()=>{

    configuracion.logoSize =
        Number(logoSize.value);

    actualizarTamanoLogo(
        configuracion.logoSize
    );

    await guardarConfiguracionServidor();

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

});






























/*====================================================
                ABRIR MODALES
====================================================*/

document.querySelector(".edit-logo").onclick = () => {

    logoModal.style.display = "flex";

}

document.querySelector(".edit-title").onclick = () => {

    document.getElementById("newTitle").value =
        title.childNodes[0].textContent.trim();

    document.getElementById("newSubtitle").value =
        subtitle.childNodes[0].textContent.trim();

const estilos = getComputedStyle(document.documentElement);

titleColor.value =
    estilos.getPropertyValue("--text").trim();

subtitleColor.value =
    estilos.getPropertyValue("--text-secondary").trim();

    titleModal.style.display = "flex";

}



btnBackground.onclick = () => {

    colorModal.style.display = "flex";

}

/*====================================================
            CERRAR MODALES
====================================================*/

document.querySelectorAll(".closeModal").forEach(btn=>{

    btn.onclick=()=>{

        document.querySelectorAll(".modal").forEach(modal=>{

            modal.style.display="none";

        });

    }

});

window.onclick=(e)=>{

    if(e.target.classList.contains("modal")){

        e.target.style.display="none";

    }

}





document.getElementById("saveLogo").onclick = async () => {

    const url =
        document.getElementById("logoURL")
        .value
        .trim();

    if(url !== ""){

        logo.src = url;

        favicon.href = url;

        configuracion.logo = url;

    }

    configuracion.logoSize =
        Number(logoSize.value);

    actualizarTamanoLogo(
        configuracion.logoSize
    );

    await guardarConfiguracionServidor();

    logoModal.style.display = "none";

}

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

    subtitle.childNodes[0].textContent =
    nuevoSubtitulo + " ";


/*====================================================
        GUARDAR FUENTE DEL TÍTULO
====================================================*/

configuracion.titleFont = fuenteTitulo.value;

title.style.fontFamily = fuenteTitulo.value;

subtitle.style.fontFamily = fuenteTitulo.value;

configuracion.text = titleColor.value;

configuracion.textSecondary = subtitleColor.value;

/* Aplicar colores */

document.documentElement.style.setProperty(

    "--text",

    configuracion.text

);

document.documentElement.style.setProperty(

    "--text-secondary",

    configuracion.textSecondary

);

/* Guardar configuración */

await guardarConfiguracionServidor();

    titleModal.style.display="none";

}




/*====================================================
            COLORES
====================================================*/

const fondo=document.getElementById("backgroundColor");

const tarjeta=document.getElementById("cardColor");

const botones=document.getElementById("buttonColor");

const borde=document.getElementById("borderColor");

const sombra=document.getElementById("shadowColor");

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

const colorIconos = document.getElementById("iconColor");

colorIconos.oninput = () => {

    document.documentElement.style.setProperty(
        "--icon-color",
        colorIconos.value
    );

   

}


/*=========================================
    EVENTOS IMPORTANTES 
=========================================*/


fondo.oninput = async ()=>{

    document.documentElement.style.setProperty(

        "--background",

        fondo.value

    );

    actualizarColorFooter(fondo.value);

    configuracion.background = fondo.value;

    await guardarConfiguracionServidor();

}


tarjeta.oninput = async ()=>{

    document.documentElement.style.setProperty(
        "--card",
        tarjeta.value
    );

    configuracion.card = tarjeta.value;

     actualizarColorFooter();

    await guardarConfiguracionServidor();

    

}

botones.oninput = async ()=>{

    document.documentElement.style.setProperty(
        "--button",
        botones.value
    );

  configuracion.button = botones.value;

    await guardarConfiguracionServidor();

}

borde.oninput = async ()=>{

    document.documentElement.style.setProperty(
        "--border",
        borde.value
    );

 configuracion.border = borde.value;

  await guardarConfiguracionServidor();

} 

sombra.oninput = async ()=>{

    document.documentElement.style.setProperty(
        "--shadow",
        sombra.value
    );

   configuracion.shadow = sombra.value;

   await guardarConfiguracionServidor();

   
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

            document.getElementById("linkTextColor").value =
                botonSeleccionado.dataset.textColor || "#ffffff";

            /* DESCRIPCIÓN */

            document.getElementById("linkDescription").value =
                botonSeleccionado.dataset.description || "";

            /* NUEVA PESTAÑA */

            document.getElementById("linkNewTab").checked =
                botonSeleccionado.dataset.newTab === "true";

            /* ABRIR MODAL */

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


    const colorTexto =
        document.getElementById("linkTextColor")
        .value;


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

guardarBotones();



// Mantener ocultos los controles si no es administrador


}


/*====================================================
            GUARDAR BOTONES
====================================================*/

function guardarBotones(){

     if(!document.getElementById("linksContainer"))
        return;

    const datos = [];


    document
        .querySelectorAll(".link-card")
        .forEach(card => {


        datos.push({

            texto:
                card
                .querySelector(".center span")
                .innerText,


            icono:
                card
                .querySelector(".left i")
                .className,


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


fetch("/botones", {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify(datos)

})
.then(res => res.json())
.then(() => {

    console.log("Botones guardados");

})
.catch(error => {

    console.error(
        "Error guardando botones:",
        error
    );

});

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
            await fetch("/botones");

        const botones =
            await respuesta.json();

        contenedor.innerHTML = "";

        botones.forEach(btn => {

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



configuracion.theme=
document.body.classList.contains("dark")
?"dark":"light";

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

/*/document.getElementById("btnAdmin").onclick=()=>{

    adminModal.style.display="flex";

};*/

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

}

/*====================================================
        INICIO DEL SISTEMA
====================================================*/

window.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await inicializarAplicacion();

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
