"use strict";


function oneplayer(pos) {
    return {
        kaze: -1,
        score: -1,
        deltascore: -1,
        agari: false,
        reach: false,
        tenpai: -1,
        // tsumoorhoujyuu: '',
        position: pos
    }
}

let default_settings = {
    // consts
    centersize: 37.5,
    fullpx: 400,
    kazename: ['東', '南', '西', '北'],
    numbername: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    positionname: ['bottom', 'right', 'top', 'left'],
    hanlist: [
        ['没和'], 
        ['1番', '2番', '3番', '4番'],
        ['满贯'], 
        ['跳满', '倍满', '三倍满'],
        ['一倍役满', '二倍役满', '三倍役满', '四倍役满', '五倍役满', '六倍役满']
    ],
    hanpoint: [
        [0], 
        [1, 2, 3, 4],
        [5], 
        [6, 8, 11], 
        [13, 26, 39, 52, 65, 78]
    ],
    fulist: [
        [20], 
        [25], 
        [30], 
        [40], 
        [50], 
        [60], 
        [70], 
        [80, 90, 100, 110]
    ],

    // settings
    reachcost: 1000,
    honbacost: 100,
    initscore: [25000, 25000, 25000, 25000],
    backscore: 25000,
    uma: [15, 5, -5, -15],
    historylength: 1000,
    tenpaigets: [0, 3000, 1500, 1000, 0],
    tenpaigives: [0, 3000, 1500, 1000, 0],
    showhint: true,

    // popup variables
    roundresults: [0, 0, 0, 0],
    dices: [1, 1],
    agariposition: 0,
    agarihaninfo: [ [0, 0], [0, 0], [0, 0], [0, 0] ],
    agarifuinfo: [ [0, 0], [0, 0], [0, 0], [0, 0] ],
    manualpoints: [0, 0, 0, 0],
    manualnextkyoku: false,
    manualkyoutaku: true,
    manualkyoutakustart: 0,

    // popup switchs
    showroundresultszero: false,
    showdices: false,
    showroundresults: false,
    showfinalresults: false,
    showtenpaiconfirm: false,
    showcancelconfirm: false,
    showagari: false,
    showresetsettingsconfirm: false,
    showsettings: false,
    showmanualpoint: false,
    playaudio: true,
}

let stored_logs = null;
let stored_settings = null;
let have_localstorage = true;
try {
    stored_logs = localStorage.getItem('logs');
    stored_settings = localStorage.getItem('settings');
}
catch {
    window.alert('读取localStorage失败！将无法保存历史记录和设置信息，网页重启后历史记录和设置信息将丢失！请检查是否启用了隐私浏览等方式。');
    have_localstorage = false;
}
try {
    stored_logs = stored_logs === null ? [] : JSON.parse(stored_logs);
    stored_settings = stored_settings === null ? JSON.parse(JSON.stringify(default_settings)) : JSON.parse(stored_settings);
}
catch {
    console.log('localStorage Error, use default');
    stored_logs = [];
    stored_settings = default_settings;
}

// console.log(stored_logs, stored_settings);
function updatenonexistsettings(stored_settings, default_settings) {
    for (let key in default_settings)
        if (!stored_settings.hasOwnProperty(key))
            stored_settings[key] = JSON.parse(JSON.stringify(default_settings[key]));
    return stored_settings;
}
stored_settings = updatenonexistsettings(stored_settings, default_settings);

const VueApp = {
    data() {
        return {
            logs: stored_logs,
            // data that no need to save in logs
            settings: stored_settings,
            started: false,
            bakaze: -1,
            kyoku: -1,
            honba: -1,
            kyoutaku: -1,
            players: [
                oneplayer('bottom'),
                oneplayer('right'),
                oneplayer('top'),
                oneplayer('left'),
            ]
        }
    },
    methods: {
        savetable() {
            let currentdata = JSON.parse(JSON.stringify(this.$data));
            delete currentdata.logs;
            this.logs.push(JSON.stringify(currentdata));
            if (this.logs.length > this.settings.historylength)
                this.logs.splice(0, this.logs.length - this.settings.historylength);
            if (have_localstorage) localStorage.setItem('logs', JSON.stringify(this.logs));
        },
        savesettings() {
            if (have_localstorage) localStorage.setItem('settings', JSON.stringify(this.settings));
        },
        cleartable() {
            for (let i = 0; i < this.players.length; i ++ )
                this.players[i] = oneplayer(this.settings.positionname[i]);
            this.bakaze = this.kyoutaku = this.kyoku = this.honba = -1;
        },
        initgame() {
            this.bakaze = this.kyoutaku = this.kyoku = this.honba = 0;
            this.settings.showroundresults = false;
            this.settings.showfinalresults = false;
            this.settings.showtenpaiconfirm = false;
            for (let i = 0; i < this.players.length; i ++ )
                this.players[i].score = this.settings.initscore[i];
            this.initround();
        },
        initround() {
            for (let i = 0; i < this.players.length; i ++ ) {
                this.players[i].reach = false;
                this.players[i].tenpai = -1;
                this.players[i].agari = false;
                this.players[i].kaze = (i + 4 - this.kyoku) % 4;
            }
        },
        nextround(deltascores, nextkyoku, hasagari, agaristart) {
            // show results, and calc final scores with honba and kyoutaku
            // nextkyoku true, go to next kyoku, else add honba
            // hasagari true, will get honba and kyoutaku
            // agaristart 0-3, whose tile is agari, to check who get honba and kyoutaku. only need when hasagari = true

            // console.log(deltascores, nextkyoku, hasagari);
            if (hasagari) {
                // get kyoutaku and honba, clear kyoutaku
                for (let i = 0; i < deltascores.length; i ++ ) {
                    let now = (i + agaristart) % deltascores.length;
                    if (deltascores[now] > 0) {
                        deltascores[now] += this.settings.reachcost * this.kyoutaku;
                        deltascores[now] += (deltascores.length - 1) * this.settings.honbacost * this.honba;
                        break;
                    }
                }
                let minus = 0;
                for (let i = 0; i < deltascores.length; i ++ )
                    minus += deltascores[i] < 0;
                for (let i = 0; i < deltascores.length; i ++ )
                    if (deltascores[i] < 0)
                        if (minus == 1) deltascores[i] -= (deltascores.length - 1) * this.settings.honbacost * this.honba; // ron, one player give all honba
                        else deltascores[i] -= this.settings.honbacost * this.honba; // tsumo, all minus player give honba
                this.kyoutaku = 0;
            }
            if (nextkyoku) {
                if (hasagari) this.honba = 0;
                else this.honba ++ ;
                this.kyoku ++ ;
                if (this.kyoku == this.players.length) {
                    this.kyoku = 0;
                    this.bakaze ++ ;
                }
            }
            else {
                this.honba ++ ;
            }
            this.settings.roundresults = deltascores;
            this.settings.showroundresults = true;
            this.initround();
        },
        updatescore() {
            for (let i = 0; i < this.settings.roundresults.length; i ++ )
                this.players[i].score += this.settings.roundresults[i];
        },
        resultsdivclick() {
            if (this.settings.showroundresults)
                this.updatescore();
            else if (this.settings.showfinalresults)
                this.cleartable();
            this.settings.showroundresults = this.settings.showfinalresults = false; 
            this.savetable();
        },
        resultfontcolor(res) { 
            if (res < 0) return 'redfont';
            if (res > 0) return 'greenfont';
            if (!this.settings.showroundresultszero && !this.settings.showfinalresults) return 'blackfont';
            return 'whitefont';
        },
        ryuukyokuclick(index, value) {
            this.players[index].tenpai = value;
            let decided = 0;
            for (let i = 0; i < this.players.length; i ++ )
                decided += this.players[i].tenpai != -1;
            this.settings.showtenpaiconfirm = decided == this.players.length;
        },
        tenpaiconfirm() {
            let getc = 0, givec = 0;
            let nextkyoku = !(this.players[this.kyoku].tenpai == 1);
            for (let i = 0; i < this.players.length; i ++ ) {
                let t = this.players[i].tenpai;
                if (t == 1) getc ++ ;
                if (t == 0) givec ++ ;
            }
            let res = [];
            for (let i = 0; i < this.players.length; i ++ ) {
                let t = this.players[i].tenpai;
                if (t == 1) res.push(this.settings.tenpaigets[getc]);
                if (t == 0) res.push(- this.settings.tenpaigives[givec]);
                this.players[i].tenpai = -1;
            }
            this.settings.showroundresultszero = true;
            this.settings.showtenpaiconfirm = false;
            this.nextround(res, nextkyoku, false);
        },
        reachclick(index) {
            this.players[index].reach = true;
            this.players[index].score -= this.settings.reachcost;
            this.kyoutaku ++ ;
            this.savetable();
            if (this.settings.playaudio) document.getElementById('reachaudio').play();
        },
        agariclick(index) {
            this.settings.agariposition = index;
            for (let i = 0; i < this.settings.agarihaninfo.length; i ++ ) {
                this.settings.agarihaninfo[i] = [0, 0];
                this.settings.agarifuinfo[i] = [0, 0];
            }
            this.settings.showagari = true;
        },
        agarihanbtndata(pindex) {
            let res = [];
            for (let i = 0; i < this.settings.hanlist.length; i ++ ) {
                let one = { text: 0, style: '' };
                if (this.settings.agarihaninfo[pindex][0] == i) {
                    one.text = this.settings.agarihaninfo[pindex][1];
                    one.style = 'background-color: #5cb85c; border-color: #4cae4c; font-weight: bold;'
                }
                one.text = this.settings.hanlist[i][one.text];
                res.push(one);
            }
            return res;
        },
        agarifubtndata(pindex) {
            let res = [];
            for (let i = 0; i < this.settings.fulist.length; i ++ ) {
                let one = { text: 0, style: '' };
                if (this.settings.agarifuinfo[pindex][0] == i) {
                    one.text = this.settings.agarifuinfo[pindex][1];
                    one.style = 'background-color: #5cb85c; border-color: #4cae4c; font-weight: bold;'
                }
                one.text = this.settings.fulist[i][one.text];
                res.push(one);
            }
            return res;
        },
        agarihanclick(pindex, index) {
            if (this.settings.agarihaninfo[pindex][0] == index)
                this.settings.agarihaninfo[pindex][1] = (this.settings.agarihaninfo[pindex][1] + 1) % this.settings.hanlist[index].length;
            else {
                this.settings.agarihaninfo[pindex][0] = index;
                this.settings.agarihaninfo[pindex][1] = 0;
            }
        },
        agarifuclick(pindex, index) {
            if (this.settings.agarifuinfo[pindex][0] == index)
                this.settings.agarifuinfo[pindex][1] = (this.settings.agarifuinfo[pindex][1] + 1) % this.settings.fulist[index].length;
            else {
                this.settings.agarifuinfo[pindex][0] = index;
                this.settings.agarifuinfo[pindex][1] = 0;
            }
        },
        agariconfirm() {
            function basepoint(han, fu) {
                let res = fu * 4;
                for (let i = 0; i < han; i ++ )
                    res *= 2;
                if (res >= 2000) {
                    if (han < 6) res = 2000;
                    else if (han < 8) res = 3000;
                    else if (han < 11) res = 4000;
                    else if (han < 13) res = 6000;
                    else res = 8000 * parseInt(han / 13);
                }
                return res;
            }
            function upper(res) {
                for (let i = 0; i < res.length; i ++ )
                    res[i] = parseInt((res[i] + 99) / 100) * 100;
                return res;
            }
            let oya = (this.players.length + this.kyoku - this.settings.agariposition) % this.players.length;
            let res = [0];
            if (this.agaricolor[0]) {
                // tsumo
                let base = basepoint(this.settings.hanpoint[this.settings.agarihaninfo[0][0]][this.settings.agarihaninfo[0][1]], 
                                     this.settings.fulist[this.settings.agarifuinfo[0][0]][this.settings.agarifuinfo[0][1]]);
                for (let i = 1; i < this.players.length; i ++ )
                    if (oya == 0 || oya == i) res.push(2 * base);
                    else res.push(base);
                res = upper(res);
                for (let i = 1; i < res.length; i ++ ) {
                    res[0] += res[i];
                    res[i] = - res[i];
                }
                if (this.settings.playaudio) document.getElementById('tsumoaudio').play();
            }
            else {
                let roncount = 0;
                for (let i = 1; i < this.players.length; i ++ )
                    if (this.agaricolor[i]) {
                        // ron
                        roncount ++ ;
                        let base = basepoint(this.settings.hanpoint[this.settings.agarihaninfo[i][0]][this.settings.agarihaninfo[i][1]], 
                                             this.settings.fulist[this.settings.agarifuinfo[i][0]][this.settings.agarifuinfo[i][1]]);
                        if (oya == i) res.push(6 * base);
                        else res.push(4 * base);
                    }
                    else res.push(0);
                res = upper(res);
                for (let i = 1; i < res.length; i ++ )
                    res[0] += - res[i];
                if (this.settings.playaudio) {
                    document.getElementById('ronaudio').play();
                    if (roncount > 1)
                        setTimeout(() => { document.getElementById('doubleronaudio').play(); }, 30);
                }
            }
            let finalres = [];
            for (let i = 0; i < res.length; i ++ )
                finalres.push(res[(res.length + i - this.settings.agariposition) % res.length]);
            this.settings.showroundresultszero = false;
            this.nextround(finalres, !this.agaricolor[oya], true, this.settings.agariposition);
        },
        cancelclick() {
            let currentdata = this.logs.splice(this.logs.length - 1)[0];
            let lastdata = this.logs.slice(this.logs.length - 1)[0];
            lastdata = JSON.parse(lastdata);
            for (let i in lastdata)
                if (i != 'logs' && i != 'settings')
                    this[i] = lastdata[i];
            if (have_localstorage) localStorage.setItem('logs', JSON.stringify(this.logs));
        },
        startnew() {
            this.initgame();
            this.started = true;
            this.savetable();
            if (this.settings.playaudio) document.getElementById('matchstartaudio').play();
        },
        endmatch() {
            let results = [];
            for (let i = 0; i < this.players.length; i ++ ) {
                let rank = 0;
                for (let j = 0; j < this.players.length; j ++ )
                    rank += this.players[j].score > this.players[i].score || this.players[j].score == this.players[i].score && j < i;
                this.players[i].score += rank == 0 ? this.kyoutaku * this.settings.reachcost : 0;
                results.push((this.players[i].score - this.settings.backscore) / 1000 + this.settings.uma[rank]);
            }
            this.settings.roundresults = results;
            this.settings.showfinalresults = true;
            this.started = false;
        },
        gendices() {
            this.settings.dices[0] = parseInt(Math.random() * 6 + 1);
            this.settings.dices[1] = parseInt(Math.random() * 6 + 1);
        },
        resetsettingsclick() {
            this.settings = JSON.parse(JSON.stringify(default_settings));
            this.settings.showsettings = true;
        },
        manualinit() {
            for (let i = 0; i < this.settings.manualpoints.length; i ++ )
                this.settings.manualpoints[i] = 0;
            this.settings.manualkyoutaku = true;
            this.settings.manualkyoutakustart = 0;
            this.settings.manualnextkyoku = false;
        },
        manualpointclick() {
            this.nextround(this.settings.manualpoints, this.settings.manualnextkyoku, this.settings.manualkyoutaku, this.settings.manualkyoutakustart);
        },
        updatedeltascore(index) {
            let baseline = this.players[index].score;
            for (let i = 0; i < this.players.length; i ++ )
                this.players[i].deltascore = baseline - this.players[i].score;
            this.settings.deltascorebaseline = index;
            this.settings.showroundresultszero = true;
            setTimeout(() => { this.settings.showdeltascore = false; }, 2000);
        }
    },
    computed: {
        agaricentercolorstyle() {
            let res = 'border-width: ' + this.settings.fullpx / 100 * this.settings.centersize / 2 + 'px; ';
            res += 'border-style: solid; '
            let handheight = (100 - this.settings.centersize) / 2;
            res += 'top: ' + handheight + '%; ';
            res += 'left: ' + handheight + '%; ';
            for (let i = 0; i < this.agaricolor.length; i ++ ) {
                if (this.agaricolor[i])
                    res += 'border-' + this.settings.positionname[i] + '-color: green; ';
                else
                    res += 'border-' + this.settings.positionname[i] + '-color: #000000FF; ';
            }
            return res;
        },
        agaricolor() {
            let res = [];
            for (let i = 0; i < this.settings.agarihaninfo.length; i ++ )
                res.push(this.settings.agarihaninfo[i][0] != 0);
            return res;
        },
        canagariconfirm() {
            let tsumo = this.agaricolor[0], ron = 0;
            for (let i = 1; i < this.agaricolor.length; i ++ )
                ron += this.agaricolor[i];
            return tsumo + ron > 0 && !(tsumo && ron > 0);
        }
    }
}

let app = Vue.createApp(VueApp).mount('#maindiv');
console.log(app);
if (app.logs.length == 0) app.savetable();
app.savetable();
app.cancelclick();

let center_div_size = VueApp.data().settings.centersize;
let fullpx = VueApp.data().settings.fullpx;
let setdivposition_counter = 0;

function setcenterdiv(div, center_div_size, handheight) {
    div.style.width = center_div_size + '%';
    div.style.height = center_div_size + '%';
    div.style.top = handheight + '%';
    div.style.left = handheight + '%';
}

function setdivposition() {
    if ( ++ setdivposition_counter != 1) return;
    let handheight = (100 - center_div_size) / 2;
    setcenterdiv(document.getElementById('center'), center_div_size, handheight);
    setcenterdiv(document.querySelector('#resultsdiv .hint'), center_div_size, handheight);
    // setcenterdiv(document.querySelector('#agaricentercolordiv'), center_div_size, handheight);
    setcenterdiv(document.querySelector('#agaricentertextdiv'), center_div_size, handheight);
    let hands = document.querySelectorAll('.hand');
    for (let i = 0; i < hands.length; i ++ ){
        // console.log(i, hands[i]);
        hands[i].style.height = handheight + '%';
    }
    let ups = document.querySelectorAll('.hand .up');
    let middles = document.querySelectorAll('.hand .middle');
    let downs = document.querySelectorAll('.hand .down');
    // let kazes = document.querySelectorAll('.hand .middle .kaze');
    // let scores = document.querySelectorAll('.hand .up .score');
    for (let i = 0; i < ups.length; i ++ ){
        // console.log(i, ups[i], middles[i], downs[i]);
        ups[i].style.width = center_div_size + '%';
        ups[i].style.left = handheight + '%';
        middles[i].style.left = handheight * 0.6 + '%';
        middles[i].style.width = (100 - handheight * 1.2) + '%';
        downs[i].style.left = handheight * 0.2 + '%';
        downs[i].style.width = (100 - handheight * 0.4) + '%';
        // kazes[i].style.width = ((0.6 * handheight) / (100 - handheight * 0.8) * 100) + '%';
        // scores[i].style.width = ((0.2 * handheight) / (100 - handheight * 0.8) * 300) + '%';
    }
    let lefthand = document.querySelectorAll('.hand.left');
    for (let i = 0; i < lefthand.length; i ++ ) {
        lefthand[i].style.top = (50 - handheight / 2) + '%';
        lefthand[i].style.left = (handheight / 2 - 50) + '%';
    }
    let righthand = document.querySelectorAll('.hand.right');
    for (let i = 0; i < righthand.length; i ++ ) {
        righthand[i].style.top = (50 - handheight / 2) + '%';
        righthand[i].style.left = (50 - handheight / 2) + '%';
    }
    let bottomhand = document.querySelectorAll('.hand.bottom');
    for (let i = 0; i < bottomhand.length; i ++ )
        bottomhand[i].style.top = (100 - handheight) + '%';
}

function changesize(){
    setdivposition();
    let num = window.innerHeight;
    if (window.innerWidth < num)
        num = window.innerWidth;
    num /= fullpx;
    document.getElementById('maindiv').style = (
        'position: relative; ' + 
        'transform-origin: 0% 0%; ' + 
        'transform: scale(' + parseFloat(num) + ', ' + parseFloat(num) + '); ' + 
        (window.innerHeight > window.innerWidth ? 
        'top: ' + parseInt((window.innerHeight - window.innerWidth) / 2) + 'px; ':
        'left: ' + parseInt((window.innerWidth - window.innerHeight) / 2) + 'px; ')
    );
}

window.onload = function () {
    changesize();
    let useragent = navigator.userAgent;
    if (useragent.indexOf('iPad') > -1 || useragent.indexOf('iPhone') > -1 || useragent.indexOf('Macintosh') > -1) {
        window.alert('苹果设备推荐使用Chrome或Edge。如果使用苹果设备出现按钮显示位置错乱，请尝试锁屏再解锁，可能可以恢复正常显示。')
        changesize();
    }
}

window.onresize = function(){
    changesize();
};
