const board = document.querySelector('.board'); //보드판 지정
const color = ['blue', 'green', 'red', 'purple', 'darkgoldenrod', 'skyblue', 'black', 'grey']; //글자 색깔 지정
let clickcount = 0;
let bothclick = 0; //동시에 클릭했는지 확인하는 변수
let eixstFlagNumber = 0; //근처 깃발 개수 확인하는 변수
let xylocation : number[][]; //지뢰위치 넣는 배열
let chorColorlist : number[][] = [];
let gameend = 0;

const checkfill = (a : number, b : number) :boolean => { //중복 확인하는 함수(시간복잡도 낮춤)
    return document.querySelector(`li[data-x="${a}"][data-y="${b}"]`)?.id != 'already';
}

const chorCheckfill = (a : number, b : number) :boolean => { //chor일때 flag와 중복을 확인하는 함수
    const eixstFlag = document.querySelector(`li[data-x="${a}"][data-y="${b}"] img`)?.className == 'flag';
    if (eixstFlag) eixstFlagNumber++;
    return document.querySelector(`li[data-x="${a}"][data-y="${b}"]`)?.id != 'already'&& !eixstFlag;
}

const checkmine = (a : number, b : number) :boolean => { //지뢰인지 확인하는 함수
    return xylocation.some(item => item[0] === a && item[1] === b);
}

const chordColor = (a : number, b : number) => { //chor일때 투명도 낮추는 함수
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
                if (nowpos instanceof HTMLLIElement){
                    if (!checkmine(j, i)){
                        let nearbyMinecount = 0;
                        if (checkmine(j+1, i)) nearbyMinecount++;
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
}

let easy = new map(9, 9, 10);
let normal = new map(16, 16, 40);
let hard = new map(30, 16, 99);

let selectLevel = hard; //난이도 지정

selectLevel.make() //맵 제작
if (board instanceof HTMLDivElement){
    board.addEventListener('mousedown', (e) => {
        if (e.target instanceof HTMLElement){
            if (e.target instanceof HTMLImageElement && e.target.className === 'flag' && e.which === 3){ //깃발 다시 누르면 제거하는 조건문
                e.target.closest('li')?.removeAttribute('id');
                e.target.remove();
            }
            if (e.which === 1) bothclick++;
            else if (e.which === 3) bothclick++;

            if (bothclick === 2) { //chor일때
                let nowdiv : HTMLParagraphElement | null = null;

                if (e.target instanceof HTMLLIElement) nowdiv = e.target.firstChild as HTMLParagraphElement;
                else if (e.target instanceof HTMLParagraphElement) nowdiv = e.target;

                const parent = nowdiv?.closest('li');

                if (parent instanceof HTMLLIElement){
                    if (parent.dataset.x != undefined && parent.dataset.y != undefined){
                        const x = parseInt(parent.dataset.x);
                        const y = parseInt(parent.dataset.y);

                        if (nowdiv instanceof HTMLParagraphElement){ //영향 주는 범위 연하게 표현
                            if (chorCheckfill(x+1, y)) chordColor(x+1, y);
                            if (chorCheckfill(x-1, y)) chordColor(x-1, y);
                            if (chorCheckfill(x, y+1)) chordColor(x, y+1);
                            if (chorCheckfill(x, y-1)) chordColor(x, y-1);
                            if (chorCheckfill(x+1, y+1)) chordColor(x+1, y+1);
                            if (chorCheckfill(x+1, y-1)) chordColor(x+1, y-1);
                            if (chorCheckfill(x-1, y+1)) chordColor(x-1, y+1);
                            if (chorCheckfill(x-1, y-1)) chordColor(x-1, y-1);


                            if (parseInt(nowdiv.innerHTML) == eixstFlagNumber){ //깃발 개수와 숫자가 같은 경우
                                const chorExtend = (a : number, b : number) => { //자동확장 함수
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

                                            if (chorposMine instanceof HTMLDivElement && MineInCircle instanceof HTMLDivElement && gameend === 0){ //깃발이 잘못되었을 시
                                                chorposMine.style.display = 'flex';
                                                MineInCircle.style.display = 'block';
                                                setTimeout(() => {
                                                        alert('게임 끝!');
                                                        window.location.reload();
                                                }, 0);
                                                gameend++;
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

                const extend = (x : number, y : number) => {
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

                        if (clickcount === 0) selectLevel.landMine(x, y)
                        if (checkmine(x, y)){ //지뢰를 눌렀는지 확인
                            if (clickposMine instanceof HTMLDivElement && MineInCircle instanceof HTMLDivElement && gameend === 0){ //깃발이 잘못되었을 시
                                clickposMine.style.display = 'flex';
                                MineInCircle.style.display = 'block';
                                setTimeout(() => {
                                        alert('게임 끝!');
                                        window.location.reload();
                                }, 0);
                                gameend++;
                            }
                        }
                        else if (clickpos instanceof HTMLLIElement) atOnceShow(x, y);
                        clickcount++;
                    }
                }
                extend(x, y);
                if (e.which === 3){
                    if (e.target.id != 'already' && e.target.id != 'liFlag'){
                        e.target.innerHTML += `<img src="flag.svg" class="flag">`;
                        e.target.id = 'liFlag';
                    }
                }
            }
        }
    })
    board.addEventListener('mouseup', () =>{
        chorColorlist.forEach(a => {
            const fillChord = document.querySelector(`li[data-x="${a[0]}"][data-y="${a[1]}"]`);
            if (fillChord instanceof HTMLLIElement)
                fillChord.style.opacity = '1';
        })
        bothclick=0;
        eixstFlagNumber = 0;
        chorColorlist = [];
    })
}