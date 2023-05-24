const board = document.querySelector('.board'); //보드판 지정
const color = ['blue', 'green', 'red', 'purple', 'darkgoldenrod', 'skyblue', 'black', 'grey']; //글자 색깔 지정
let clickcount = 0;
let xylocation : number[][]; //지뢰위치 넣는 배열

const checkmine = (a : number, b : number) :boolean => {
    return xylocation.some(item => item[0] === a && item[1] === b);
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
                        }
                    }
                }
            }
        }

    }
}

let easy = new map(10, 10, 10);
let normal = new map(18, 14, 40);
let hard = new map(24, 20, 99);

easy.make()
if (board instanceof HTMLDivElement){
    board.addEventListener('mousedown', (e) => {
        if (e.target instanceof HTMLElement){
            if (e.target.dataset.x != undefined && e.target.dataset.y !=undefined){
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                const clickpos = document.querySelector(`li[data-x="${x}"][data-y="${y}"]`);
                const clickposP = document.querySelector(`li[data-x="${x}"][data-y="${y}"] p`);

                if (e.which === 1){
                    if (clickcount === 0) easy.landMine(x, y)
                    if (checkmine(x, y)){
                        alert('게임 끝!');
                        window.location.reload();
                    }
                    if (clickposP instanceof HTMLParagraphElement){
                        clickposP.innerHTML
                        clickposP.style.display = 'block';
                    }
                    if (clickpos instanceof HTMLLIElement){
                        if ((x+y)%2==0) clickpos.style.background = '#d7b899';
                        else clickpos.style.background = '#e5c29f';
                    }
                    clickcount++;
                }
                else if (e.which === 3){
                    
                }
            }
        }
    })
}