const body = document.querySelector('body') //body 지정
const board = document.querySelector('.board'); //보드판 지정
const rows = document.querySelector('#rows'); //custom 입력 줄 담는 변수
const cols = document.querySelector('#cols'); //custom 입력 행 담는 변수
const mines = document.querySelector('#mines'); //custom 입력 지뢰개수 담는 변수
const color = ['blue', 'green', 'red', 'purple', 'darkgoldenrod', 'skyblue', 'black', 'grey']; //글자 색깔 지정
let clickcount = 0; //제일 처음 클릭했는지 확인하는 변수
let bothclick = 0; //동시에 클릭했는지 확인하는 변수
let existFlagNumber = 0; //근처 깃발 개수 확인하는 변수
let flagcount = 0; //깃발 총 개수 확인하는 변수
let xylocation : number[][]; //지뢰위치 넣는 배열
let chorColorlist : number[][] = []; //연한 색깔 위치 저장하는 배열
let gameend = 0; //게임이 끝났는지 확인하는 변수

const checkfill = (a : number, b : number) :boolean => { //중복 확인하는 함수(시간복잡도 낮춤)
    return document.querySelector(`li[data-x="${a}"][data-y="${b}"]`)?.id != 'already';
}

const chorCheckfill = (a : number, b : number) :boolean => { //chor일때 flag와 중복을 확인하는 함수
    const eixstFlag = document.querySelector(`li[data-x="${a}"][data-y="${b}"] img`)?.className == 'flag';
    if (eixstFlag) existFlagNumber++;
    return document.querySelector(`li[data-x="${a}"][data-y="${b}"]`)?.id != 'already'&& !eixstFlag;
}

const checkmine = (a : number, b : number) :boolean => { //지뢰인지 확인하는 함수
    return xylocation.some(item => item[0] === a && item[1] === b);
}

const chordColor = (a : number, b : number) => { //chord일때 투명도 낮추는 함수
    const chord = document.querySelector(`li[data-x="${a}"][data-y="${b}"]`);
    if (chord instanceof HTMLLIElement)
        chord.style.opacity = '0.6';
    chorColorlist.push([a, b]);
}

if (board instanceof HTMLDivElement){ //우클릭 context 막는 조건문
    board.addEventListener('contextmenu', e => e.preventDefault());
}

class map {
    constructor(public xSize : number, public ySize : number, public minecount : number){} //X크기, Y크기, 지뢰개수 지정
    boxsize = 600/this.ySize; //한 칸당 크기 지정
    make(){ //보드판 만드는 매소드
        if (board instanceof HTMLDivElement){ //narrowing
            for (let i=1; i<=this.ySize; i++){
                board.innerHTML += `<ul class="line${i}"></ul>`
                let line = document.querySelector(`.line${i}`); //i번째 행을 지정

                for (let j=1; j<=this.xSize; j++){
                    if (line instanceof HTMLUListElement){
                        if ((i+j)%2==0){ //지그재그로 색갈 넣기
                            line.innerHTML += `
                            <li style="background:#A7D948; width:${this.boxsize}px; height:${this.boxsize}px"
                            data-x="${j}" data-y="${i}"></li>`;
                        }
                        else{
                            line.innerHTML += `
                            <li style="background:#8ECC39; width:${this.boxsize}px; height:${this.boxsize}px"
                            data-x="${j}" data-y="${i}"></li>`;
                        }
                    }
                }
            }
        }
    }

    landMine(x : number, y : number){ //지료&숫자 배치하는 매소드
        xylocation = [];
        for (let i=0; i<this.minecount; i++){ //지뢰를 this.minecount만큼 배치
            const mine : {x:number, y:number} = { //x, y좌표 랜덤하게 지정
                x : Math.floor(Math.random()*this.xSize + 1),
                y : Math.floor(Math.random()*this.ySize + 1)
            }
            if  ((xylocation.some(item => item[0] === mine.x && item[1] === mine.y)) ||
                 (x === mine.x && y === mine.y) ||
                 (x+1 === mine.x && y === mine.y) ||
                 (x-1 === mine.x && y === mine.y) ||
                 (x === mine.x && y+1 === mine.y) ||
                 (x === mine.x && y-1 === mine.y) ||
                 (x+1 === mine.x && y+1 === mine.y) ||
                 (x+1 === mine.x && y-1 === mine.y) ||
                 (x-1 === mine.x && y+1 === mine.y) ||
                 (x-1 === mine.x && y-1 === mine.y)){ //위치 중복 확인&처음 눌렀을때 확장되게 만들기
                i--;
                continue;
            }
            else xylocation.push([mine.x, mine.y]); //배열에 x, y좌표 넣기(배열로)

            const minepos =  document.querySelector(`li[data-x="${mine.x}"][data-y="${mine.y}"]`); //랜덤한 위치의 box요소 지정

            if (minepos instanceof HTMLLIElement){ //narrowing
                minepos.innerHTML = `
                <div style="width:${this.boxsize}px; height:${this.boxsize}px; background:red; display:none" class="flexcontent">
                    <div style="width:${this.boxsize*0.5}px; height:${this.boxsize*0.5}px; background:darkred;" class="mine-circle">
                    </div>
                </div>` //지뢰 넣기
            }
        }

        for (let i=1; i<=this.ySize; i++){
            for (let j=1; j<=this.xSize; j++){
                const nowpos =  document.querySelector(`li[data-x="${j}"][data-y="${i}"]`); //현재 li를 지정
                const checkFlag = document.querySelector(`li[data-x="${j}"][data-y="${i}"] img`); //깃발이 있는지 없는지 확인하는 한수

                if (checkFlag instanceof HTMLImageElement){
                    checkFlag.remove()
                    flagcount = 0;
                }

                if (nowpos instanceof HTMLLIElement){
                    if (!checkmine(j, i)){
                        let nearbyMinecount = 0;
                        if (checkmine(j+1, i)) nearbyMinecount++; //근처에 있는 지뢰 확인하는 조건문들
                        if (checkmine(j-1, i)) nearbyMinecount++;
                        if (checkmine(j, i+1)) nearbyMinecount++;
                        if (checkmine(j, i-1)) nearbyMinecount++;
                        if (checkmine(j+1, i+1)) nearbyMinecount++;
                        if (checkmine(j+1, i-1)) nearbyMinecount++;
                        if (checkmine(j-1, i+1)) nearbyMinecount++;
                        if (checkmine(j-1, i-1)) nearbyMinecount++;
                        if (!(nearbyMinecount === 0)){
                            nowpos.innerHTML = `
                            <p class="number flexcontent" 
                            style="font-size:${2*this.boxsize/3}px; color:${color[nearbyMinecount-1]};">${nearbyMinecount}</p>`
                        } //근처 지뢰에 따른 숫자 넣기
                    }
                }
            }
        }
    }
    showLeftFlagCount(){ //남은 지뢰 개수 보여주기&지뢰찾기 성공 알려주는 매서드
        const option = document.querySelector('.option div');
        const leftflagcount = `<div style="font-size:25px"><img src="flag.svg" width ="50px">${this.minecount - flagcount}</div>`;
        if (option instanceof HTMLDivElement){
            option.innerHTML = leftflagcount;
        }

        if (this.minecount - flagcount == 0){ //남은 지뢰개수가 0개라면
            let correctCount = 0; //맵을 다 확장했는지 확인하는 변수

            for (let i=1; i<=this.xSize; i++){
                for (let j=1; j<=this.ySize; j++){
                    let alreadyCheck =  document.querySelector(`li[data-x="${i}"][data-y="${j}"]`);
                    if (alreadyCheck instanceof HTMLLIElement){
                        if (document.querySelector(`li[data-x="${i}"][data-y="${j}"] img`) instanceof HTMLImageElement ||
                        alreadyCheck.id == 'already'){
                        correctCount++;
                        }
                    }
                }
            }
            if (correctCount === this.xSize*this.ySize && gameend == 0){
                gameend = 1;
                setTimeout(() => {
                    alert('성공!');
                    window.location.reload();
                }, 500)
            }
        }
    }
}
//난이도별 맵 객체 제작
let easy = new map(9, 9, 10);
let normal = new map(16, 16, 40);
let hard = new map(30, 16, 99);
let custom;

let selectLevel = easy;
let level = document.querySelector('.level');

if (level instanceof HTMLSelectElement && board instanceof HTMLDivElement){
    
}
const changeLevel = () => { //레벨 바꾸는 함수
    if (level instanceof HTMLSelectElement && board instanceof HTMLDivElement){
        const playerChoose = level.value;

        const changeMap = () => {
            board.innerHTML = '';
            clickcount = 0;
            flagcount = 0;
            selectLevel.make(); //맵 제작
            selectLevel.showLeftFlagCount(); //깃발 개수 보여주기
        }

        if (playerChoose === 'easy'){
            selectLevel = easy;
            changeMap();
        }
        else if (playerChoose === 'normal'){
            selectLevel = normal;
            changeMap();
        }
        else if (playerChoose === 'hard'){
            selectLevel = hard;
            changeMap();
        }
        else if (playerChoose === 'custom'){
            document.querySelector('.black-bg')?.classList.add('show-custom'); //custom 설정창 보여주기
        }
    }
}

document.querySelector('.X_button')?.addEventListener('click', () => { //custom 설정창 닫기
    if (level instanceof HTMLSelectElement){
        document.querySelector('.black-bg')?.classList.remove('show-custom');
        level.value = 'easy';
        changeLevel();

    }
})

rows?.addEventListener('change', () => { //줄 크기 제한
    if (rows instanceof HTMLInputElement){
        const rowsVal = parseInt(rows.value);
        if (rowsVal > parseInt(rows.max)) rows.value = rows.max;
        else if (rowsVal < parseInt(rows.min)) rows.value = rows.min;
    }
})

cols?.addEventListener('change', () => { //행 크기 제한
    if (cols instanceof HTMLInputElement){
        const colsVal = parseInt(cols.value);
        if (colsVal > parseInt(cols.max)) cols.value = cols.max;
        else if (colsVal < parseInt(cols.min)) cols.value = cols.min;
    }
})

mines?.addEventListener('change', () => { //지뢰 개수 제한
    if (mines instanceof HTMLInputElement){
        const minesVal = parseInt(mines.value);
        if (minesVal > parseInt(mines.max)) mines.value = mines.max;
        else if (minesVal < parseInt(mines.min)) mines.value = mines.min;
    }
})

document.querySelector('.submit')?.addEventListener('click', () => {
    if (level instanceof HTMLSelectElement && board instanceof HTMLDivElement
        && rows instanceof HTMLInputElement && cols instanceof HTMLInputElement && mines instanceof HTMLInputElement){
        const rowsVal = parseInt(rows.value);
        const colsVal = parseInt(cols.value);
        const minesVal = parseInt(mines.value);

        if (minesVal+9 >= rowsVal*colsVal) alert('지뢰 갯수가 맵에 비해 너무 큽니다!');
        else {
            document.querySelector('.black-bg')?.classList.remove('show-custom'); //설정창 닫기
            custom = new map(rowsVal, colsVal, minesVal); //커스텀 맵 객체 생성
            selectLevel = custom;
            board.innerHTML = '';
            clickcount = 0;
            flagcount = 0;
            selectLevel.make(); //맵 제작
            selectLevel.showLeftFlagCount(); //깃발 개수 보여주기
        }
    }
})

selectLevel.make() //맵 제작
selectLevel.showLeftFlagCount(); //깃발 개수 보여기

if (board instanceof HTMLDivElement){
    board.addEventListener('mousedown', (e) => {
        if (e.target instanceof HTMLElement && gameend == 0){
            if (e.target instanceof HTMLImageElement && e.target.className === 'flag' && e.which === 3){ //깃발 다시 누르면 제거하는 조건문
                e.target.closest('li')?.removeAttribute('id');
                e.target.remove();
                flagcount--;
            }
            if (e.which === 1) bothclick++;
            else if (e.which === 3) bothclick++;

            if (bothclick === 2) { //chord일때
                let nowdiv : HTMLParagraphElement | null = null;

                //p 태그 또는 li 태그를 인식하는데(숫자box 누를때를 인식하기 위해서) 그것을 모두 내부 숫자를 얻기 위해 p태그로 변경
                if (e.target instanceof HTMLLIElement) nowdiv = e.target.firstChild as HTMLParagraphElement;
                else if (e.target instanceof HTMLParagraphElement) nowdiv = e.target;

                const parent = nowdiv?.closest('li'); //p태그의 부모인 li태그를 담는 변수

                if (parent instanceof HTMLLIElement){
                    if (parent.dataset.x != undefined && parent.dataset.y != undefined){
                        const x = parseInt(parent.dataset.x); //li box의 data-x 를 답는 변수
                        const y = parseInt(parent.dataset.y); //li box의 data-y 를 답는 변수

                        if (nowdiv instanceof HTMLParagraphElement){ //영향 주는 범위 연하게 표현
                            if (chorCheckfill(x+1, y)) chordColor(x+1, y);
                            if (chorCheckfill(x-1, y)) chordColor(x-1, y);
                            if (chorCheckfill(x, y+1)) chordColor(x, y+1);
                            if (chorCheckfill(x, y-1)) chordColor(x, y-1);
                            if (chorCheckfill(x+1, y+1)) chordColor(x+1, y+1);
                            if (chorCheckfill(x+1, y-1)) chordColor(x+1, y-1);
                            if (chorCheckfill(x-1, y+1)) chordColor(x-1, y+1);
                            if (chorCheckfill(x-1, y-1)) chordColor(x-1, y-1);


                            if (parseInt(nowdiv.innerHTML) == existFlagNumber){ //깃발 개수와 숫자가 같은 경우
                                const chorExtend = (a : number, b : number) => { //자동확장 함수(재귀를 위해 함수로 설정)
                                    let chorOpen = document.querySelector(`li[data-x="${a}"][data-y="${b}"]`);
                                    let chorOpenP = document.querySelector(`li[data-x="${a}"][data-y="${b}"] p`);
                                    let chorposMine = document.querySelector(`li[data-x="${a}"][data-y="${b}"] > div`);
                                    let MineInCircle = document.querySelector(`li[data-x="${a}"][data-y="${b}"] > div > .mine-circle`);
                                    if (chorOpen instanceof HTMLLIElement){
                                        chorOpen.id = 'already';
                                        if ((a+b)%2==0) chorOpen.style.background = '#e5c29f';
                                        else chorOpen.style.background = '#d7b899';

                                        if (chorOpenP instanceof HTMLParagraphElement){
                                            chorOpenP.style.display = 'block';
                                        }
                                        else if (chorOpenP === null){ //빈 공간 만났을때 자동으로 확장
                                            if (chorCheckfill(a+1, b)) chorExtend(a+1, b);
                                            if (chorCheckfill(a-1, b)) chorExtend(a-1, b);
                                            if (chorCheckfill(a, b+1)) chorExtend(a, b+1);
                                            if (chorCheckfill(a, b-1)) chorExtend(a, b-1);
                                            if (chorCheckfill(a+1, b+1)) chorExtend(a+1, b+1);
                                            if (chorCheckfill(a+1, b-1)) chorExtend(a+1, b-1);
                                            if (chorCheckfill(a-1, b+1)) chorExtend(a-1, b+1);
                                            if (chorCheckfill(a-1, b-1)) chorExtend(a-1, b-1);
                                        }

                                        if (chorposMine instanceof HTMLDivElement && MineInCircle instanceof HTMLDivElement){ //깃발이 잘못되었을 시
                                            gameend = 1;
                                            chorposMine.style.display = 'flex';
                                            MineInCircle.style.display = 'block';
                                            let delay = 0;
                                            xylocation.forEach((a, i) => { //순차적으로 지뢰 보여주면서 게임 끝내기
                                                delay += 50;
                                                setTimeout(async () => {
                                                    chorposMine = document.querySelector(`li[data-x="${a[0]}"][data-y="${a[1]}"] > div`);
                                                    MineInCircle = document.querySelector(`li[data-x="${a[0]}"][data-y="${a[1]}"] > div > .mine-circle`);
                                                    if (chorposMine instanceof HTMLDivElement && MineInCircle instanceof HTMLDivElement){
                                                        chorposMine.style.display = 'flex';
                                                        MineInCircle.style.display = 'block';
                                                    }
                                                    if (xylocation.length-1 === i){
                                                        setTimeout(() => {
                                                            alert('게임 오버');
                                                            window.location.reload();
                                                        }, 250);
                                                    }
                                                }, delay);
                                            })
                                        }
                                    }
                                }

                                chorColorlist.forEach(a => {
                                    chorExtend(a[0], a[1]);
                                })
                            }
                        }
                    }
                }
            }

            if (e.target.dataset.x != undefined && e.target.dataset.y !=undefined){
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);

                let clickpos = document.querySelector(`li[data-x="${x}"][data-y="${y}"]`);
                let clickposP = document.querySelector(`li[data-x="${x}"][data-y="${y}"] p`);
                let clickposMine = document.querySelector(`li[data-x="${x}"][data-y="${y}"] > div`);
                let MineInCircle = document.querySelector(`li[data-x="${x}"][data-y="${y}"] > div > .mine-circle`);

                if (e.which === 1){
                    const atOnceShow = (a : number, b : number) => {
                        clickpos = document.querySelector(`li[data-x="${a}"][data-y="${b}"]`);
                        clickposP = document.querySelector(`li[data-x="${a}"][data-y="${b}"] p`);
                        if (clickpos instanceof HTMLLIElement){
                            document.querySelector(`li[data-x="${a}"][data-y="${b}"] img`)?.remove();
                            clickpos.id = 'already';
                            if ((a+b)%2==0) clickpos.style.background = '#e5c29f';
                            else clickpos.style.background = '#d7b899';
    
                            if (clickposP instanceof HTMLParagraphElement){
                                clickposP.style.display = 'block';
                            }
                            else if (clickposP === null){ //빈 공간 눌렀을때 자동으로 확장
                                if (checkfill(a+1, b)) atOnceShow(a+1, b);
                                if (checkfill(a-1, b)) atOnceShow(a-1, b);
                                if (checkfill(a, b+1)) atOnceShow(a, b+1);
                                if (checkfill(a, b-1)) atOnceShow(a, b-1);
                                if (checkfill(a+1, b+1)) atOnceShow(a+1, b+1);
                                if (checkfill(a+1, b-1)) atOnceShow(a+1, b-1);
                                if (checkfill(a-1, b+1)) atOnceShow(a-1, b+1);
                                if (checkfill(a-1, b-1)) atOnceShow(a-1, b-1);
                            }
                        }
                    }

                    if (clickcount === 0) selectLevel.landMine(x, y);
                    if (checkmine(x, y)){ //지뢰를 눌렀는지 확인
                        if (clickposMine instanceof HTMLDivElement && MineInCircle instanceof HTMLDivElement){ //깃발이 잘못되었을 시
                            gameend = 1;
                            clickposMine.style.display = 'flex';
                            MineInCircle.style.display = 'block';
                            let delay = 0;
                            xylocation.forEach((a, i) => { //순차적으로 지뢰 보여주면서 게임 끝내기
                                delay += 50;
                                setTimeout(async () => {
                                    clickposMine = document.querySelector(`li[data-x="${a[0]}"][data-y="${a[1]}"] > div`);
                                    MineInCircle = document.querySelector(`li[data-x="${a[0]}"][data-y="${a[1]}"] > div > .mine-circle`);
                                    if (clickposMine instanceof HTMLDivElement && MineInCircle instanceof HTMLDivElement){
                                        clickposMine.style.display = 'flex';
                                        MineInCircle.style.display = 'block';
                                    }
                                    if (xylocation.length-1 === i){
                                        setTimeout(() => {
                                            alert('게임 오버');
                                            window.location.reload();
                                        }, 250);
                                    }
                                }, delay);
                            })
                        }
                    }
                    else if (clickpos instanceof HTMLLIElement) atOnceShow(x, y);
                    clickcount++;
                }
                if (e.which === 3){ //깃발 생성
                    if (e.target.id != 'already' && e.target.id != 'liFlag'){
                        e.target.innerHTML += `<img src="flag.svg" class="flag">`;
                        e.target.id = 'liFlag';
                        flagcount++;
                        selectLevel.showLeftFlagCount();
                    }
                }
            }
        }
        selectLevel.showLeftFlagCount();
    })
    board.addEventListener('mouseup', () =>{ //chord없애기
        chorColorlist.forEach(a => {
            const fillChord = document.querySelector(`li[data-x="${a[0]}"][data-y="${a[1]}"]`);
            if (fillChord instanceof HTMLLIElement)
                fillChord.style.opacity = '1';
        })
        bothclick=0;
        existFlagNumber = 0;
        chorColorlist = [];
    })
}