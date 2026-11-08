const numbers = [];
const drawnNumbers = [];

let hasBingo = false;

let marked = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, true, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
];

// 数字表を生成する
const bingoTable = document.querySelector(".bingo-table");

for (let number = 1; number <= 75; number += 1) {
    const cell = document.createElement("div");

    cell.textContent = number;
    cell.dataset.number = number;

    bingoTable.appendChild(cell);
}

// 1~75の数字をnumbersに入れる
for (let number = 1; number <= 75; number += 1) {
    numbers.push(number);
}


// 抽選結果を表示させる部分のidがresultの要素を取得しておく(繰り返しの記述を避けるため)
const result = document.getElementById("result");

// 抽選履歴のhistoryを取得しておく(繰り返しの記述を避けるため)
const history = document.querySelector(".history");


// モーダル要素を取得する
const modal = document.querySelector(".modal");


// ビンゴ判定の関数(ビンゴ判定の処理をまとめておくため)
function checkBingo() {

    // 横列ビンゴの判定
    for (let row = 0; row < 5; row ++) {
        let isBingo = true;

        for (let col = 0; col < 5; col ++) {
            if (marked[row][col] === false) {
                isBingo = false;
                break;
            }
        }

        if (isBingo) {
            return true;
        }
    }

    // 縦列ビンゴの判定
    for (let col = 0; col < 5; col ++) {
        let isBingo = true;

        for (let row = 0; row < 5; row ++) {
            if (marked[row][col] === false) {
                isBingo = false;
                break;
            }
        }

        if (isBingo) {
            return true;
        }
    }

    // 左上から右下への斜めビンゴの判定
    let isBingo = true;

    for (let i = 0; i < 5; i ++) {
        if (marked[i][i] === false) {
            isBingo = false;
            break;
        }
    }

    if (isBingo) {
        return true;
    }

    // 右上から左下への斜めビンゴの判定
    isBingo = true;

    for (let i = 0; i < 5; i ++) {
        if (marked[i][4 - i] === false) {
            isBingo = false;
            break;
        }
    }

    if (isBingo) {
        return true;
    }

    return false;
}


// 抽選演出
async function drawAnimation() {
    // .result-pop を毎回リセットする
    result.classList.remove("result-pop");
    
    result.classList.add("drawing");

    const timerId = setInterval(function () {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const animationNumber = numbers[randomIndex];

        result.textContent = animationNumber;
    }, 25);

    await new Promise(resolve => setTimeout(resolve, 500));

    result.classList.remove("drawing");
    
    clearInterval(timerId);
}

// 抽選処理
function executeDraw(randomNumber, randomIndex) {

    // 抽選開始後にカード生成ボタンを無効にする
    document.getElementById("generate-button").disabled = true;
    
    // 抽選された数字のセルを取得
    const drawnCell = bingoTable.querySelector(
        `[data-number="${randomNumber}"]`
    );

    // そのセルに抽選済みクラスを追加
    drawnCell.classList.add("drawn");


    // プレイヤーカードの中から、抽選された数字と一致するマスを探す。
    const playerCell = document.querySelector(
        `.player-card [data-number="${randomNumber}"]`
    );

    if (playerCell) {
        playerCell.classList.add("drawn");

        const row = Number(playerCell.dataset.row);
        const col = Number(playerCell.dataset.col);

        marked[row][col] = true;
        
    }


    // ビンゴ判定関数呼び出しと、ビンゴ演出
    if (!hasBingo && checkBingo()) {
        hasBingo = true;
        modal.style.display = "flex";
        console.log("BINGO!");
    }

    // モーダル(ビンゴ演出)を閉じる
    modal.addEventListener("click", function() {
        modal.style.display = "none";
    });


    // 抽選結果表示時のアニメーション用
    result.textContent = randomNumber;
    result.classList.add("result-pop");


    // 抽選で選ばれた数字を抽選前グループ(numbers)から削除して、抽選後グループ(drawnNumbers)に移す。
    numbers.splice(randomIndex, 1);
    drawnNumbers.push(randomNumber);

    // 抽選履歴
    const historyItem = document.createElement("div");

    historyItem.textContent = randomNumber;

    history.appendChild(historyItem);    
}


// 抽選ボタンをクリックしたときの処理
document.getElementById("draw-button").addEventListener("click", async function () {

    // 抽選ボタンを無効化
    this.disabled = true;

    // 抽選結果を決める
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];  

    await drawAnimation();

    executeDraw(randomNumber, randomIndex);

    // 抽選ボタンを再び有効化
    if (numbers.length > 0) {
        this.disabled = false;
    }

    // 確認用
    console.log(numbers);
    console.log(drawnNumbers);
    console.log(marked);

});


// 指定した範囲からランダムに数字を選ぶ関数
function getRandomNumbers(min, max, count) {

    const numbers = [];

    // 指定された範囲の数字を配列に入れる
    for (let number = min; number <= max; number += 1) {
        numbers.push(number);
    }

    const selectedNumbers = [];

    // 指定された個数だけランダムに選ぶ。通常は5
    for (let i = 0; i < count; i += 1) {

        const randomIndex = Math.floor(Math.random() * numbers.length);

        selectedNumbers.push(numbers[randomIndex]);

        numbers.splice(randomIndex, 1);
    }

    return selectedNumbers;
}


// カード生成ボタンの処理
document.getElementById("generate-button").addEventListener("click", function () {

    // それぞれの列の数字をそれぞれの範囲内でランダムに取得する。getRandomNumbers(開始数字, 終了数字, 選ぶ個数)
    const b = getRandomNumbers(1, 15, 5);
    const i = getRandomNumbers(16, 30, 5);
    const n = getRandomNumbers(31, 45, 4);
    const g = getRandomNumbers(46, 60, 5);
    const o = getRandomNumbers(61, 75, 5);

    const columns = [b, i, n, g, o];

    const playerCard = document.querySelector(".player-card");

    playerCard.innerHTML = "";

    for (let row = 0; row < 5; row ++) {
        for (let col = 0; col < 5; col ++) {
            // ここで数字を取り出してHTMLに追加する
            const cell = document.createElement("div");

            // 生成されたカードのマスに行番号と列番号を持たせる
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (row === 2 && col === 2) {
                cell.textContent = "FREE";
                cell.classList.add("drawn");
            } else if (col === 2 && row > 2) {
                cell.textContent = columns[col][row - 1];
            } else {
                cell.textContent = columns[col][row];
            }
            
            if (row !== 2 || col !== 2) {
                cell.dataset.number = cell.textContent;
            }

            playerCard.appendChild(cell);
        }
    }

    // ビンゴ判定初期化
    marked = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, true, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ];

    // カードを生成したタイミングで抽選ボタンが押せるようにする
    document.getElementById("draw-button").disabled = false;

});