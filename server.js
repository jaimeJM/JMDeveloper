
require("dotenv").config();

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

app.use(session({

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: false
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



app.post("/config",(req,res)=>{

    guardarConfiguracion(req.body);

    res.json({
        ok:true
    });

});

app.post("/uploadLogo", upload.single("logo"), (req, res) => {

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
app.post("/uploadFont", upload.single("font"), (req, res) => {

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
app.post("/uploadCardImage", upload.single("cardImage"), (req, res) => {

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

app.post(
    "/uploadCardWatermark",
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

app.post("/removeCardImage",(req,res)=>{

    const configuracion = leerConfiguracion();

    eliminarImagenAnterior(configuracion.cardImage);

    configuracion.cardImage = "";

    guardarConfiguracion(configuracion);

    res.json({
        ok:true
    });

});



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

app.post("/botones", express.json(), (req, res) => {

    guardarBotones(req.body);

    res.json({

        ok: true

    });

});


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

            viewDevices: {},

            likeDevices: {}

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

            viewDevices:
                datos.viewDevices || {},

            likeDevices:
                datos.likeDevices || {}

        };


    } catch (error) {

        console.error(
            "Error leyendo stats.json:",
            error
        );


        return {

            views: 0,

            likes: 0,

            viewDevices: {},

            likeDevices: {}

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
    POSICIÓN DE CARDSTATS
====================================================*/

const CARD_STATS_POSITION_FILE =
    "card-stats-position.json";


/*====================================================
    OBTENER POSICIÓN
====================================================*/

app.get(
    "/card-stats/position",
    (req, res) => {

        try {

            if (
                !fs.existsSync(
                    CARD_STATS_POSITION_FILE
                )
            ) {

                return res.json({
                    left: 0,
                    top: 230
                });

            }


            const datos =
                JSON.parse(
                    fs.readFileSync(
                        CARD_STATS_POSITION_FILE,
                        "utf8"
                    )
                );


            res.json({

                left:
                    Number(datos.left) || 0,

                top:
                    Number(datos.top) || 230

            });


        } catch (error) {

            console.error(
                "Error obteniendo posición de cardStats:",
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
    GUARDAR POSICIÓN
====================================================*/

app.post("/card-stats/position",
    express.json(),
    (req, res) => {

if (req.session.admin !== true) {

    return res.status(403).json({
        ok: false,
        error: "Solo el administrador puede mover cardStats."
    });

}



        try {

            let left =
                Number(req.body.left);


            let top =
                Number(req.body.top);


            if (!Number.isFinite(left)) {
                left = 100;
            }


            if (!Number.isFinite(top)) {
                top = 364;
            }


            /*
                Evitar valores absurdos
            */

            left =
                Math.max(
                    0,
                    Math.round(left)
                );


            top =
                Math.max(
                    0,
                    Math.round(top)
                );


            const datos = {

                left: left,

                top: top

            };


            fs.writeFileSync(

                CARD_STATS_POSITION_FILE,

                JSON.stringify(
                    datos,
                    null,
                    2
                ),

                "utf8"

            );


            res.json({

                ok: true,

                ...datos

            });


        } catch (error) {

            console.error(
                "Error guardando posición de cardStats:",
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





app.post("/guardarLogo",(req,res)=>{

    const {logo}=req.body;

    let html=fs.readFileSync(
        "index.html",
        "utf8"
    );

    // Cambiar imagen del logo
    html=html.replace(
        /<img\s+id="logo"[\s\S]*?src=".*?"/,
        `<img id="logo" src="${logo}"`
    );

    // Cambiar favicon
    html=html.replace(
        /<link id="favicon".*?>/,
        `<link id="favicon" rel="shortcut icon" href="${logo}" type="image/x-icon">`
    );

    fs.writeFileSync(
        "index.html",
        html
    );

    res.json({ok:true});

});






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


        const passwordCorrecta =
            await bcrypt.compare(
                password,
                process.env.ADMIN_PASSWORD_HASH
            );


        if (!passwordCorrecta) {

            return res.status(401).json({

                ok: false,

                error: "Usuario o contraseña incorrectos."

            });

        }


        req.session.admin = true;

        console.log(
    "LOGIN ADMIN:",
    req.session.admin
);

console.log(
    "SESSION ID:",
    req.sessionID
);


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

            error: "Error interno del servidor."

        });

    }

});




/*====================================================
        LOGOUT DEL ADMINISTRADOR
====================================================*/

app.post("/admin/logout", (req, res) => {

    req.session.destroy(error => {

        if (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );

            return res.status(500).json({

                ok: false,

                error: "No se pudo cerrar la sesión."

            });

        }


        res.clearCookie("connect.sid");


        res.json({

            ok: true

        });

    });

});



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





