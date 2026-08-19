
require("dotenv").config();

console.log("===== VARIABLES ADMIN =====");

console.log(
    "ADMIN_USER:",
    process.env.ADMIN_USER ? "OK" : "FALTA"
);

console.log(
    "ADMIN_HASH:",
    process.env.ADMIN_HASH ? "OK" : "FALTA"
);

console.log(
    "ADMIN_HASH LENGTH:",
    process.env.ADMIN_HASH
        ? process.env.ADMIN_HASH.length
        : 0
);

console.log(
    "SESSION_SECRET:",
    process.env.SESSION_SECRET ? "OK" : "FALTA"
);

console.log("===========================");

const express = require("express");
const session = require("express-session");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");


const FONT_FOLDER = "fonts";

const CONFIG_FILE = "config.json";


// Crear carpeta uploads automáticamente
const uploadsDir = path.join(__dirname, "uploads");

/*====================================================
    ARCHIVO DE MÚSICA DEL SITIO
====================================================*/

const MUSIC_FILE =
    path.join(
        uploadsDir,
        "site-music.mp3"
    );



if (!fs.existsSync(uploadsDir)) {

    fs.mkdirSync(uploadsDir, { recursive: true });

}

const fontsDir = path.join(__dirname, "fonts");

if (!fs.existsSync(fontsDir)) {

    fs.mkdirSync(fontsDir, { recursive: true });

}

const storage = multer.diskStorage({

   destination:function(req,file,cb){

    if(file.fieldname==="font"){

        cb(null, fontsDir);

    }else{

        cb(null, uploadsDir);

    }

},

    filename:function(req,file,cb){

        const extension = path.extname(file.originalname);

        switch(file.fieldname){

            case "logo":

                cb(
                    null,
                    "logo-" + Date.now() + extension
                );

            break;

            

case "cardImage":

    cb(
        null,
        "fondo-card-" + Date.now() + extension
    );

break;


case "cardWatermark":

    cb(
        null,
        "card-watermark.svg"
    );

break;




                case "font":
                                

                    cb(

                        null,

                        file.originalname

                    );

                break;

            default:

                cb(
                    null,
                    Date.now() + extension
                );

        }

    }

});



const upload = multer({

    storage: storage,

    limits: {

        fileSize: 5 * 1024 * 1024 // 5 MB

    },

    fileFilter: (req, file, cb) => {

    const tiposPermitidos = [

    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",

    "font/ttf",
    "font/otf",
    "font/woff",
    "font/woff2",

    "application/font-sfnt",
    "application/x-font-ttf",
    "application/x-font-otf",

    "application/octet-stream"

];

        if (tiposPermitidos.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Solo se permiten archivos de imagen."));

        }

    }

});


/*====================================================
    STORAGE PARA MÚSICA
    SIEMPRE USA UN ARCHIVO TEMPORAL
====================================================*/

const musicStorage =
    multer.diskStorage({

        destination:
            function(
                req,
                file,
                cb
            ){

                cb(
                    null,
                    uploadsDir
                );

            },


        filename:
            function(
                req,
                file,
                cb
            ){

                cb(
                    null,
                    "music-temp-" +
                    Date.now() +
                    ".mp3"
                );

            }

    });


const uploadMusic =
    multer({

        storage:
            musicStorage,

        limits: {

            fileSize:
                15 * 1024 * 1024

        },

        fileFilter:
            function(
                req,
                file,
                cb
            ){

                const extension =
                    path.extname(
                        file.originalname
                    ).toLowerCase();


                if (
                    extension === ".mp3"
                ){

                    cb(
                        null,
                        true
                    );

                }else{

                    cb(
                        new Error(
                            "Solo se permiten archivos MP3."
                        )
                    );

                }

            }

    });




function leerConfiguracion(){

    return JSON.parse(
        fs.readFileSync(CONFIG_FILE,"utf8")
    );

}

function guardarConfiguracion(datos){

    fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify(datos,null,4)
    );

}

function eliminarLogoAnterior(ruta){

    if(!ruta) return;

    if(!ruta.startsWith("/uploads/")) return;

    const archivo = path.join(__dirname, ruta);

    fs.unlink(archivo, (err)=>{

        if(err){

            if(err.code !== "ENOENT"){
                console.error("Error eliminando logo:", err);
            }

            return;
        }

        console.log("Logo eliminado:", archivo);

    });

}




function eliminarImagenAnterior(ruta){

    if(!ruta) return;

    if(ruta.includes("logo")) return;

    if(!ruta.startsWith("/uploads/")) return;

    const archivo = path.join(__dirname,ruta);

    if(fs.existsSync(archivo)){

        fs.unlinkSync(archivo);

        console.log("Imagen eliminada:",archivo);

    }

}



const BOTONES_FILE = path.join(__dirname, "botones.json");

function leerBotones() {

    try {

        if (!fs.existsSync(BOTONES_FILE)) {

            fs.writeFileSync(
                BOTONES_FILE,
                "[]",
                "utf8"
            );

        }

        return JSON.parse(
            fs.readFileSync(
                BOTONES_FILE,
                "utf8"
            )
        );

    } catch (error) {

        console.error("Error leyendo botones:", error);

        return [];

    }

}

function guardarBotones(botones) {

    fs.writeFileSync(

        BOTONES_FILE,

        JSON.stringify(botones, null, 4),

        "utf8"

    );

}




const app = express();

app.use(express.json({

    limit:"50mb"

}));

app.use(express.urlencoded({

    extended:true,

    limit:"50mb"

}));





const esProduccion =
    process.env.NODE_ENV === "production";


app.set(
    "trust proxy",
    1
);


app.use(session({

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {

        maxAge:
            24 * 60 * 60 * 1000,

        httpOnly: true,

        sameSite: "lax",

        secure: esProduccion

    }

}));


/*====================================================
        PROTEGER RUTAS DEL ADMINISTRADOR
====================================================*/

function requireAdmin(req, res, next) {

    if (req.session.admin !== true) {

        return res.status(403).json({

            ok: false,

            error: "No autorizado."

        });

    }

    next();
}


app.use(express.static(__dirname));




app.use("/uploads", express.static("uploads"));

app.use("/fonts", express.static("fonts"));

// =========================
// Página principal
// =========================
app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "index.html"));

});

/*=====================================================
        LISTAR TODAS LAS FUENTES
=====================================================*/

app.get("/fonts-list", (req, res) => {

    try {

        const archivos = fs.readdirSync(fontsDir);

        const extensiones = [
            ".ttf",
            ".otf",
            ".woff",
            ".woff2"
        ];

        const fuentes = [];

        archivos.forEach(file => {

            const extension = path.extname(file).toLowerCase();

            if (!extensiones.includes(extension)) {
                return;
            }

            const nombre = path.basename(file, extension);

            fuentes.push({

                name: nombre,

                file: file,

                extension: extension,

                url: "/fonts/" + encodeURIComponent(file)

            });

        });

        fuentes.sort((a, b) =>
            a.name.localeCompare(
                b.name,
                "es",
                {
                    sensitivity: "base"
                }
            )
        );

        res.json({

            ok: true,

            total: fuentes.length,

            fonts: fuentes

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            ok: false,

            error: error.message

        });

    }

});




app.get("/config",(req,res)=>{

    res.json(
        leerConfiguracion()
    );

});



app.post(
    "/config",
    requireAdmin,
    (req, res) => {

        guardarConfiguracion(req.body);

        res.json({
            ok: true
        });

    }
);

app.post(
    "/uploadLogo",
    requireAdmin,
    upload.single("logo"),
    (req, res) => {

    if (!req.file) {

        return res.status(400).json({
            error: "No se recibió ningún logo."
        });

    }

    const configuracion = leerConfiguracion();

    // Eliminar el logo anterior
    eliminarLogoAnterior(configuracion.logo);

    // Guardar la nueva ruta
    configuracion.logo = "/uploads/" + req.file.filename;

    guardarConfiguracion(configuracion);

    res.json({

        ok: true,

        logo: configuracion.logo

    });

});


/*====================================================
            SUBIR FUENTE
====================================================*/
app.post(
    "/uploadFont",
    requireAdmin,
    upload.single("font"),
    (req, res) => {

    try{

        if(!req.file){

            return res.status(400).json({

                ok:false,

                error:"No se recibió ninguna fuente."

            });

        }

        const nombreFuente = path.parse(req.file.filename).name;

        res.json({

            ok:true,

            font:nombreFuente,

            file:req.file.filename,

            url:"/fonts/" + req.file.filename

        });

    }catch(error){

        res.status(500).json({

            ok:false,

            error:error.message

        });

    }

});




// =========================
// SUBIR IMAGEN DE LA TARJETA
// =========================
app.post(
    "/uploadCardImage",
    requireAdmin,
    upload.single("cardImage"),
    (req, res) => {
    try {

        console.log("===== SUBIENDO IMAGEN =====");

        if (!req.file) {
            console.log("No llegó archivo");
            return res.status(400).json({
                ok:false,
                error:"No se recibió ninguna imagen."
            });
        }

        console.log("Archivo:", req.file.filename);

        const configuracion = leerConfiguracion();

        console.log("Config leída");

        eliminarImagenAnterior(configuracion.cardImage);

        console.log("Imagen anterior eliminada");

        configuracion.cardImage = "/uploads/" + req.file.filename;

        guardarConfiguracion(configuracion);

        console.log("Config guardada");

        console.log("Enviando respuesta...");

        return res.json({
            ok:true,
            cardImage:configuracion.cardImage
        });

    } catch(err){

        console.error("ERROR uploadCardImage:", err);

        return res.status(500).json({
            ok:false,
            error:err.message
        });

    }

});






// =========================================================
// SUBIR / REEMPLAZAR LOGO SVG COMO MARCA DE AGUA
// =========================================================


/*====================================================
    SUBIR FOTO / MINIATURA DE LOS BOTONES
====================================================*/

app.post(
    "/uploadSocialImage",
    requireAdmin,
    upload.single("socialImage"),
    (req, res) => {

        try{

            if(!req.file){

                return res.status(400).json({
                    ok:false,
                    error:"No se recibió ninguna imagen."
                });

            }

            return res.json({
                ok:true,
                socialPhoto:
                    "/uploads/" + req.file.filename
            });

        }catch(error){

            console.error(
                "Error subiendo imagen del botón:",
                error
            );

            return res.status(500).json({
                ok:false,
                error:error.message
            });

        }

    }
);

app.post(
    "/uploadCardWatermark",
    requireAdmin,
    upload.single("cardWatermark"),
    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    ok:false,

                    error:
                        "No se recibió ningún archivo SVG."

                });

            }


            const configuracion =
                leerConfiguracion();


            const ruta =
                "/uploads/card-watermark.svg";


            /*
                El archivo siempre utiliza
                el mismo nombre:

                card-watermark.svg

                Por lo tanto el nuevo SVG
                reemplaza al anterior.
            */


            configuracion.cardWatermark =
                ruta;


            guardarConfiguracion(
                configuracion
            );


            return res.json({

                ok:true,

                cardWatermark:
                    ruta

            });


        }catch(error){

            console.error(
                "Error subiendo marca de agua:",
                error
            );


            return res.status(500).json({

                ok:false,

                error:error.message

            });

        }

    }
);




// =========================================================
// ELIMINAR LOGO SVG DE MARCA DE AGUA
// =========================================================

app.post(
    "/removeCardWatermark",
    requireAdmin,
    (req, res) => {

        try{

            const configuracion =
                leerConfiguracion();


            const ruta =
                configuracion.cardWatermark;


            if(ruta){

                const archivo =
                    path.join(
                        __dirname,
                        ruta
                    );


                if(
                    fs.existsSync(
                        archivo
                    )
                ){

                    fs.unlinkSync(
                        archivo
                    );

                }

            }


            configuracion.cardWatermark =
                "";


            guardarConfiguracion(
                configuracion
            );


            res.json({

                ok:true

            });


        }catch(error){

            console.error(
                "Error eliminando marca de agua:",
                error
            );


            res.status(500).json({

                ok:false,

                error:error.message

            });

        }

    }
);

app.post(
    "/removeCardImage",
    requireAdmin,
    (req, res) => {

        const configuracion = leerConfiguracion();

        eliminarImagenAnterior(
            configuracion.cardImage
        );

        configuracion.cardImage = "";

        guardarConfiguracion(configuracion);

        res.json({
            ok: true
        });

    }
);



/*====================================================
    SUBIR / REEMPLAZAR MÚSICA
====================================================*/

app.post(
    "/uploadMusic",

    requireAdmin,

    uploadMusic.single("music"),

    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "No se recibió ningún archivo MP3."

                });

            }


            /*=========================================
                ELIMINAR MÚSICA ANTERIOR
            =========================================*/

            if (
                fs.existsSync(
                    MUSIC_FILE
                )
            ) {

                fs.unlinkSync(
                    MUSIC_FILE
                );

            }


            /*=========================================
                RENOMBRAR TEMPORAL
                A ARCHIVO DEFINITIVO
            =========================================*/

            fs.renameSync(

                req.file.path,

                MUSIC_FILE

            );


            /*=========================================
                ACTUALIZAR CONFIGURACIÓN
            =========================================*/

            const configuracion =
                leerConfiguracion();


            configuracion.musicUrl =
                "/uploads/site-music.mp3";


            /*=========================================
                SI NO EXISTÍA CONFIGURACIÓN,
                ACTIVAMOS POR DEFECTO
            =========================================*/

            if (
                typeof
                configuracion.musicEnabled
                !== "boolean"
            ){

                configuracion.musicEnabled =
                    true;

            }


            guardarConfiguracion(
                configuracion
            );


            return res.json({

                ok: true,

                musicUrl:
                    configuracion.musicUrl,

                musicEnabled:
                    configuracion.musicEnabled

            });


        } catch(error) {

            console.error(
                "Error subiendo música:",
                error
            );


            /*=========================================
                ELIMINAR TEMPORAL SI FALLÓ
            =========================================*/

            if (
                req.file &&
                req.file.path &&
                fs.existsSync(
                    req.file.path
                )
            ){

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch(e){}

            }


            return res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }

);

/*====================================================
    ACTIVAR / DESACTIVAR MÚSICA
====================================================*/

app.post(
    "/music/toggle",

    requireAdmin,

    (req, res) => {

        try {

            const configuracion =
                leerConfiguracion();


            configuracion.musicEnabled =
                req.body.enabled === true;


            guardarConfiguracion(
                configuracion
            );


            res.json({

                ok: true,

                musicEnabled:
                    configuracion.musicEnabled

            });


        } catch(error) {

            console.error(
                "Error cambiando estado de música:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }

);

/*====================================================
    OBTENER CONFIGURACIÓN DE MÚSICA
====================================================*/

app.get(
    "/music/config",
    (req, res) => {

        try {

            const configuracion =
                leerConfiguracion();


            res.json({

                ok: true,

                enabled:
                    configuracion.musicEnabled === true,

                url:
                    configuracion.musicUrl || ""

            });


        } catch(error) {

            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }

);


app.get("/botones", (req, res) => {

    try {

        const botones = leerBotones();

        res.json(botones);

    } catch (error) {

        console.error("ERROR /botones:", error);

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});

app.post(
    "/botones",
    requireAdmin,
    (req, res) => {

        guardarBotones(req.body);

        res.json({
            ok: true
        });

    }
);


/*====================================================
    ESTADÍSTICAS
====================================================*/

const STATS_FILE =
    "stats.json";


function leerStats() {

    if (
        !fs.existsSync(STATS_FILE)
    ) {

        const inicial = {

    views: 0,

    likes: 0,

    shares: 0,

    viewDevices: {},

    likeDevices: {},

    shareDevices: {}

};

        fs.writeFileSync(

            STATS_FILE,

            JSON.stringify(
                inicial,
                null,
                2
            ),

            "utf8"

        );


        return inicial;
    }


    try {

        const datos =
            JSON.parse(
                fs.readFileSync(
                    STATS_FILE,
                    "utf8"
                )
            );


return {

    views:
        Number(datos.views) || 0,

    likes:
        Number(datos.likes) || 0,

    shares:
        Number(datos.shares) || 0,

    viewDevices:
        datos.viewDevices || {},

    likeDevices:
        datos.likeDevices || {},

    shareDevices:
        datos.shareDevices || {}

};


    } catch (error) {

        console.error(
            "Error leyendo stats.json:",
            error
        );


 return {

    views: 0,

    likes: 0,

    shares: 0,

    viewDevices: {},

    likeDevices: {},

    shareDevices: {}

};

    }

}


function guardarStats(stats) {

    fs.writeFileSync(

        STATS_FILE,

        JSON.stringify(
            stats,
            null,
            2
        ),

        "utf8"

    );

}


/*====================================================
    REGISTRAR VISUALIZACIÓN
    UNA VEZ POR DISPOSITIVO
====================================================*/

app.post(
    "/stats/view",
    express.json(),
    (req, res) => {

        try {

            const deviceId =
                String(
                    req.body.deviceId || ""
                ).trim();


            if (!deviceId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "deviceId requerido."

                });

            }


            const stats =
                leerStats();


            /*
                ¿Este dispositivo ya vio
                la tarjeta?
            */

            if (
                stats.viewDevices[deviceId]
            ) {

                return res.json({

                    ok: true,

                    registrada: false,

                    views:
                        stats.views

                });

            }


            /*
                Nueva visualización
            */

            stats.views++;


            stats.viewDevices[deviceId] =
                true;


            guardarStats(stats);


            res.json({

                ok: true,

                registrada: true,

                views:
                    stats.views

            });


        } catch (error) {

            console.error(
                "Error /stats/view:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);




/*====================================================
    ESTADO DEL LIKE
====================================================*/

app.get(
    "/stats/like",
    (req, res) => {

        try {

            const deviceId =
                String(
                    req.query.deviceId || ""
                ).trim();


            if (!deviceId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "deviceId requerido."

                });

            }


            const stats =
                leerStats();


            const liked =
                !!stats.likeDevices[
                    deviceId
                ];


            res.json({

                ok: true,

                liked: liked,

                likes:
                    stats.likes

            });


        } catch (error) {

            console.error(
                "Error GET /stats/like:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);

/*====================================================
    LIKE / QUITAR LIKE
====================================================*/

app.post(
    "/stats/like",
    express.json(),
    (req, res) => {

        try {

            const deviceId =
                String(
                    req.body.deviceId || ""
                ).trim();


            if (!deviceId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "deviceId requerido."

                });

            }


            const stats =
                leerStats();


            /*
                SI YA DIO LIKE
                → QUITAR LIKE
            */

            if (
                stats.likeDevices[deviceId]
            ) {

                delete
                    stats.likeDevices[
                        deviceId
                    ];


                stats.likes =
                    Math.max(
                        0,
                        stats.likes - 1
                    );


                guardarStats(stats);


                return res.json({

                    ok: true,

                    liked: false,

                    likes:
                        stats.likes

                });

            }


            /*
                SI NO DIO LIKE
                → AGREGAR LIKE
            */

            stats.likeDevices[deviceId] =
                true;


            stats.likes++;


            guardarStats(stats);


            res.json({

                ok: true,

                liked: true,

                likes:
                    stats.likes

            });


        } catch (error) {

            console.error(
                "Error POST /stats/like:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);




/*====================================================
    ESTADO DE COMPARTIDOS
====================================================*/

app.get(
    "/stats/share",
    (req, res) => {

        try {

            const deviceId =
                String(
                    req.query.deviceId || ""
                ).trim();


            if (!deviceId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "deviceId requerido."

                });

            }


            const stats =
                leerStats();


            const shared =
                !!stats.shareDevices[
                    deviceId
                ];


            res.json({

                ok: true,

                shared: shared,

                shares:
                    stats.shares

            });


        } catch (error) {

            console.error(
                "Error GET /stats/share:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);


/*====================================================
    REGISTRAR COMPARTIDO
    UNA SOLA VEZ POR DISPOSITIVO
====================================================*/

app.post(
    "/stats/share",
    express.json(),
    (req, res) => {

        try {

            const deviceId =
                String(
                    req.body.deviceId || ""
                ).trim();


            if (!deviceId) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "deviceId requerido."

                });

            }


            const stats =
                leerStats();


            /*
                YA COMPARTIÓ
                NO VOLVER A CONTAR
            */

            if (
                stats.shareDevices[deviceId]
            ) {

                return res.json({

                    ok: true,

                    compartida: false,

                    shares:
                        stats.shares

                });

            }


            /*
                NUEVO COMPARTIDO
            */

            stats.shares++;


            stats.shareDevices[deviceId] =
                true;


            guardarStats(stats);


            res.json({

                ok: true,

                compartida: true,

                shares:
                    stats.shares

            });


        } catch (error) {

            console.error(
                "Error POST /stats/share:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);


/*====================================================
    ADMINISTRAR ESTADÍSTICAS
====================================================*/

app.post(
    "/admin/stats",
    express.json(),
    requireAdmin,
    (req, res) => {

        try {

            let views =
                Number(req.body.views);

            let likes =
                Number(req.body.likes);

            let shares =
                Number(req.body.shares);


            /*
                VALIDACIONES
            */

            if (
                !Number.isInteger(views) ||
                views < 0 ||
                views > 1000000000
            ) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "El número de visualizaciones no es válido."

                });

            }


            if (
                !Number.isInteger(likes) ||
                likes < 0 ||
                likes > 1000000000
            ) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "El número de likes no es válido."

                });

            }


            if (
                !Number.isInteger(shares) ||
                shares < 0 ||
                shares > 1000000000
            ) {

                return res.status(400).json({

                    ok: false,

                    error:
                        "El número de compartidos no es válido."

                });

            }


            const stats =
                leerStats();


            /*
                ACTUALIZAR CONTADORES
            */

            stats.views =
                views;

            stats.likes =
                likes;

            stats.shares =
                shares;


            /*
                IMPORTANTE:

                Al modificar manualmente los
                contadores reiniciamos los
                dispositivos que ya registraron
                estas acciones.

                Así el nuevo número se convierte
                en la nueva base.
            */

            stats.viewDevices = {};

            stats.likeDevices = {};

            stats.shareDevices = {};


            guardarStats(stats);


            res.json({

                ok: true,

                views:
                    stats.views,

                likes:
                    stats.likes,

                shares:
                    stats.shares

            });


        } catch (error) {

            console.error(
                "Error administrando estadísticas:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    "No se pudieron guardar las estadísticas."

            });

        }

    }
);



/*====================================================
    OBTENER ESTADÍSTICAS PARA ADMIN
====================================================*/

app.get(
    "/admin/stats",
    requireAdmin,
    (req, res) => {

        try {

            const stats =
                leerStats();


            res.json({

                ok: true,

                views:
                    stats.views,

                likes:
                    stats.likes,

                shares:
                    stats.shares

            });


        } catch (error) {

            console.error(
                "Error obteniendo estadísticas admin:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    "No se pudieron obtener las estadísticas."

            });

        }

    }
);




/*====================================================
    POSICIÓN DE CARDSTATS
====================================================*/

const CARD_STATS_POSITION_FILE =
    "card-stats-position.json";


/*====================================================
    OBTENER POSICIONES DE CARDSTATS
    WEB + CELULAR
====================================================*/

app.get(
    "/card-stats/position",

    (req, res) => {

        try {

            /*
                Si todavía no existe el archivo,
                devolver posiciones iniciales.
            */

            if (
                !fs.existsSync(
                    CARD_STATS_POSITION_FILE
                )
            ) {

                return res.json({

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

                });

            }


            /*
                Leer archivo
            */

            const datos =
                JSON.parse(
                    fs.readFileSync(
                        CARD_STATS_POSITION_FILE,
                        "utf8"
                    )
                );


            /*
                DEVOLVER WEB
            */

            const web = {

                x:
                    Number.isFinite(
                        Number(
                            datos.web?.x
                        )
                    )
                        ? Number(
                            datos.web.x
                        )
                        : 0,


                y:
                    Number.isFinite(
                        Number(
                            datos.web?.y
                        )
                    )
                        ? Number(
                            datos.web.y
                        )
                        : 230,


                locked:
                    datos.web?.locked === true

            };


            /*
                DEVOLVER CELULAR
            */

            const mobile = {

                x:
                    Number.isFinite(
                        Number(
                            datos.mobile?.x
                        )
                    )
                        ? Number(
                            datos.mobile.x
                        )
                        : 0,


                y:
                    Number.isFinite(
                        Number(
                            datos.mobile?.y
                        )
                    )
                        ? Number(
                            datos.mobile.y
                        )
                        : 230,


                locked:
                    datos.mobile?.locked === true

            };


            res.json({

                web: web,

                mobile: mobile

            });


        } catch (error) {

            console.error(
                "Error obteniendo posiciones de CardStats:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);

/*====================================================
    GUARDAR POSICIONES DE CARDSTATS
    WEB + CELULAR
====================================================*/

app.post(
    "/card-stats/position",

    express.json(),

    requireAdmin,

    (req, res) => {

        try {

            const datos =
                req.body;


            /*
                LIMPIAR UNA POSICIÓN
            */

            function limpiarPosicion(
                posicion
            ) {

                const x =
                    Number(
                        posicion?.x
                    );


                const y =
                    Number(
                        posicion?.y
                    );


                return {

                    x:
                        Number.isFinite(x)
                            ? Math.max(
                                0,
                                Math.round(x)
                            )
                            : 0,


                    y:
                        Number.isFinite(y)
                            ? Math.max(
                                0,
                                Math.round(y)
                            )
                            : 230,


                    locked:
                        posicion?.locked === true

                };

            }


            /*
                CREAR OBJETO FINAL
            */

            const posiciones = {

                web:
                    limpiarPosicion(
                        datos.web
                    ),


                mobile:
                    limpiarPosicion(
                        datos.mobile
                    )

            };


            /*
                GUARDAR EN ARCHIVO
            */

            fs.writeFileSync(

                CARD_STATS_POSITION_FILE,

                JSON.stringify(
                    posiciones,
                    null,
                    2
                ),

                "utf8"

            );


            console.log(
                "CARDSTATS → posiciones guardadas:",
                posiciones
            );


            /*
                RESPUESTA
            */

            res.json({

                ok: true,

                web:
                    posiciones.web,

                mobile:
                    posiciones.mobile

            });


        } catch (error) {

            console.error(
                "Error guardando posiciones de CardStats:",
                error
            );


            res.status(500).json({

                ok: false,

                error:
                    error.message

            });

        }

    }
);



app.post(
    "/guardarLogo",
    requireAdmin,
    (req, res) => {

        const { logo } = req.body;

        let html =
            fs.readFileSync(
                "index.html",
                "utf8"
            );

        html =
            html.replace(
                /<img\s+id="logo"[\s\S]*?src=".*?"/,
                `<img id="logo" src="${logo}"`
            );

        html =
            html.replace(
                /<link id="favicon".*?>/,
                `<link id="favicon" rel="shortcut icon" href="${logo}" type="image/x-icon">`
            );

        fs.writeFileSync(
            "index.html",
            html
        );

        res.json({
            ok: true
        });

    }
);





/*====================================================
        LOGIN DEL ADMINISTRADOR
====================================================*/

app.post("/admin/login", async (req, res) => {

    try {

        const { usuario, password } = req.body;


        if (
            typeof usuario !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({

                ok: false,

                error: "Datos de acceso inválidos."

            });

        }


        const usuarioCorrecto =
            usuario.trim().toLowerCase() ===
            String(process.env.ADMIN_USER)
                .trim()
                .toLowerCase();


        if (!usuarioCorrecto) {

            return res.status(401).json({

                ok: false,

                error: "Usuario o contraseña incorrectos."

            });

        }



        /*====================================================
                COMPROBAR CONTRASEÑA
        ====================================================*/

        const passwordCorrecta =
            await bcrypt.compare(
                password,
                process.env.ADMIN_HASH
            );


        if (!passwordCorrecta) {

            return res.status(401).json({

                ok: false,

                error:
                    "Usuario o contraseña incorrectos."

            });

        }


        /*====================================================
                CREAR SESIÓN ADMIN
        ====================================================*/

        req.session.admin = true;



        res.json({

            ok: true

        });


    } catch (error) {

        console.error(
            "Error en login:",
            error
        );


        res.status(500).json({

            ok: false,

            error:
                "Error interno del servidor."

        });

    }

});




/*====================================================
        LOGOUT DEL ADMINISTRADOR
====================================================*/

app.post(
    "/admin/logout",
    (req, res) => {

        req.session.destroy((error) => {

            if (error) {

                console.error(
                    "Error cerrando sesión:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    error:
                        "No se pudo cerrar la sesión."
                });

            }

            res.clearCookie(
                "connect.sid"
            );

            res.json({
                ok: true
            });

        });

    }
);


app.get("/admin/status",(req,res)=>{

    res.json({

        admin:req.session.admin===true

    });

});



app.use((err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        return res.status(400).json({

            ok: false,

            error: err.message

        });

    }

    if (err) {

        return res.status(400).json({

            ok: false,

            error: err.message

        });

    }

    next();

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor iniciado en el puerto ${PORT}`
    );
});





