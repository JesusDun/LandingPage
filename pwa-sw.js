// Creamos una función para mandar a llamar la ruta completa del proyecto y poder pasar como parámetro el archivo para conformar la ruta, esto para evitar redundancia.
function asset(file) {
    return `/test/pwas/templatemo_623_novapay/${(file ? file : "")}`
}
 
function syncNotifications(reg) {}
function periodicSyncNotifications(reg) {}
function pushNotification(reg, title, body) {
    if (Notification.permission !== "granted") {
        console.log("info")
        console.info("Sin permisos para enviar notificaciones.")
        return false
    }
 
    reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "GENERA_TU_APPLICATION_SERVER_KEY"
    })
    .then(function (pushSubscription) {
        console.log("info")
        console.info("Yey!", pushSubscription)
 
        let data = new FormData();
        data.append("sub", JSON.stringify(pushSubscription))
        data.append("title", title)
        data.append("body", body)
 
        fetch(asset("web-push-push-server.php"), {
            method: "POST",
            body: data
        })
        .then(function (res) {
            res.text()
        })
        .then(function (txt) {
            console.log("log")
            console.log(txt)
        })
        .catch(function (err) {
            console.log("error")
            console.error("Boo!", err)
        })
    })
    .catch(function (err) {
        console.log("error")
        console.error("Boo!", err)
    })
}
 
// Usamos un sufijo de acuerdo al nombre de nuestra aplicación web, yo he usado pwa, pero ustedes pueden considerar otro, estas constantes se volverán a utilizar.
const PRECACHENAME          = "pwa-precache-v1"
const SYNCEVENTNAME         = "pwa-sync-notifications"
const PERIODICSYNCEVENTNAME = "pwa-periodic-sync-notifications"
 
// Definición de la página offline de nuestra aplicación web.
const OFFLINEURL            = asset("offline.html")
 
// Definimos los archivos que queremos que funcionen offline.
const PRECACHEFILES         = [
    // Sí o sí tenemos que incluir los iconos, manifest, index.html, ruta manifest del index.html y la página offline.
    asset("favicon.ico"),
    asset("favicon.png"),
    asset("favicon-512x512.png"),
    asset("favicon-maskable.png"),
    asset("manifest.json"),
    asset(),
    asset("?source=pwa"),
    OFFLINEURL,
 
    // Aquí ya puedes añadir los archivos y CDNs del proyecto.
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap",

    asset("templatemo-623-novapay-style.css"),
    asset("images/phone-app-screenshot.jpg"),
    asset("templatemo-623-novapay-script.js")
]
 
self.addEventListener("message", function (event) {
    console.log("info")
    console.info("Mensaje recibido del cliente:", event.data)
})
self.addEventListener("install", function (event) {
    event.waitUntil(
        (async function () {
            const cache  = await caches.open(PRECACHENAME)
            const length = PRECACHEFILES.length
 
            for (let x in PRECACHEFILES) {
                const file = PRECACHEFILES[x]
                try {
                    await cache.add(file)
                }
                catch (error) {
                    console.log("error")
                    console.error(`Error al cachear: ${file}`, error)
                }
 
                self.clients.matchAll({
                    includeUncontrolled: true,
                    type: "window"
                }).then(function (clients) {
                    clients.forEach(function (client) {
                        client.postMessage({
                            subject: "installationProgress",
                            message: {
                                length: length,
                                x: x
                            }
                        })
                    })
                })
            }
        })()
 
    )
})
self.addEventListener("activate", function (event) {
    // event.waitUntil()
})
self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (cachedResponse) {
            return cachedResponse || fetch(event.request).catch(async function (err) {
                if (event.request.mode === "navigate") {
                    const cache = await caches.open(PRECACHENAME)
                    const cachedResponse = await cache.match(OFFLINEURL)
 
                    return cachedResponse
                }
            })
        })
        .catch(function (err) {
            console.log("error")
            console.error("Boo!", err)
        })
    )
})
self.addEventListener("sync", function (event) {
    console.log("info")
    console.info("sync event", event)
 
    if (event.tag === SYNCEVENTNAME) {
        event.waitUntil(syncNotifications(registration))
    }
})
self.addEventListener("periodicsync", function (event) {
    console.log("info")
    console.info("periodic sync event", event)
 
    if (event.tag === PERIODICSYNCEVENTNAME) {
        event.waitUntil(periodicSyncNotifications(registration))
    }
})
self.addEventListener("push", function (event) {
    console.log("info")
    console.info(event.data)
 
    const data = event.data.json()
 
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        image: data.image
    })
})