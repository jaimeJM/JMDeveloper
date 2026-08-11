
const express = require("express");
const session = require("express-session");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

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

    secret:"jmdeveloper",

    resave:false,

    saveUninitialized:false,

    cookie:{
        maxAge:24*60*60*1000
    }

}));


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






app.post("/admin/login",(req,res)=>{

    req.session.admin=true;

    res.json({
        ok:true
    });

});

app.post("/admin/logout",(req,res)=>{

    req.session.admin=false;

    res.json({
        ok:true
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
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});



app.listen(3000, "192.168.0.3", () => {
    console.log("Servidor iniciado");
});

/*
app.listen(3000,()=>{
    console.log("Servidor iniciado en http://localhost:3000");
});*/




