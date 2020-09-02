// ==UserScript==
// @name        Kalinka Result Tracker
// @namespace   kal.in.ka
// @author      Kalinka
// @description Result Tracker for Ogame
// @include     *ogame.gameforge.com/game/*
// @version     0.2.0
// @grant       GM_xmlhttpRequest
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require     https://canvasjs.com/assets/script/canvasjs.min.js
// @license MIT
// @updateURL https://github.com/COhsrt/ResultTracker/raw/master/resultTracker.user.js
// @downloadURL https://github.com/COhsrt/ResultTracker/raw/master/resultTracker.user.js
// ==/UserScript==
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
            ships: { // All Ships which can be found by Expedition
                'Kleiner Transporter': 202,
                'Großer Transporter': 203,
                'Leichter Jäger': 204,
                'Schwerer Jäger': 205,
                'Kreuzer': 206,
                'Schlachtschiff': 207,
                'Spionagesonde': 210,
                'Bomber': 211,
                'Zerstörer': 213,
                'Schlachtkreuzer': 215,
                'Reaper': 218,
                'Pathfinder': 219
            },
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
                // Delay
                ".+l.nger dauern.+": 'delay',
                ".+Versp.tung.+": 'delay',
                ".+erheblich mehr Zeit.+": 'delay',
                ".+Das fremde Schiff explodierte.+": 'delay',
                ".+das gesamte Deuterium.+": 'delay',
                // Item
                ".+Gegenstand.+": 'item',
                ".+Artefakt.+": 'item',
                // Loss
                ".+Zzzrrt.+": "loss",
                ".+r.tseln noch immer.+verloren.+": "loss",
                ".+Kernbruch.+": 'loss',
                // Merchant
                ".+Exklusivkunden.+": "merchant",
                ".+Tauschwaren.+": 'merchant',
                // Nothing
                ".+Sumpfplaneten.+": "nothing",
                ".+Reatorfehler.+": "nothing",
                ".+Deuterium-Mangel.+": "nothing",
                ".+Halluzinationen.+": 'nothing',
                ".+Sternwind.+": 'nothing',
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

        }
    };

    // Database stuff
    const profitDBName = 'ogameProfitDB';
    const expoDBName = 'ogameExpoDB';
    var profitDB;
    var expoDB;

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
        createProfitTable();
        if (window.location.search.indexOf("?page=messages") !== -1){
            createButtonMessages();
        }
    }

    /**
     * Creates the Profit Table below the Menu on the left side
     */
    function createProfitTable() {
        const ml = multiLang[language];
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
            "<div>" +
            "<a class='btn_blue' id='openExpoChart'>Expo Chart</a>"
            "</div>";
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
        document.getElementById('openExpoChart').addEventListener('click', function() {
           createExpoChart();
        });
    }

    /**
     * Creates an Expo Chart
     */
    function createExpoChart() {
        const ml = multiLang[language];
        var total = 0;
        var type;
        const stats = [];
        const body = document.getElementById('ingamepage');
        var d = document.createElement('div');
        d.style = "width:600px;height:550px;position:absolute;z-index:20;top:50%;left:50%;margin:-250px 0 0 -250px;background-color:black;";
        d.id = "expoChartDiv";
        body.appendChild(d);
        var x = document.createElement('span');
        x.innerHTML = "<b>X</b>";
        x.style = "font-size:14px;width:20px;height:20px;top:0px;right:0px;color:red;position:absolute;"
        x.addEventListener('click', function () {
            document.getElementById('expoChartDiv').style.visibility = "hidden";
        });
        d.appendChild(x);
        var chart = document.createElement('span');
        chart.id="chart-container";
        chart.style="width:580px;height:520px;top:20px;position:absolute;";
        d.appendChild(chart);

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
        var chart = new CanvasJS.Chart("chart-container", {
            animationEnabled: false,
            toolTipContent: "{label}({z})/"+total+": <strong>{y}%</strong>",
            title: {
                text: ""
            },
            data: [{
                type: "pie",
                startAngle: 240,
                radius: 100,
                indexLabelFontSize: 12,
                yValueFormatString: "##0.00\"%\"",
                indexLabel: "{label}({z}/"+total+"): {y}",
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
            ' .+ ' + rr + ' ' + mlR.crystal + ' .+';
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
        const shipMap = ml.ships;
        var match;
        var resources = {"metal": 0, "crystal": 0, "deuterium": 0, 'dm': 0};
        // Everything which is worth a profit
        if (typeof(profitDB[identifier]) === "undefined") {
            // Ships
            var shipRegex;
            var shipFound = false;
            var shipList = getEmptyShipList();
            for (var ship in shipMap) {
                shipRegex = ship + ': (\\d+)\\<br\\>'
                if (content.search(shipRegex) !== -1) {
                    match = content.match(shipRegex);
                    shipList[shipMap[ship]] += parseInt(match[1]);
                    shipFound = true;
                }
            }
            if (shipFound) {
                resources = getResurectedUnits(resources, shipList);
                profitDB[identifier] = {'result': resources, 'time': timestamp };
                saveDB(profitDBName, profitDB);
                addExpoEntry('ship');
                finishedReport();
                logged(msgId);
                return;
            }
            // finding Resources
            var resourceRegex;
            var resourceFound = false;
            for (var r in ml.resources) {
                resourceRegex = ml.resources[r] + ' ([0-9\\.]{1,11}) [A-Za-z]{3,40}\\.';
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
                }
                else {
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
        if(data.search("var combatData") !== -1 && data.search("var attackerJson") !== -1) {
            // Get start and end of JSON + Extract JSON
            const start = data.search("var combatData") + 35;
            const end = data.search("var attackerJson") - 12;
            const jsonData = data.substring(start, end);
            const reportData = JSON.parse(jsonData);
            const loot = reportData.loot;
            const repair = reportData.repairedDefenses;
            if (reportData.wreckfield) {
                const wreckfield = reportData.wreckfield.ships;
            }
            const myLoss = getEmptyShipList();
            const timestamp = reportData.event_timestamp;
            // Get possible attackerIds / defenderIds
            const fleetIds = [];
            var defender = false;
            var attacker = false;
            for (key in reportData.attacker) {
                if (playerId === reportData.attacker[key].ownerId) {
                    fleetIds.push(key);
                    attacker = true;
                }
            }
            for (key in reportData.defender) {
                if (playerId === reportData.defender[key].ownerId) {
                    fleetIds.push(key);
                    defender = true;
                }
            }
            // Iterate over Last Rounds on Defender and Attacker side, add losses
            const attLastRound = reportData.attackerJSON.combatRounds[reportData.attackerJSON.combatRounds.length -1];
            for (key in attLastRound.losses) {
                if (fleetIds.indexOf(key) !== -1) {
                    for (shipType in attLastRound.losses[key]) {
                        myLoss[shipType] += parseInt(attLastRound.losses[key][shipType]);
                    }
                }
            }
            const defLastRound = reportData.defenderJSON.combatRounds[reportData.defenderJSON.combatRounds.length -1];
            for (key in attLastRound.losses) {
                if (fleetIds.indexOf(key) !== -1) {
                    for (shipType in defLastRound.losses[key]) {
                        myLoss[shipType] += parseInt(defLastRound.losses[key][shipType]);
                    }
                }
            }
            // Take loot as a base
            var resources = {"metal": loot.metal, "crystal": loot.crystal, "deuterium": loot.deuterium, 'dm': 0};

            // Remove lost Units from loot resources
            resources = getLostUnits(resources, myLoss);

            // If we are defending, we also have to add back the wreckfield and repairs...
            if (defender) {
                if (typeof(wreckfield) != "undefined") {
                    resources = getResurectedUnits(resources, wreckfield);
                }
                if (typeof(repair) != "undefined") {
                    resources = getResurectedUnits(resources, repair);
                }
            }
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
     */
    function addTextToMsgId(msgId, text) {
        const toAdd = '<span style="width:100%;float:left;color:green;">' + text + '</span><br>';
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

})();
