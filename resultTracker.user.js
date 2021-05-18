// ==UserScript==
// @name        Kalinka Result Tracker
// @namespace   kal.in.ka
// @author      Kalinka
// @description Result Tracker for Ogame
// @include     *ogame.gameforge.com/game/*
// @version     0.5.8+es1
// @grant       GM_xmlhttpRequest
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require     https://canvasjs.com/assets/script/canvasjs.min.js
// @license MIT
// @updateURL https://github.com/COhsrt/ResultTracker/raw/master/resultTracker.user.js
// @downloadURL https://github.com/COhsrt/ResultTracker/raw/master/resultTracker.user.js
// ==/UserScript==
/*
TODOS:
  - use indexedDB
  - show expedition outcome average
  - show combat outcome average

 */


"use strict";
(function() {
    // No Raid Tracker on Fleetdispatch
    if(window.location.search.indexOf("component=fleetdispatch") !== -1) {
        return;
    }
    const shipPrice = {
        202:{"m":2000,"c":2000,"d":0},
        203:{"m":6000,"c":6000,"d":0},
        204:{"m":3000,"c":1000,"d":0},
        205:{"m":6000,"c":4000,"d":0},
        206:{"m":20000,"c":7000,"d":2000},
        207:{"m":45000,"c":15000,"d":0},
        208:{"m":10000,"c":20000,"d":10000},
        209:{"m":10000,"c":6000,"d":2000},
        210:{"m":0,"c":1000,"d":0},
        211:{"m":50000,"c":25000,"d":15000},
        212:{"m":0,"c":2000,"d":500},
        213:{"m":60000,"c":50000,"d":15000},
        214:{"m":5000000,"c":4000000,"d":1000000},
        215:{"m":30000,"c":40000,"d":15000},
        217:{"m":2000,"c":2000,"d":1000},
        218:{"m":85000,"c":55000,"d":20000},
        219:{"m":8000,"c":15000,"d":8000},
        401:{"m":2000,"c":0,"d":0},
        402:{"m":1500,"c":500,"d":0},
        403:{"m":6000,"c":2000,"d":0},
        404:{"m":20000,"c":15000,"d":2000},
        405:{"m":5000,"c":3000,"d":0},
        406:{"m":50000,"c":50000,"d":30000},
        407:{"m":10000,"c":10000,"d":0},
        408:{"m":50000,"c":50000,"d":0}
    }

    /**
     Multilanguage stuff
     **/
    const language = document.getElementsByTagName('meta')['ogame-language'].content;
    const multiLang = {
        de: {
            resources: {
                'metal': 'Metall',
                'crystal': 'Kristall',
                'deuterium': 'Deuterium',
                'dm': 'Dunkle Materie'
            },
            otherExpo: {
                // Aliens
                ".+Alienrasse.+": 'alien',
                ".+kleinen Gruppe unbekannter.+": 'alien',
                ".+fremdartig anmutende Schiffe.+": 'alien',
                ".+unbekannte.* Spezies.+": 'alien',
                ".+Aggressoren.+": 'alien',
                // Delay
                ".+l.nger dauern.+": 'delay',
                ".+Versp.tung.+": 'delay',
                ".+erheblich mehr Zeit.+": 'delay',
                ".+Das fremde Schiff explodierte.+": 'delay',
                ".+das gesamte Deuterium.+": 'delay',
                ".+dass es einige Zeit dauerte.+": 'delay',
                // Item
                ".+Gegenstand.+": 'item',
                ".+Artefakt.+": 'item',
                // Loss
                ".+Zzzrrt.+": "loss",
                ".+r.tseln noch immer.+verloren.+": "loss",
                ".+Kernbruch.+": 'loss',
                ".+ffnenden schwarzen Loch.+": 'loss',
                // Merchant
                ".+Exklusivkunden.+": "merchant",
                ".+Tauschwaren.+": 'merchant',
                // Nothing
                ".+Sumpfplaneten.+": "nothing",
                ".+Reaktorfehler.+": "nothing",
                ".+Deuterium-Mangel.+": "nothing",
                ".+Halluzinationen.+": 'nothing',
                ".+Bestes-Bild-des-Universums-Wettbewerb.+": 'nothing',
                ".+Leere des Alls.+": 'nothing',
                ".+Museen deines Hauptplaneten.+": 'nothing',
                ".+unverrichteter Dinge.+": 'nothing',
                ".+Strategiespiel.+": 'nothing',
                ".+Computervirus.+": 'nothing',
                ".+Dschungelfieber.+": 'nothing',
                ".+leere.+H.nden.+": 'nothing',
                // Pirate
                ".+Sternen-Freibeuter.+": 'pirate',
                ".+Piratenbasis.+": 'pirate',
                ".+Weltraumpiraten.+": 'pirate',
                ".+ Piraten .+": 'pirate',
                ".+ Piratenschiffen.+": 'pirate',
                ".+primitive Barbaren.+": 'pirate',
                // Speedup
                ".+Wurmloch.+": 'speedup',
                ".+beschleunigt.+": 'speedup',
            },
            expoTypes: {
                'alien': 'Aliens',
                'delay': 'Verzögerung',
                'item': 'Gegenstand',
                'loss': 'Totalverlust',
                'merchant': 'Händler',
                'nothing': 'Nichts',
                'pirate': 'Piraten',
                'speedup': 'Beschleunigung',
                'dm': 'Dunkle Materie',
                'resource': 'Rohstoffe',
                'ship': 'Schiffe'
            },
            dateRegex: '(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\d{2}):(\\d{2}):(\\d{2})',
            dateKeys: [3, 2, 1, 4, 5, 6],

        },
        es: {
            resources: {
                'metal': 'Metal de',
                'crystal': 'Cristal de',
                'deuterium': 'Deuterio de',
                'dm': 'Materia Oscura de'
            },
            otherExpo: {
                // Alien
                ".+exótico aspecto.+": 'alien',
                ".+especie desconocida.+": 'alien',
                ".+naves sin identificar.+": 'alien',
                ".+identificar a los agresores.+": 'alien',
                ".+alienígena desconocida.+": 'alien',
                // Delay
                ".+gran retraso.+": 'delay',
                ".+necesitará un tiempo.+": 'delay',
                ".+llevar más tiempo.+": 'delay',
                ".+flota se retrasa.+": 'delay',
                ".+necesitará mucho más tiempo.+": 'delay',
                ".+flota iniciará el viaje de vuelta.+": 'delay',
                // Item
                ".+item.+": 'item',
                // Loss
                ".+destruyó espectacularmente la flota.+": 'loss',
                ".+Krrrzzzzt.+": 'loss',
                ".+agujero negro.+": 'loss',
                ".+se perdió para siempre.+": 'loss',
                // Merchant
                ".+cliente exclusivo.+": 'merchant',
                ".+representante con bienes comerciales.+": 'merchant',
                // Nothing
                ".+Un ser de pura energía.+": 'nothing',
                ".+siendo emitidas desde una vieja sonda.+": 'nothing',
                ".+mejor foto del universo este año!.+": 'nothing',
                ".+escasez de personal.+": 'nothing',
                ".+no ha descubierto mucho más.+": 'nothing',
                ".+no fue realmente satisfactoria.+": 'nothing',
                ".+juego de estrategia.+": 'nothing',
                ".+manos vacías.+": 'nothing',
                ".+vacío del espacio.+": 'nothing',
                ".+sin ningún resultado.+": 'nothing',
                ".+no trae nada interesante.+": 'nothing',
                ".+sin haber conseguido nada.+": 'nothing',
                // Pirates
                ".+piratas.+": 'pirate',
                ".+bárbaros primitivos.+": 'pirate',
                ".+bucaneros estelares.+": 'pirate',
                // Speedup
                ".+agujero de gusano.+": 'speedup',
                ".+aceleró la vuelta.+": 'speedup',
                ".+aceleró enormemente.+": 'speedup'
            },
            expoTypes: {
                'alien': 'Aliens',
                'delay': 'Retraso',
                'item': 'Objeto',
                'loss': 'Pérdida de flota',
                'merchant': 'Mercader',
                'nothing': 'Nada',
                'pirate': 'Piratas',
                'speedup': 'Aceleración',
                'dm': 'Materia Oscura',
                'resource': 'Recursos',
                'ship': 'Naves'
            },
            dateRegex: '(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\d{2}):(\\d{2}):(\\d{2})',
            dateKeys: [3, 2, 1, 4, 5, 6],
        },
        en: {
            resources: {
                'metal': 'Metal',
                'crystal': 'Crystal',
                'deuterium': 'Deuterium',
                'dm': 'Dark Matter'
            },
            otherExpo: {
                // Alien
                ".+alien race.+": 'alien',
                ".+unknown ships.+": 'alien',
                ".+exotic looking ships.+": 'alien',
                ".+unknown species.+": 'alien',
                ".+aggressors.+": 'alien',
                // Delay
                ".+going to take longer than thought.+": 'delay',
                ".+delay.+": 'delay',
                ".+take a lot more time.+": 'delay',
                ".+foreign ship exploded.+": 'delay',
                ".+(later|longer) than expected.+": 'delay',
                ".+all the Deuterium.+": 'delay',
                // Item
                ".+item.+": 'item',
                ".+artefact.+": 'item',
                // Loss
                ".+black hole.+": 'loss',
                ".+is lost forever.+": 'loss',
                //
                // Merchant
                ".+exclusive client.+": 'merchant',
                ".+representative with goods.+": 'merchant',
                // Nothing
                ".+unknown marsh planet.+": 'nothing',
                ".+flagships reactor core nearly.+": 'nothing',
                ".+had way too little Deuterium.+": 'nothing',
                ".+hallucination.+": 'nothing',
                ".+some solar wind.+": 'nothing',
                ".+Best Picture Of The Universe.+": 'nothing',
                ".+emptiness of space.+": 'nothing',
                ".+museums of your home planet.+": 'nothing',
                //
                //
                ".+computer virus.+": 'nothing',
                ".+high fever.+": 'nothing',
                ".+without any results.+": 'nothing', // <-- probably other position in "nothing"
                ".+empty handed.+": 'nothing',
                // Pirates
                ".+Star Buccaneers.+": 'pirate',
                ".+space pirates.+": 'pirate',
                //
                ".+ pirates.+": 'pirate',
                //
                ".+primitive barbarians.+": 'pirate',
                // Speedup
                ".+wormhole.+": 'speedup',
                ".+earlier than expected.+": 'speedup',
            },
            expoTypes: {
                'alien': 'Aliens',
                'delay': 'Delay',
                'item': 'Item',
                'loss': 'Expedition Loss',
                'merchant': 'Merchant',
                'nothing': 'Nothing',
                'pirate': 'Pirate',
                'speedup': 'Speedup',
                'dm': 'Dark Matter',
                'resource': 'Resource',
                'ship': 'Ships'
            },
            dateRegex: '(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\d{2}):(\\d{2}):(\\d{2})',
            dateKeys: [3, 2, 1, 4, 5, 6],
        },
        no: {
            resources: {
                'metal': 'Metall',
                'crystal': 'Krystall',
                'deuterium': 'Deuterium',
                'dm': 'Mørkt Materiale'
            },
            otherExpo: {
                // Alien
                ".+eksotisk seriemessige.+": 'alien',
                ".+ukjent art.+": 'alien',
                ".+liten gruppe av ukjente skip.+": 'alien',
                ".+romvesen innvasjons.+": 'alien',
                ".+aggressiv krigersk romvesen rase.+": 'alien',
                // Delay
                ".+feilkalkullert.+": 'delay',
                ".+ekspedisjonen ikke kan fortsette med skadene .+": 'delay',
                ".+Fl.ten vil komme tilbake senere enn forventet.+": 'delay',
                ".+returnere med en stor forsinkelse.+": 'delay',
                ".+Hjemreisen vil ta litt lengre.+": 'delay',
                ".+lengre tid enn ventet.+": 'delay',
                // Item
                ".+item.+": 'item',
                ".+artefact.+": 'item',
                // Loss
                ".+svart hull.+": 'loss',
                ".+Zzzrrt.+": 'loss',
                ".+for at fl.ten er tapt for alltid.+": 'loss',
                ".+kjedereaksjon+.": 'loss',
                // Merchant
                ".+ekslusive klient.+": 'merchant',
                ".+en representant med ressurser.+": 'merchant',
                // Nothing
                ".+installerte ett gammelt strategi spill.+": 'nothing',
                ".+tilbake tomhendt.+": 'nothing',
                ".+fordi de ikke hadde nok Deuterium.+": 'nothing',
                ".+store tomheten.+": 'nothing',
                ".+uten . ha gjennomf.rt noe.+": 'nothing',
                ".+sump planet.+": 'nothing',
                ".+museer p. din hjem planet.+": 'nothing',
                ".+komputer virus.+": 'nothing',
                ".+Beste Bildet.+": 'nothing',
                ".+store tomheten i rommet.+": 'nothing',
                ".+P. grunn av dette ble mye Deuterium brukt opp .+": 'nothing',
                ".+kapteinens bursdags.+": 'nothing',
                ".+massive hallusinasjoner.+": 'nothing',
                // Pirates
                ".+primitive barbarer.+": 'pirate',
                ".+pirater.+": 'pirate',
                // Speedup
                ".+kommer hjem litt.+": 'speedup',
                ".+returner tidligere.+": 'speedup',
                ".+ormhull for . korte ned flyturen tilbake.+": 'speedup',
            },
            expoTypes: {
                'alien': 'Alien/Romvesener',
                'delay': 'Delay/forsinkelse',
                'item': 'Item/Punkt',
                'loss': 'Expedition Loss/totalt tap',
                'merchant': 'Merchant/Kjøpmann',
                'nothing': 'Nothing/Ingenting',
                'pirate': 'Pirate/Sjørøver',
                'speedup': 'Speedup/Forkortelse',
                'dm': 'Dark Matter/Mørkt Materiale',
                'resource': 'Resource/Ressurs',
                'ship': 'Ships/Skip'
            },
            dateRegex: '(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\d{2}):(\\d{2}):(\\d{2})',
            dateKeys: [3, 2, 1, 4, 5, 6],
        },
        gr: {
            resources: {
                'metal': 'Μέταλλο',
                'crystal': 'Κρύσταλλο',
                'deuterium': 'Δευτέριο',
                'dm': 'Αντιύλη'
            },
            otherExpo: {
                // Alien
                ".+Μερικά σκάφη με εντυπωσιακή εμφάνιση.+": 'alien',
                ".+κάποια άγνωστης προέλευσης όντα.+": 'alien',
                ".+άγνωστων σκαφών.+": 'alien',
                // Delay
                ".+καθυστερήσει λίγο παραπάνω.+": 'delay',
                ".+αργότερα από το αναμενόμενο.+": 'delay',
                ".+επιστρέψει με μεγάλη καθυστέρηση.+": 'delay',
                ".+θα καθυστερήσει.+": 'delay',
                ".+περισσότερο χρόνο για να επιστρέψει.+": 'delay',
                ".+Μόλις ολοκληρωθούν οι απαραίτητες επισκευές.+": 'delay',
                ".+μεγάλη καθυστέρηση.+": 'delay',
                // Item
                ".+αντικείμενο.+": 'item',
                // Loss
                ".+zzzzzzzzzzzzzzzzz.+": 'loss',
                ".+ότι ο στόλος χάθηκε για.+": 'loss',
                ".+πυρηνική έκρηξη κατάστρεψε.+": 'loss',
                // Merchant
                ".+αποκλειστικός του πελάτης.+": 'merchant',
                // Nothing
                ".+Τα γενέθλια του καπετάνιου.+": 'nothing',
                ".+Καλύτερη φωτογραφία του Σύμπαντος.+": 'nothing',
                ".+επιστρέψαμε πίσω με άδεια χέρια.+": 'nothing',
                ".+ελώδη πλανήτη.+": 'nothing',
                ".+ παλιό παιχνίδι στρατηγικής.+": 'nothing',
                ".+αυτές οι αστρικές διαταραχές επιπέδου 5.+": 'nothing',
                ".+κενό του διαστήματος.+": 'nothing',
                ".+ελάχιστο Δευτέριο.+": 'nothing',
                ".+πεδίο βαρύτητας ενός.+": 'nothing',
                ".+μουσεία από τον κεντρικό σας πλανήτη.+": 'nothing',
                ".+αποστολή απέτυχε.+": 'nothing',
                ".+χωρίς να έχει επιτύχει τίποτα.+": 'nothing',
                // Pirate
                ".+πειρατές.+": 'pirate',
                ".+μεθυσμένους αστροπειρατές.+": 'pirate',
                ".+πρωτόγονη φυλή πειρατών.+": 'pirate',
                // Speedup
                ".+επιστρέφει νωρίτερα από το αναμενόμενο.+": 'speedup',
                ".+σας θα γυρίσει νωρίτερα.+": 'speedup',
                ".+σκουληκότρυπας.+": 'speedup',
            },
            expoTypes: {
                'alien': 'Εξωγήινοι',
                'delay': 'Καθυστέρηση',
                'item': 'Αντικείμενο',
                'loss': 'Χασιμο στόλου',
                'merchant': 'Εμπορος',
                'nothing': 'Τιποτα',
                'pirate': 'Πειρατές',
                'speedup': 'Επιτάχυνση',
                'dm': 'Αντιύλη',
                'resource': ' Πόροι',
                'ship': 'Σκάφη '
            },
            dateRegex: '(\\d{2})\\.(\\d{2})\\.(\\d{4}) (\\d{2}):(\\d{2}):(\\d{2})',
            dateKeys: [3, 2, 1, 4, 5, 6],
        }
    };

    // Database stuff
    const profitDBName = 'ogameProfitDB';
    const expoDBName = 'ogameExpoDB';
    const shipDBName = 'ogameShipDB';
    const minShip = 202;
    const maxShip = 220;
    var profitDB;
    var expoDB;
    var shipDB;

    // Counter
    var reportsToDo = 0;
    var reportsDone = 0;

    init();

    /**
     * initialises the result tracker
     */
    function init() {
        profitDB = getOrCreateDB(profitDBName);
        expoDB = getOrCreateDB(expoDBName);
        shipDB = getOrCreateDB(shipDBName);

        if (Object.keys(shipDB).length === 0) {
            genShipDB();
        }

        if (window.location.search.indexOf("?page=messages") !== -1){
            createButtonMessages();
        }
        createProfitTable();
    }

    /**
     * Generates ShipDatabase
     */
    function genShipDB() {
        fetch('/api/localization.xml').then(function (response) {
            return response.text();
        })
        .then (function (data) {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(data, 'text/xml');
            for (let i = minShip; i < maxShip; i++) {
                if (xmlDoc.getElementById(i)) {
                    shipDB[xmlDoc.getElementById(i).innerHTML] = i;
                }
            }
            saveDB(shipDBName, shipDB);
        });
    }

    /**
     * Creates the Profit Table below the Menu on the left side
     */
    function createProfitTable() {
        const ml = multiLang[language];
        var nixian = false;
        var menuList = document.getElementById("toolbarcomponent");
        if (menuList == null){
            menuList = document.getElementById("leftMenu");
        }
        var table = document.createElement('div');
        table.style = "display:block;float:left;z-index:99999;width:100%";
        var html = "" +
            "<h1 id='header' style='font-size:14px;color:#ffd700;font-weight:bold;background:black;border: 1px solid #383838;border-radius:4px;padding:1px;text-align:center;display:block'>Profits</h1>" +
            "<h2 style='font-size:12px;color:#ffd700;font-weight:bold;background:black;padding:1px;display:block'>" +
            "Last <input type='text' id='specificTime' value='1' min='1' style='text-align:center;border: 1px solid #383838;border-radius: 4px;padding: 1px; width:30px;'> Hours:" +
            "</h2>" +
            "<div style='font-size:10px;color:#6f9fc8;display:block;background:black;' id='daily'>" +
            "<span style='display:block;'>" + ml.resources.metal + ": <span id='s-m'>0</span></span>" +
            "<span style='display:block;'>" + ml.resources.crystal + ": <span id='s-c'>0</span>" +
            "<span style='display:block;'>" + ml.resources.deuterium + ": <span id='s-d'>0</span></span>" +
            "<span style='display:block;'>" + ml.resources.dm + ": <span id='s-dm'>0</span></span>" +
            "<span>Total: <span id='s-t'>0</span></span></div>" +
            genStats('24 Hours:', 'd') +
            genStats('7 Days:', 'w') +
            genStats('28 Days:', 'm') +
            "<div>";
        if (window.location.href.indexOf("messages") === -1) {
            html += "<a class='btn_blue' id='openExpoChart'>Expo Stats Chart</a>";
        }
        html += "</div>";
        if (((localStorage.getItem('NRT_dfDB') != null) && localStorage.getItem('NRT_dfDB').length > 50) ||
            ((localStorage.getItem('NRT_profitDB') != null) &&localStorage.getItem('NRT_profitDB').length > 50) ||
            ((localStorage.getItem('NET_profitDB') != null) &&localStorage.getItem('NET_profitDB').length > 50)) {
            nixian = true;
            html +=
                "<div id='nixButton'>" +
                "<a class='btn_blue' id='importNixian'>Import Nixian Data</a>" +
                "</div>";
        }

        table.innerHTML = html;
        menuList.appendChild(table);
        calcLastDay();
        calcLastWeek();
        calcLastMonth();
        calcLastHours(1, 's');
        document.getElementById('specificTime').addEventListener("change",function() {
            const hours = parseInt(document.getElementById('specificTime').value);
            calcLastHours(hours, 's');
        });
        if (window.location.href.indexOf("messages") === -1) {
            document.getElementById('openExpoChart').addEventListener('click', function () {
                createExpoChart();
            });
        }
        if (nixian) {
            document.getElementById('importNixian').addEventListener('click', function() {
                import_NET_profitDB();
                import_NRT_profitDB();
                import_NRT_dfDB();
                document.getElementById('nixButton').style.visibility = "hidden";
            });
        }
    }

    /**
     * Creates an Expo Chart
     */
    function createExpoChart() {
        const ml = multiLang[language];
        var total = 0;
        var type;
        const stats = [];
        const body = document.getElementById('ingamepage')
        var container = document.createElement('div');
        var titlebar = document.createElement('div');
        var titleSpan = document.createElement('span');
        var titleClose = document.createElement('button');
        var titleCloseThick = document.createElement('span');
        var contentWrapper = document.createElement('div');
        var content = document.createElement('div');

        container.style = 'height: 400px; width: 30%; top: 20%; left: 30%;';
        container.className = 'ui-dialog ';

        titlebar.className = 'ui-dialog-titlebar ui-helper-clearfix';
        container.appendChild(titlebar);

        titleSpan.id = 'ui-id-2';
        titleSpan.className = 'ui-dialog-title';
        titleSpan.innerText = 'Expedition Stats Chart';
        titlebar.appendChild(titleSpan);

        titleClose.type = 'button';
        titleClose.className = 'ui-button ui-dialog-titlebar-close';
        titleClose.role = 'button';
        titleClose.title = '';
        titlebar.appendChild(titleClose);

        titleCloseThick.className = 'ui-icon ui-icon-closethick';
        titleClose.appendChild(titleCloseThick);

        contentWrapper.className = 'ui-dialog-content';
        container.appendChild(contentWrapper);

        content.id = 'content';
        contentWrapper.appendChild(content);

        body.appendChild(container);

        titleCloseThick.addEventListener('click', function () {
            container.remove();
        });

        for (type in expoDB) {
            total = total + expoDB[type];
        }
        for (type in expoDB) {
            stats.push({
                y: expoDB[type]/total*100,
                label: ml.expoTypes[type],
                z: expoDB[type]
            });
        }
        var chart = new CanvasJS.Chart("content", {
            animationEnabled: false,
            toolTipContent: "{label}({z})/"+total+": <strong>{y}%</strong>",
            title: {
                text: ""
            },
            data: [{
                type: "pie",
                startAngle: 240,
                radius: 100,
                indexLabelFontSize: 10,
                yValueFormatString: "##0.00\"%\"",
                indexLabel: "{label} ({z}/"+total+"): {y}",
                dataPoints: stats,
            }]
        });
        chart.render();
        document.getElementsByClassName('canvasjs-chart-credit')[0].style='display: none;';
        document.getElementsByClassName('canvasjs-chart-canvas')[0].style='margin-left:5px;';
    }

    /**
     * Generates generic Statsoutput with title and id-prefix for spans
     * @param title
     * @param prefix
     * @returns {string}
     */
    function genStats(title, prefix) {
        const ml = multiLang[language];
        var str = "" +
            "<h2 style='font-size:12px;color:#ffd700;font-weight:bold;background:black;padding:1px;display:block'>" + title + "</h2>" +
            "<div style='font-size:10px;color:#6f9fc8;display:block;background:black;' id='daily'>" +
            "<span style='display:block;'>" + ml.resources.metal + ": <span id='" + prefix + "-m'>0</span></span>" +
            "<span style='display:block;'>" + ml.resources.crystal + ": <span id='" + prefix + "-c'>0</span>" +
            "<span style='display:block;'>" + ml.resources.deuterium + ": <span id='" + prefix + "-d'>0</span></span>" +
            "<span style='display:block;'>" + ml.resources.dm + ": <span id='" + prefix + "-dm'>0</span></span>" +
            "<span>Total: <span id='" + prefix + "-t'>0</span></span></div>";
        return str;
    }

    /**
     * Checks the current Messages-Sub-Tab for interesting stuff.
     */
    function getMsgs() {
        const crAPIRegex = "cr-[a-z]{2,3}-[0-9]{1,3}-[a-z0-9]{40}"
        const rrAPIRegex = "rr-[a-z]{2,3}-[0-9]{1,3}-[a-z0-9]{40}"
        // Variables
        var apikeyMatch;
        var apikey;
        var reports;
        var currentAPIelements;
        var i;
        var msgId;
        var timestamp;
        var identifier;

        const combatElement = document.getElementById('subtabs-nfFleet21');
        const expeditionElement = document.getElementById('subtabs-nfFleet22');
        const otherElement = document.getElementById('subtabs-nfFleet24');
        // Combat Reports
        if(isActiveTab(combatElement)) {
            reports = getReportsFromElement(combatElement);
            for (i = 0; i < reports.length; ++i) {
                if (reports[i].getAttribute('data-msg-id') !== null) {
                    currentAPIelements = reports[i].getElementsByClassName('icon_apikey');
                    if (currentAPIelements.length !== 0) {
                        if (currentAPIelements[0].title.search(crAPIRegex) !== -1) {
                            msgId = reports[i].getAttribute('data-msg-id');
                            apikeyMatch = currentAPIelements[0].title.match(crAPIRegex);
                            apikey = apikeyMatch[0];
                            if (typeof (profitDB[apikey]) === "undefined") {
                                // Now we can parse this, as every Battle has an API Key now
                                queuedReport();
                                getCR(msgId, apikey);
                            } else {
                                alreadyLogged(msgId);
                            }
                        }
                    }
                }
            }
        }
        // Expedition Reports
        else if (isActiveTab(expeditionElement)) {
            reports = getReportsFromElement(expeditionElement);
            for (i = 0; i < reports.length; i++) {
                if (reports[i].getAttribute('data-msg-id') === null) {
                    // message id is missing, this is another field
                } else {
                    msgId = reports[i].getAttribute('data-msg-id');
                    timestamp = parseDate(reports[i].getElementsByClassName('msg_date fright')[0].innerHTML).getTime() / 1000;
                    identifier = msgId + '' + timestamp;
                    if (typeof(profitDB[identifier]) === "undefined") {
                        queuedReport();
                        parseExpedition(reports[i], msgId, timestamp);
                    } else {
                        alreadyLogged(msgId);
                    }
                }
            }
        }
        // Other Reports
        else if (isActiveTab(otherElement)) {
            reports = getReportsFromElement(otherElement);
            for (i = 0; i < reports.length; ++i) {
                if (reports[i].getAttribute('data-msg-id') !== null) {
                    currentAPIelements = reports[i].getElementsByClassName('icon_apikey');
                    if (currentAPIelements.length !== 0) {
                        if (currentAPIelements[0].title.search(rrAPIRegex) !== -1) {
                            apikeyMatch = currentAPIelements[0].title.match(rrAPIRegex);
                            apikey = apikeyMatch[0];
                            if (typeof (profitDB[apikey]) === "undefined") {
                                // Now we can parse this, as every Battle has an API Key now
                                queuedReport();
                                parseDF(reports[i], apikey);
                            } else {
                                alreadyLogged(msgId);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Parses Debris Extortion based on HTML contents and Language-Knowledge
     * @param report
     * @param apikey
     */
    function parseDF(report, apikey) {
        const rr = "([0-9\\.]{1,30})";
        const mlR = multiLang[language].resources;
        const msgId = report.getAttribute('data-msg-id');
        const content = report.getElementsByClassName('msg_content')[0].innerHTML;
        const timestamp = parseDate(report.getElementsByClassName('msg_date fright')[0].innerHTML).getTime() / 1000;
        const debrisRegex = rr + ' ' + mlR.metal + ' .+ ' + rr + ' ' + mlR.crystal + ' .+ ' + rr + ' ' + mlR.metal +
            ' .+ ' + rr + ' ' + mlR.crystal + '.+';
        if (content.search(debrisRegex) !== -1) {
            const match = content.match(debrisRegex);
            const resources = {"metal": 0, "crystal": 0, "deuterium": 0, 'dm': 0};
            resources.metal = parseInt(match[3].split('.').join(""));
            resources.crystal =  parseInt(match[4].split('.').join(""));
            // Store it to the DB, change counter
            profitDB[apikey] = {'result': resources, 'time': timestamp };
            saveDB(profitDBName, profitDB);
            finishedReport();
            logged(msgId);
        }
    }

    /**
     * Parses Expedition Details based on HTML contents and Language-Knowledge
     * @param report
     */
    function parseExpedition(report, msgId, timestamp) {
        const ml = multiLang[language];
        const content = report.getElementsByClassName('msg_content')[0].innerHTML;
        const identifier = msgId + '' + timestamp;
        var match;
        var resources = {"metal": 0, "crystal": 0, "deuterium": 0, 'dm': 0};
        // Everything which is worth a profit
        if (typeof(profitDB[identifier]) === "undefined") {
            // Ships
            var shipRegex;
            var shipFound = false;
            var shipList = getEmptyShipList();
            for (var ship in shipDB) {
                shipRegex = ship + ': (\\d+)(\\<br\\>)?'
                if (content.search(shipRegex) !== -1) {
                    match = content.match(shipRegex);
                    shipList[shipDB[ship]] += parseInt(match[1]);
                    shipFound = true;
                }
            }
            if (shipFound) {
                resources = getResurectedUnits(resources, shipList);
                profitDB[identifier] = {'result': resources, 'time': timestamp };
                saveDB(profitDBName, profitDB);
                addExpoEntry('ship');
                finishedReport();
                addTextToMsgId(msgId, ml.expoTypes['ship']);
                logged(msgId);
                return;
            }
            // finding Resources
            var resourceRegex;
            var resourceFound = false;
            for (var r in ml.resources) {
                if (language === 'gr') {
                    resourceRegex = ml.resources[r] + ' ([0-9\\.]{1,11}) αποκτήθηκαν\\.';
                }
                if (language === 'es') {
                    resourceRegex = ml.resources[r] + ' ([0-9\\.]{1,11}).';
                }
                else {
                    resourceRegex = ml.resources[r] + ' ([0-9\\.]{1,11}) [A-Za-z ]{3,40}\\.';
                }

                if (content.search(resourceRegex) !== -1) {
                    match = content.match(resourceRegex);
                    resources[r] += parseInt(match[1].split('.').join(""));
                    resourceFound = true;
                }
            }
            if (resourceFound) {
                profitDB[identifier] = {'result': resources, 'time': timestamp };
                saveDB(profitDBName, profitDB);
                if (resources.dm > 0) {
                    addExpoEntry('dm');
                    addTextToMsgId(msgId, ml.expoTypes['dm']);
                }
                else {
                    addTextToMsgId(msgId, ml.expoTypes['resource']);
                    addExpoEntry('resource');
                }
                finishedReport();
                logged(msgId);
                return;
            }
            // Finding everything else...
            for (var regex in ml.otherExpo) {
                if (content.search(regex) !== -1) {
                    profitDB[identifier] = {'result': resources, 'time': timestamp };
                    saveDB(profitDBName, profitDB);
                    addExpoEntry(ml.otherExpo[regex]);
                    finishedReport();
                    if (ml.otherExpo[regex] === 'loss') {
                        addTextToMsgId(msgId, ml.expoTypes[ml.otherExpo[regex]], 'red');
                    } else {
                        addTextToMsgId(msgId, ml.expoTypes[ml.otherExpo[regex]]);
                    }

                    logged(msgId);
                    return;
                }
            }
            // we didnt find anything here?
            console.log("Didn't find a match here, please checkup", content);
        }
        else {
            finishedReport();
            alreadyLogged(msgId);
        }
    }

    /**
     * Gets the CombatReport based on it's combat-report-id. Apikey is needed for storing the information afterwards.
     * @param crid
     * @param apikey
     */
    function getCR(crid, apikey) {
        $.ajax({
            type: 'GET',
            url: 'index.php?page=messages',
            data: 'messageId=' + crid + '&tabid=21&ajax=1',
            dataType: 'html',
            context: document.body,
            global: false,
            async: true,
            error: function (jqXHR, exception) {
                console.log("Error getting HTML data - check errorlog");
            },
            success: function(data) {parseCR(data, apikey, crid);}
        });
    }

    /**
     * Parses a combat Report.
     * It expects the data retrieved from the game and the apikey of the report to have a uniqueID
     * @param data
     * @param apikey
     * @param crId
     */
    function parseCR(data, apikey, crId) {
        // define key for loops
        var key;
        var shipType;
        var resources = {'metal': 0, 'crystal': 0, 'deuterium': 0, 'dm':0 };
        if(data.search("var combatData") !== -1 && data.search("var attackerJson") !== -1) {
            // Get start and end of JSON + Extract JSON
            const start = data.search("var combatData") + 35;
            const end = data.search("var attackerJson") - 12;
            const jsonData = data.substring(start, end);
            const reportData = JSON.parse(jsonData);
            var loot = reportData.loot;
            const repair = reportData.repairedDefenses;
            if (reportData.wreckfield) {
                const wreckfield = reportData.wreckfield.ships;
            }
            var myLoss = getEmptyShipList();
            const timestamp = reportData.event_timestamp;
            // Get possible attackerIds / defenderIds
            const fleetIds = [];
            var defender = false;
            var attacker = false;
            for (key in reportData.attacker) {
                if (playerId === reportData.attacker[key].ownerID) {
                    fleetIds.push(key);
                    attacker = true;
                }
            }
            for (key in reportData.defender) {
                if (playerId === reportData.defender[key].ownerID) {
                    fleetIds.push(key);
                    defender = true;
                }
            }
            // Iterate over Last Rounds on Defender and Attacker side, add losses
            const attLastRound = reportData.attackerJSON.combatRounds[reportData.attackerJSON.combatRounds.length -1];
            for (key in attLastRound.losses) {
                if (fleetIds.indexOf(key) !== -1) {
                    for (shipType in attLastRound.losses[key]) {
                        myLoss[parseInt(shipType)] += parseInt(attLastRound.losses[key][shipType]);
                    }
                }
            }
            const defLastRound = reportData.defenderJSON.combatRounds[reportData.defenderJSON.combatRounds.length -1];
            for (key in defLastRound.losses) {
                if (fleetIds.indexOf(key) !== -1) {
                    for (shipType in defLastRound.losses[key]) {
                        myLoss[parseInt(shipType)] += parseInt(defLastRound.losses[key][shipType]);
                    }
                }
            }

            // If we are defending, we also have to add back the wreckfield and repairs to the lost loot...
            if (defender) {
                resources = {"metal": loot.metal * -1, "crystal": loot.crystal * -1, "deuterium": loot.deuterium * -1, 'dm': 0};
                if (typeof(wreckfield) != "undefined") {
                    resources = getResurectedUnits(resources, wreckfield);
                }
                if (typeof(repair) != "undefined") {
                    resources = getResurectedUnits(resources, repair);
                }
            } else {
                // if we are the attacker, we just take the loot as a base
                resources = {"metal": loot.metal, "crystal": loot.crystal, "deuterium": loot.deuterium, 'dm': 0};
            }

            // Remove lost Units from loot resources
            resources = getLostUnits(resources, myLoss);


            // Store it to the DB, change counter
            profitDB[apikey] = {'result': resources, 'time': timestamp };
            saveDB(profitDBName, profitDB);
            finishedReport();
            logged(crId);
        }
    }

    /**
     * Adds an Expo Entry to the database for Statistics
     * @param type
     */
    function addExpoEntry(type) {
        if (typeof(expoDB[type]) === "undefined") {
            expoDB[type] = 1;
        }
        else {
            expoDB[type]++;
        }
        saveDB(expoDBName, expoDB);
    }

    /**
     * Little helper which calcs last x hours result and writes it to the expected field
     * @param hours
     * @param prefix
     */
    function calcLastHours(hours, prefix) {
        const resources = {'metal': 0, 'crystal': 0, 'deuterium': 0, 'dm': 0};
        const timeAfter = Math.round((Date.now() / 1000) - (hours * 60 * 60));
        for (var id in profitDB) {
            if (profitDB[id].time > timeAfter) {
                resources.metal += profitDB[id].result.metal;
                resources.crystal += profitDB[id].result.crystal;
                resources.deuterium += profitDB[id].result.deuterium;
                resources.dm += profitDB[id].result.dm;
            }
        }
        document.getElementById(prefix + '-m').innerText = thousand(resources.metal)
        document.getElementById(prefix + '-c').innerText = thousand(resources.crystal);
        document.getElementById(prefix + '-d').innerText = thousand(resources.deuterium);
        document.getElementById(prefix + '-dm').innerText = thousand(resources.dm);
        document.getElementById(prefix + '-t').innerText = thousand(resources.metal + resources.crystal + resources.deuterium);
    }

    /**
     * Little helper which calcs last days result
     */
    function calcLastDay() {
        calcLastHours(24, 'd');
    }

    /**
     * Little helper which calcs last weeks result
     */
    function calcLastWeek() {
        calcLastHours(7*24, 'w');
    }

    /**
     * Little helper which calcs last months result
     */
    function calcLastMonth() {
        calcLastHours(7*24*4, 'm');
    }

    /**
     * Adds seperator Point
     * @param x
     * @returns {string}
     */
    function thousand(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Appends "logged" to a report based on its msgId
     * @param msgId
     */
    function logged(msgId) {
        addTextToMsgId(msgId, 'logged');
    }

    /**
     * Appends "already logged" to a report based on its msgId
     * @param msgId
     */
    function alreadyLogged(msgId) {
        addTextToMsgId(msgId, 'already logged')
    }

    /**
     * Adds green Text to the end of a Report based on its msgId
     * @param msgId
     * @param text
     * @param color
     */
    function addTextToMsgId(msgId, text, color = 'green') {
        const toAdd = '<span style="width:100%;float:left;color:' + color + ';">' + text + '</span><br>';
        const messages = document.getElementsByClassName('msg');
        for (var element in messages) {
            if (typeof(messages[element]) == "undefined") {
                continue;
            }
            if (messages[element].getAttribute('data-msg-id') == msgId) {
                messages[element].getElementsByClassName('msg_content')[0].innerHTML += toAdd;
                return;
            }
        }
    }

    /**
     * Returns Reports from an Element
     * @param element
     * @returns {HTMLCollectionOf<HTMLElementTagNameMap[string]>}
     */
    function getReportsFromElement(element) {
        const tabId = getContentId(element);
        const messages = document.getElementById(tabId);
        return messages.getElementsByTagName('li');
    }

    /**
     * Creates the "Check Messages" Button in Messages Overviews.
     */
    function createButtonMessages(){
        var listElement = document.createElement("li");
        listElement.style="margin:5px;list-style:none;";
        listElement.id = "ExpeditionCheck";
        listElement.innerHTML = '<a class="btn_blue" id="checkMessages">Check Messages</a>' +
            '<div style="position:relative;top:-20px;left:150px;">' +
            '<span id="reportsDone">0</span> of <span id="reportsToDo">0</span> Messages Checked</span>' +
            '</div>';
        const content0 = document.getElementById('buttonz').getElementsByClassName("content")[0];
        content0.insertBefore(listElement, content0.getElementsByTagName("div")[0]);
        document.getElementById('checkMessages').addEventListener("click",
            function(event) { getMsgs(); }, true);
    }

    /**
     * increases the reportsDone Counter and shows this in UI
     */
    function finishedReport() {
        reportsDone++;
        document.getElementById('reportsDone').innerText = reportsDone;
    }

    /**
     * increases the reportsToDo Counter and shows this in UI
     */
    function queuedReport() {
        reportsToDo++;
        document.getElementById('reportsToDo').innerText = reportsToDo;
    }

    /**
     * Reads current DB or creates a new one
     * @param name
     * @returns {{}}
     */
    function getOrCreateDB(name) {
        var db = {};
        if(localStorage.getItem(name) == null){
            localStorage.setItem(name, JSON.stringify(db));
        }
        else {
            db = JSON.parse(localStorage.getItem(name));
        }
        return db;
    }

    /**
     * Stores data to DB
     * @param name
     * @param data
     */
    function saveDB(name, data) {
        localStorage.setItem(name, JSON.stringify(data));
    }

    /**
     * Returns resources array subtracted by lost Units from shipList
     * @param currentresources
     * @param shipList
     * @returns {*}
     */
    function getLostUnits(currentResources, shipList) {
        for (var shipType in shipList) {
            currentResources.metal -= shipList[shipType] * shipPrice[shipType].m;
            currentResources.crystal -= shipList[shipType] * shipPrice[shipType].c;
            currentResources.deuterium -= shipList[shipType] * shipPrice[shipType].d;
        }
        return currentResources;
    }

    /**
     * Returns resources array added by resurected Units from shiplist
     * @param currentresources
     * @param shipList
     * @returns {*}
     */
    function getResurectedUnits(currentResources, shipList) {
        for (var shipType in shipList) {
            currentResources.metal += shipList[shipType] * shipPrice[shipType].m;
            currentResources.crystal += shipList[shipType] * shipPrice[shipType].c;
            currentResources.deuterium += shipList[shipType] * shipPrice[shipType].d;
        }
        return currentResources;
    }

    /**
     * Returns empty ShipList
     * @returns array
     */
    function getEmptyShipList() {
        return {202: 0, 203: 0, 204: 0, 205: 0, 206: 0, 207: 0, 208: 0, 209: 0, 210: 0, 211: 0, 212: 0, 213: 0,
            214: 0, 215: 0, 217: 0, 218: 0, 219: 0, 401: 0, 402: 0, 403: 0, 404: 0, 405: 0, 406: 0, 407: 0, 408: 0};
    }

    /**
     * Is this Messages Tab Active?
     * @param element
     * @returns {boolean}
     */
    function isActiveTab(element) {
        return (element.getAttribute('tabindex') === '0')
    }

    /**
     * Get ariaControls Content of element
     * @param element
     * @returns {string}
     */
    function getContentId(element) {
        return element.getAttribute('aria-controls');
    }

    /**
     * Parses a DateString and gives back a Date Object. Parsing is done on Language-Knowledge
     * @param date
     * @returns {Date}
     */
    function parseDate(date) {
        const ml = multiLang[language];
        var str = "";
        var i = 0;
        if (date.search(ml.dateRegex) !== -1) {
            const match = date.match(ml.dateRegex);
            for (var key in ml.dateKeys) {
                str += match[ml.dateKeys[key]];
                if (i < 2) {
                    str += '-';
                }
                else if (i == 2) {
                    str += ' ';
                }
                else if (i < 5) {
                    str += ':';
                }
                i++;
            }
            return new Date(str);
        }
    }

    /**
     * Imports Nixians debrisField Database and removes it
     */
    function import_NRT_dfDB() {
        const data = JSON.parse(localStorage.getItem('NRT_dfDB'));
        for (var key in data) {
            if (data[key].metal !== 0 || data[key].crystal !== 0) {
                profitDB[key] = {
                    'result': {'metal': data[key].metal, 'crystal': data[key].crystal, 'deuterium': 0, 'dm': 0},
                    'time': data[key].timestamp
                }
            }
        }
        saveDB(profitDBName, profitDB);
        localStorage.removeItem('NRT_dfDB');
    }

    /**
     * Imports Nixians Combat Profit Database and removes it.
     */
    function import_NRT_profitDB() {
        var resources;
        var attacker = false;
        var defender = false;
        const data = JSON.parse(localStorage.getItem('NRT_profitDB'));
        for (var key in data) {
            attacker = false;
            defender = false;
            if (parseInt(data[key].attackerid) === playerId) {
                resources = {"metal": data[key].loot.metal, "crystal": data[key].loot.crystal, "deuterium": data[key].loot.deuterium, 'dm': 0};
                resources = getLostUnits(resources, data[key].attackerloss);
                attacker = true;
            }
            if (parseInt(data[key].defenderid) === playerId) {
                resources = {"metal": data[key].loot.metal * -1, "crystal": data[key].loot.crystal * -1, "deuterium": data[key].loot.deuterium * -1, 'dm': 0};
                resources = getLostUnits(resources, data[key].defenderloss);
                if (typeof(data[key].wreckfield != "undefined" && data[key].wreckfield.length != 0)) {
                    resources = getResurectedUnits(resources, data[key].wreckfield);
                }
                if (typeof(data[key].repaired != "undefined" && data[key].repaired.length != 0)) {
                    resources = getResurectedUnits(resources, data[key].wreckfield);
                }
                defender = true;
            }
            if (attacker || defender) {
                profitDB[key] = {'result': resources, 'time': data[key].timestamp};
            }
        }
        saveDB(profitDBName, profitDB);
        localStorage.removeItem('NRT_profitDB');
    }

    /**
     * Imports Nixians Expedition Profit Database and removes it.
     */
    function import_NET_profitDB() {
        var resources;
        var i;
        var shipList;
        var error = false;
        const data  = JSON.parse(localStorage.getItem('NET_profitDB'));
        for (var key in data) {
            resources = {"metal": 0, "crystal": 0, "deuterium": 0, 'dm': 0};
            switch(data[key].Result) {
                case 'Fleet':
                    shipList = getEmptyShipList();
                    for (i in data[key]) {
                        if (shipNameToId(i) !== 0) {
                            shipList[shipNameToId(i)] = data[key][i];
                        }
                    }
                    resources = getResurectedUnits(resources, shipList);
                    profitDB[key] = {'result': resources, 'time': data[key].Timestamp};
                    addExpoEntry('ship');
                    break;
                case 'Resource':
                    resources = {"metal": data[key].Metal, "crystal": data[key].Crystal, "deuterium": data[key].Deuterium, 'dm': data[key].DM};
                    profitDB[key] = {'result': resources, 'time': data[key].Timestamp};
                    addExpoEntry('resource');
                    break;
                case 'DM':
                    resources = {"metal": data[key].Metal, "crystal": data[key].Crystal, "deuterium": data[key].Deuterium, 'dm': data[key].DM};
                    profitDB[key] = {'result': resources, 'time': data[key].Timestamp};
                    addExpoEntry('dm');
                    break;
                case 'Pirate':          addExpoEntry('pirate'); break;
                case 'Item':            addExpoEntry('item'); break;
                case 'Nothing':         addExpoEntry('nothing'); break;
                case 'Alien':           addExpoEntry('alien'); break;
                case 'Speedup':         addExpoEntry('speedup'); break;
                case 'Delay':           addExpoEntry('delay'); break;
                case 'Expedition loss': addExpoEntry('loss'); break;
                case 'Merchant':        addExpoEntry('merchant'); break;
                default:
                    console.log("this isn't meant to happen!");
                    console.log(data[key]);
                    error = true;
            }
        }
        saveDB(profitDBName, profitDB);
        if (!error) {
            localStorage.removeItem('NET_profitDB');
        }
    }

    /**
     * Converts english Ship Name to it's ID
     * @param name
     * @returns {number}
     */
    function shipNameToId(name) {
        switch(name) {
            case 'Small Cargo':         return 202;
            case 'Large Cargo':         return 203;
            case 'Light Fighter':       return 204;
            case 'Heavy Fighter':       return 205;
            case 'Cruiser':             return 206;
            case 'Battleship':          return 207;
            case 'Espionage Probe':     return 210;
            case 'Bomber':              return 211;
            case 'Destroyer':           return 213;
            case 'Battlecruiser':       return 215;
            case 'Reaper':              return 218;
            case 'Pathfinder':          return 219;
            default:                    return 0;
        }
    }

})();
