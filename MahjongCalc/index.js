"use strict";

const VueApp = {
    data() {
        return {
            initstate: true,
            fuluword: ['吃', '碰', '杠', '暗杠'],
            tehai: ['bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk'],
            agari: 'bk',
            fulus: [['bk', 'bk', 'bk'], ['bk', 'bk', 'bk'], ['bk', 'bk', 'bk'], ['bk', 'bk', 'bk']],
            fululogic: 0,
            babei: 4,
            dora: ['bk', 'bk', 'bk', 'bk', 'bk'],
            ura: ['bk', 'bk', 'bk', 'bk', 'bk'],
            kaze: '1z',
            bakaze: '1z',
            tsumo: false,
            reach: false,
            doublereach: false,
            yipatsu: false,
            rinshan: false,
            chankan: false,
            haitei: false,
            tenhou: false,
            panel: [
                ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '0m', '5z', '1z', '2z'],
                ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '0p', '6z', '3z', '4z'],
                ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '0s', '7z', 'bk', 'xx'],
            ],
            selected: '',
            showclearconfirm: false,
            showresults: false,
            results: {
                yaku: 0,
                fu: 0,
                resulttitle: '',
                pointsrule: '',
                yakulist: [],
                fulist: [],
            }
        }
    },
    methods: {
        init(event) {
            this.initstate = true;
            this.tehai = ['bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk'];
            this.agari = 'bk';
            this.fulus = [['bk', 'bk', 'bk'], ['bk', 'bk', 'bk'], ['bk', 'bk', 'bk'], ['bk', 'bk', 'bk']];
            this.fululogic = 0;
            this.babei = 0;
            this.dora = ['bk', 'bk', 'bk', 'bk', 'bk'];
            this.ura = ['bk', 'bk', 'bk', 'bk', 'bk'];
            this.kaze = '1z';
            this.bakaze = '1z';
            this.tsumo = false;
            this.reach = false;
            this.doublereach = false;
            this.yipatsu = false;
            this.rinshan = false;
            this.chankan = false;
            this.haitei = false;
            this.tenhou = false;
            this.selected = '';
            if (event) event.stopPropagation();
        },
        overallclick() {
            if (this.initstate) {
                this.initstate = false;
                this.tehai = [];
                this.agari = '';
                this.fulus = [[], [], [], []];
                this.babei = 0;
            }
        },
        modifyselect(selected) {
            this.selected = selected;
        },
        showtile(tile) {
            // if (tile == 'bk') return this.selected.indexOf('kaze') == -1;
            if (tile == 'bk') return false;
            if (this.fululogic == 0 && this.selected.slice(0, 4) == 'fulu') {
                // chi status
                if (tile[1] == 'z') return false;
                if (parseInt(tile[0]) > 7) return false;
                let findex = parseInt(this.selected.slice(4));
                if (this.fulus[findex].length == 2) {
                    // select part, only normal five or red five not decided
                    return (tile[1] == this.fulus[findex][0][1] && (tile[0] == '0' || tile[0] == '5'));
                }
                return true;
            }
            if (this.selected.indexOf('kaze') > -1) {
                // kaze select
                return tile[1] == 'z' && parseInt(tile[0]) <= 4;
            }
            if (this.selected == 'babei') {
                return tile == '4z';
            }
            return true;
        },
        compare(tile1, tile2) {
            if (tile1[1] != tile2[1]) return tile1.charCodeAt(1) - tile2.charCodeAt(1);
            function tonum(tile) {
                if (tile[0] == '0') return 5.5;
                return parseInt(tile[0]);
            }
            return tonum(tile1) - tonum(tile2);
        },
        tehaiclick(index) {
            if (this.selected != 'tehai') return;
            this.tehai.splice(index, 1);
        },
        fuluclick(index) {
            if (this.selected != 'fulu' + index) return;
            this.fulus[index] = [];
        },
        doraclick(index) {
            if (this.selected != 'dora') return;
            this.dora.splice(index, 1);
            this.dora.push('bk');
        },
        uraclick(index) {
            if (this.selected != 'ura') return;
            this.ura.splice(index, 1);
            this.ura.push('bk');
        },
        babeiclick() {
            if (this.selected != 'babei') return;
            this.babei = 0;
        },
        tilesclick(tile) {
            if (this.selected == 'tehai') {
                if (this.tehai.length < 13) {
                    this.tehai.push(tile);
                    this.tehai.sort(this.compare);
                }
            }
            else if (this.selected == 'agari') {
                this.agari = tile;
            }
            else if (this.selected.slice(0, 4) == 'fulu') {
                let fulunum = parseInt(this.selected.slice(4));
                console.log(this.selected, fulunum, this.fululogic)
                if (this.fululogic == 0) {
                    // chi
                    if (this.fulus[fulunum].length == 2) {
                        // not sure, for complete
                        this.fulus[fulunum].push(tile);
                        this.fulus[fulunum].sort(this.compare);
                    }
                    else {
                        if (tile[0] == '3') this.fulus[fulunum] = [tile, '4' + tile[1]];
                        else if (tile[0] == '4') this.fulus[fulunum] = [tile, '6' + tile[1]];
                        else if (tile[0] == '0') this.fulus[fulunum] = [tile, '6' + tile[1], '7' + tile[1]];
                        else {
                            let tnum = parseInt(tile[0]);
                            this.fulus[fulunum] = [tile, (tnum + 1) + tile[1], (tnum + 2) + tile[1]];
                        }
                    }
                }
                else if (this.fululogic == 1) {
                    // pon
                    let tt = tile;
                    if (tile[0] == '0') tt = '5' + tile[1];
                    this.fulus[fulunum] = [tt, tile, tt];
                }
                else if (this.fululogic == 2) {
                    // kan
                    let tt = tile;
                    if (tile[0] == '0') tt = '5' + tile[1];
                    this.fulus[fulunum] = [tt, tt, tile, tt];
                }
                else if (this.fululogic == 3) {
                    // ankan
                    this.fulus[fulunum] = ['bk', tile, tile, 'bk'];
                    if (tile[0] == '0') this.fulus[fulunum][1] = '5' + tile[1];
                }
            }
            else if (this.selected == 'kaze') {
                this.kaze = tile;
            }
            else if (this.selected == 'bakaze') {
                this.bakaze = tile;
            }
            else if (this.selected == 'dora') {
                let fill = this.dora.indexOf('bk');
                if (fill != -1) this.dora[fill] = tile;
            }
            else if (this.selected == 'ura') {
                let fill = this.ura.indexOf('bk');
                if (fill != -1) this.ura[fill] = tile;
            }
            else if (this.selected == 'babei') {
                this.babei = this.babei % 4 + 1;
            }
        },
        getname(name, input) {
            for (let i = 0; i < name.length; i ++ )
                if (name[i][1] == input) return name[i][0];
            return input;
        },
        calc() {
            let input = {
                'hai': this.tehai.join(''), 
                'agari': this.agari, 
                'naki': [], 
                'ankan': [], 
                'dora': '',
                'ura': '', 
                'tsumo': this.tsumo, 
                'honba': 0, 
                'jifu': parseInt(this.kaze[0]) - 1, 
                'bafu': parseInt(this.bakaze[0]) - 1,
                'reach': this.reach + this.doublereach * 2, 
                'yipatsu': this.yipatsu,
                'rinshanchan': this.rinshan || this.chankan,
                'haihoutei': this.haitei,
                'tenchi': this.tenhou,
                'pei': this.babei
            };
            for (let i = 0; i < this.fulus.length; i ++ )
                if (this.fulus[i].length)
                    if (this.fulus[i][0] == 'bk') {
                        // ankan
                        input.ankan.push(this.fulus[i][1] + this.fulus[i][1] + this.fulus[i][2] + this.fulus[i][1]);
                    }
                    else {
                        input.naki.push(this.fulus[i].join(''));
                    }
            for (let i = 0; i < this.dora.length; i ++ )
                if (this.dora[i] != 'bk') input.dora = input.dora + this.dora[i];
                // if (this.dora[i] != 'bk') input.dora = input.dora + num2tile[nexttile[tile2num[this.dora[i]]]];
            for (let i = 0; i < this.ura.length; i ++ )
                if (this.ura[i] != 'bk') input.ura = input.ura + this.ura[i];
                // if (this.ura[i] != 'bk') input.ura = input.ura + num2tile[nexttile[tile2num[this.ura[i]]]];
            console.log(this.dora, input.dora, this.ura, input.ura);
            let res = Algo.calcyakufu(input);
            let yakufu = res[0], point = res[1];
            console.log(input, yakufu, point);
            this.results.yaku = yakufu.yaku;
            this.results.fu = yakufu.fu;
            this.results.yakulist = [];
            this.results.fulist = [];
            this.results.resulttitle = this.getname(yakutitle, yakufu.resulttitle);
            for (let i = 0; i < yakufu.yakuname.length; i ++ )
                this.results.yakulist.push([this.getname(hanname, yakufu.yakuname[i].name), yakufu.yakuname[i].han]);
            for (let i = 0; i < yakufu.funame.length; i ++ )
                this.results.fulist.push([this.getname(funame, yakufu.funame[i][0]), yakufu.funame[i][1]]);
            this.showresults = true;
            if (yakufu.yaku == 0) this.results.pointsrule = '自行结算';
            else if (point.oya + point.ko == 0) this.results.pointsrule = '荣和' + point.tokuten + '点';
            else if (point.oya > 0) this.results.pointsrule = '庄家' + point.oya + '点，闲家' + point.ko + '点';
            else this.results.pointsrule = point.ko + '点 ALL';
        }
    },
    computed: {
        cancalc() {
            if (this.agari.length != 2 || this.agari == 'bk') return false;  // no agari hai
            let count = 0, ankan = 0;
            for (let i = 0; i < this.fulus.length; i ++ )
                if (this.fulus[i].length == 2) count += 100;  // incomplete fulu, always kill
                else if (this.fulus[i].length > 0)
                    if (this.fulus[i][0] == 'bk') ankan += 3;  // ankan
                    else count += 3;  // +3 for every valid fulu
            if (count && (this.tenhou || this.reach || this.doublereach)) return false;  // fulu but tenhou, reach, doublereach
            if (ankan && this.tenhou) return false;  // ankan but tenhou
            if (count + ankan + this.tehai.length != 13) return false;  // hai number error
            count = 0;
            for (let i = 0; i < this.dora.length; i ++ )
                count += this.dora[i] != 'bk';
            // if (count == 0) return false;  // dora not selected
            for (let i = 0; i < this.ura.length; i ++ )
                count -= this.ura[i] != 'bk';
            if (count != 0 && (this.reach || this.doublereach)) return false;  // in reach, dora and ura number not same
            let mm = {}
            let all = this.tehai.concat([this.agari], this.dora, this.ura);
            for (let i = 0; i < this.babei; i ++ )
                all.push('4z');
            for (let i = 0; i < this.fulus.length; i ++ ) {
                let ii = this.fulus[i];
                if (this.fulus[i][0] == 'bk')
                    ii = [ii[1], ii[1], ii[2], ii[1]];  // special for ankan
                all = all.concat(ii);
            }
            let reds = [];
            for (let i = 0; i < all.length; i ++ )
                if (all[i][0] == '0') {
                    if (reds.indexOf(all[i]) != -1) return false;  // multiple same aka
                    reds.push(all[i]);
                    all[i] = '5' + all[i][1];
                }
            for (let i = 0; i < all.length; i ++ )
                mm[all[i]] = 0;
            for (let i = 0; i < all.length; i ++ )
                if ( ++ mm[all[i]] > 4 && all[i] != 'bk') return false;  // same hai appear more than 4 times
            return true;
        }
    }
}

let app = Vue.createApp(VueApp).mount('#outmaindiv');
console.log(app);

let fullpx = 850;

function changesize(){
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
