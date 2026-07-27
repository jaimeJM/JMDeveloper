/*====================================================
                ELEMENTOS
====================================================*/

const modo=

localStorage.getItem("theme");

if(modo=="dark")

document.body.classList.add("dark");

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

    titleColor.value =
        localStorage.getItem("titleColor") || "#000000";

    subtitleColor.value =
        localStorage.getItem("subtitleColor") || "#000000";

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

/*====================================================
            EDITAR LOGO POR URL
====================================================*/

const logoGuardado = localStorage.getItem("logo");

if(logoGuardado){

    logo.src = logoGuardado;

}

const tamanoGuardado = localStorage.getItem("logoSize");

if(tamanoGuardado){

    actualizarTamanoLogo(tamanoGuardado);

}else{

    actualizarTamanoLogo(150);

}




document.getElementById("saveLogo").onclick = () => {

    const url = document.getElementById("logoURL").value.trim();

    if(url !== ""){

       logo.src = url;
        favicon.href = url;

        localStorage.setItem("logo", url);
        localStorage.setItem("favicon", url);

    }

    localStorage.setItem("logoSize", logoSize.value);

    actualizarTamanoLogo(logoSize.value);

    logoModal.style.display = "none";

}

/*====================================================
            LOGO DESDE COMPUTADORA
====================================================*/

document.getElementById("logoFile").addEventListener("change",(e)=>{

    const archivo=e.target.files[0];

    if(!archivo)return;

    const lector=new FileReader();

    lector.onload=function(ev){

       logo.src = ev.target.result;
        favicon.href = ev.target.result;

        localStorage.setItem("logo", ev.target.result);
        localStorage.setItem("favicon", ev.target.result);
        localStorage.setItem("logoSize", logoSize.value);

        actualizarTamanoLogo(logoSize.value);

    }

    lector.readAsDataURL(archivo);

});




/*====================================================
            EDITAR TITULO
====================================================*/
document.getElementById("saveTitle").onclick = () => {

    const nuevoTitulo = document.getElementById("newTitle").value.trim();
    const nuevoSubtitulo = document.getElementById("newSubtitle").value.trim();

    if(nuevoTitulo !== ""){

        // H1
        title.childNodes[0].textContent = nuevoTitulo + " ";

        // <title>
        document.title = nuevoTitulo;

        localStorage.setItem("titulo", nuevoTitulo);
        localStorage.setItem("pageTitle", nuevoTitulo);

    }

    if(nuevoSubtitulo !== ""){

        // H3
        subtitle.childNodes[0].textContent = nuevoSubtitulo + " ";

        localStorage.setItem("subtitulo", nuevoSubtitulo);

    }

    title.style.color = titleColor.value;
    subtitle.style.color = subtitleColor.value;

    localStorage.setItem("titleColor", titleColor.value);
    localStorage.setItem("subtitleColor", subtitleColor.value);

    titleModal.style.display = "none";
}
/*====================================================
            COLORES
====================================================*/

const fondo=document.getElementById("backgroundColor");

const tarjeta=document.getElementById("cardColor");

const botones=document.getElementById("buttonColor");

const borde=document.getElementById("borderColor");

const sombra=document.getElementById("shadowColor");



const backgroundImage = document.getElementById("backgroundImage");

backgroundImage.addEventListener("change",(e)=>{

const archivo=e.target.files[0];

if(!archivo)return;

const lector=new FileReader();

lector.onload=function(ev){

document.querySelector(".card").style.backgroundImage = `
linear-gradient(
to bottom,
rgba(255,255,255,0) 0%,
rgba(255,255,255,0) 45%,
var(--card) 100%
),
url('${ev.target.result}')
`;

localStorage.setItem(

"cardImage",

ev.target.result

);

}

lector.readAsDataURL(archivo);

});

/*=========================================
    QUITAR IMAGEN DE LA TARJETA
=========================================*/

document.getElementById("removeCardImage").onclick = () => {

    localStorage.removeItem("cardImage");

    document.querySelector(".card").style.backgroundImage = `
    linear-gradient(
        to bottom,
        rgba(255,255,255,.15) 0%,
        rgba(255,255,255,.08) 45%,
        rgba(255,255,255,0) 50%
    )`;

}






const colorIconos = document.getElementById("iconColor");

colorIconos.oninput = () => {

    document.documentElement.style.setProperty(
        "--icon-color",
        colorIconos.value
    );

    localStorage.setItem(
        "iconColor",
        colorIconos.value
    );

}

const iconColor =
localStorage.getItem("iconColor");

if(iconColor){

    document.documentElement.style.setProperty(
        "--icon-color",
        iconColor
    );

    colorIconos.value=iconColor;

}

fondo.oninput=()=>{

    document.documentElement.style.setProperty("--background",fondo.value);

    localStorage.setItem("background",fondo.value);

}

tarjeta.oninput=()=>{

    document.documentElement.style.setProperty("--card",tarjeta.value);

    localStorage.setItem("card",tarjeta.value);

}

botones.oninput=()=>{

    document.documentElement.style.setProperty("--button",botones.value);

    localStorage.setItem("button",botones.value);

}

borde.oninput=()=>{

    document.documentElement.style.setProperty("--border",borde.value);

    localStorage.setItem("border",borde.value);

}

sombra.oninput=()=>{

    document.documentElement.style.setProperty("--shadow",sombra.value);

    localStorage.setItem("shadow",sombra.value);

}

/*====================================================
            RESTAURAR DATOS
====================================================*/

window.addEventListener("load",()=>{


    const icono = localStorage.getItem("favicon");

if(icono){
    favicon.href = icono;
}

    
const tituloPagina = localStorage.getItem("pageTitle");

if(tituloPagina){
    document.title = tituloPagina;
}



    if(localStorage.getItem("logo")){

        logo.src = localStorage.getItem("logo");
        
        if(localStorage.getItem("logoSize")){

    actualizarTamanoLogo(

        localStorage.getItem("logoSize")

    );

}

    }

    if(localStorage.getItem("titulo")){

        title.childNodes[0].textContent=
        localStorage.getItem("titulo")+" ";

    }

    if(localStorage.getItem("subtitulo")){

        subtitle.childNodes[0].textContent=
        localStorage.getItem("subtitulo")+" ";

    }

    if(localStorage.getItem("titleColor")){

        title.style.color=
        localStorage.getItem("titleColor");

    }

    if(localStorage.getItem("subtitleColor")){

        subtitle.style.color=
        localStorage.getItem("subtitleColor");

    }

const bg = localStorage.getItem("background");
if(bg){
    document.documentElement.style.setProperty("--background", bg);
    fondo.value = bg;
}

const card = localStorage.getItem("card");
if(card){
    document.documentElement.style.setProperty("--card", card);
    tarjeta.value = card;
}

const button = localStorage.getItem("button");
if(button){
    document.documentElement.style.setProperty("--button", button);
    botones.value = button;
}

const border = localStorage.getItem("border");
if(border){
    document.documentElement.style.setProperty("--border", border);
    borde.value = border;
}

const shadow = localStorage.getItem("shadow");
if(shadow){
    document.documentElement.style.setProperty("--shadow", shadow);
    sombra.value = shadow;
}
const imagenGuardada=

localStorage.getItem("cardImage");

if(imagenGuardada){

document.querySelector(".card").style.backgroundImage = `
linear-gradient(
to bottom,
rgba(255,255,255,0) 0%,
rgba(255,255,255,0) 45%,
var(--card) 100%
),
url('${imagenGuardada}')
`;

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

        btn.onclick = (e) => {

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

activarBotones();


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


function abrirEnlace(url,nuevaVentana){

if(!url)return;

if(nuevaVentana){

window.open(url,"_blank","noopener");

}else{

location.href=url;

}

}



activarLinks();


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

    const radio =
localStorage.getItem("radius");

if(radio){

div.style.borderRadius =
radio+"px";

}


  activarBotones();

activarLinks();

activarDragDrop();

guardarBotones();

// Mantener ocultos los controles si no es administrador
if(localStorage.getItem("admin")==="true"){
    mostrarControles();
}else{
    ocultarControles();
}

}


/*====================================================
            GUARDAR BOTONES
====================================================*/

function guardarBotones(){

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


    localStorage.setItem(

        "botones",

        JSON.stringify(datos)

    );

}


/*====================================================
            CARGAR BOTONES
====================================================*/

function cargarBotones(){

    const datos = JSON.parse(localStorage.getItem("botones"));

    if(!datos) return;

    document.getElementById("linksContainer").innerHTML = "";

    datos.forEach(item=>{

        agregarBoton(
            item.texto,
            item.icono,
            item.url,
            item.textColor || "#ffffff",
            item.description || "",
            item.newTab || false
        );

    });

    // Verificar si el administrador está conectado
    if(localStorage.getItem("admin")==="true"){
        mostrarControles();
    }else{
        ocultarControles();
    }
}


window.addEventListener("load",()=>{

    cargarBotones();

    activarDragDrop();

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

addButton.onclick=()=>{

agregarBoton();

const fuente =
localStorage.getItem("font");

if(fuente){

div.style.fontFamily = fuente;

}

}



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

radius.oninput=()=>{

document.querySelectorAll(".link-card").forEach(card=>{

card.style.borderRadius=radius.value+"px";

});

localStorage.setItem("radius",radius.value);

}

/*==================================================
            CAMBIAR FUENTE
==================================================*/

const fuentes=document.createElement("select");

fuentes.innerHTML=`

<option>Segoe UI</option>

<option>Arial</option>

<option>Verdana</option>

<option>Tahoma</option>

<option>Georgia</option>

<option>Poppins</option>

<option>Montserrat</option>

`;

document.querySelector("#colorModal .modal-content")
.appendChild(fuentes);

fuentes.onchange=()=>{

document.body.style.fontFamily=fuentes.value;

localStorage.setItem("font",fuentes.value);

}

/*==================================================
        EXPORTAR CONFIGURACIÓN
==================================================*/

/*const exportButton=document.createElement("button");

exportButton.innerHTML="Exportar";

exportButton.style.background="#3b82f6";

document.querySelector("#colorModal .buttons")
.appendChild(exportButton);

exportButton.onclick=()=>{

const datos={

logo:logo.src,

titulo:title.childNodes[0].textContent,

subtitulo:subtitle.childNodes[0].textContent,

background:getComputedStyle(document.documentElement).getPropertyValue("--background"),

card:getComputedStyle(document.documentElement).getPropertyValue("--card"),

button:getComputedStyle(document.documentElement).getPropertyValue("--button"),

border:getComputedStyle(document.documentElement).getPropertyValue("--border"),

shadow:getComputedStyle(document.documentElement).getPropertyValue("--shadow"),

botones:JSON.parse(localStorage.getItem("botones"))

};

const blob=new Blob(

[JSON.stringify(datos,null,4)],

{type:"application/json"}

);

const enlace=document.createElement("a");

enlace.href=URL.createObjectURL(blob);

enlace.download="configuracion.json";

enlace.click();

}*/

/*==================================================
        RESTAURAR OPCIONES
==================================================*/

window.addEventListener("load",()=>{




if(localStorage.getItem("logoSize")){

logo.style.width=

localStorage.getItem("logoSize")+"px";

logo.style.height=

localStorage.getItem("logoSize")+"px";

logoSize.value=
localStorage.getItem("logoSize");

}

const iconColorGuardado =
localStorage.getItem("iconColor");

if(iconColorGuardado){

    document.documentElement.style.setProperty(
        "--icon-color",
        iconColorGuardado
    );

    colorIconos.value =
    iconColorGuardado;

}

if(localStorage.getItem("radius")){

document.querySelectorAll(".link-card").forEach(card=>{

card.style.borderRadius=

localStorage.getItem("radius")+"px";

});

radius.value=

localStorage.getItem("radius");

}

if(localStorage.getItem("font")){

document.body.style.fontFamily=

localStorage.getItem("font");

fuentes.value=

localStorage.getItem("font");

}

});


function actualizarTamanoLogo(valor){

    logo.style.width = valor + "px";

    logo.style.height = valor + "px";

    logoSize.value = valor;

    logoSizeValue.innerHTML = valor + " px";

}

logoSize.addEventListener("input", () => {

    actualizarTamanoLogo(logoSize.value);

});

/*================================================== VELOCIDAD DE ANIMACIONES ==================================================*/ 
const animationSpeed = document.getElementById("animationSpeed");
 const animationValue = document.getElementById("animationValue");
  const savedAnimation = localStorage.getItem("animationSpeed") || "0.35"; animationSpeed.value = savedAnimation;
   animationValue.innerHTML = savedAnimation + " s"; 
   document.documentElement.style.setProperty( "--animation-speed", savedAnimation + "s" );
    animationSpeed.addEventListener("input",()=>
        { const value=animationSpeed.value;
         animationValue.innerHTML= value+" s"; document.documentElement.style.setProperty( "--animation-speed", value+"s" );
          localStorage.setItem( "animationSpeed", value ); 
        });





const descripcion=document.getElementById("linkDescription");
const contador=document.getElementById("contadorDescripcion");

descripcion.addEventListener("input",()=>{

contador.innerHTML=

descripcion.value.length+" / 30";

});



function cambiarTema(){

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );

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


function activarGlass(){

document.querySelector(".card")

.classList.toggle("glass");

localStorage.setItem(

"glass",

document

.querySelector(".card")

.classList.contains("glass")

);

}


function activarNeumorphism(){

document.querySelector(".card")

.classList.toggle("neumorphism");

localStorage.setItem(

"neumorphism",

document.querySelector(".card")

.classList.contains("neumorphism")

);

}


/*==================================================
            DRAG & DROP
==================================================*/

function activarDragDrop(){

    const cards=document.querySelectorAll(".link-card");

    cards.forEach(card=>{

        card.draggable=true;

        card.addEventListener("dragstart",()=>{

            card.classList.add("dragging");

        });

        card.addEventListener("dragend",()=>{

    card.classList.remove("dragging");

    document.querySelectorAll(".link-card").forEach(c=>{

        c.classList.remove("drag-over");

    });

    guardarBotones();

});

    });

    const container=document.getElementById("linksContainer");

container.addEventListener("dragover",(e)=>{

    e.preventDefault();

    const dragging=document.querySelector(".dragging");

    const afterElement=getDragAfterElement(container,e.clientY);

    document.querySelectorAll(".link-card").forEach(card=>{

        card.classList.remove("drag-over");

    });

    if(afterElement){

        afterElement.classList.add("drag-over");

        container.insertBefore(dragging,afterElement);

    }else{

        container.appendChild(dragging);

    }

});

}

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

document
.getElementById("btnAdmin")
.onclick=()=>{

    adminModal.style.display="flex";

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

        localStorage

        .setItem("admin","true");

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

if(

localStorage

.getItem("admin")

==="true"

){

    mostrarControles();

}else{

    ocultarControles();

}


/*==============================
      CERRAR SESIÓN
==============================*/

document
.getElementById("logoutAdmin")
.onclick=()=>{

    localStorage.removeItem("admin");

    ocultarControles();

    adminModal.style.display="none";

};