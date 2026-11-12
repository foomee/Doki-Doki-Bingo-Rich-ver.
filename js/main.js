const numbers = [];
const drawnNumbers = [];

let hasBingo = false;

let marked = [
    [false, false, false, false, false],
    [false, false, true, false, false],
    [false, false, false, false, false],
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


// 抽選結果を表示させる部分のidがresultの要素を取得しておく
const result = document.getElementById("result");

// 抽選履歴のhistoryを取得しておく
const history = document.querySelector(".history");

// モーダル要素を取得する
const modal = document.querySelector(".modal");


// ビンゴ判定の関数
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


// リロールチャンスの関数
async function rerollChance(randomNumber, randomIndex, shouldRun) {

    if (shouldRun) {

        // リロールチャンス発生時の音
        const clapsSound = new Audio("sounds/claps.mp3");
        clapsSound.play();

        showEvent("reroll");

        document.getElementById("current-number").textContent = randomNumber;

        // 選択画面を表示
        document.getElementById("reroll-area").style.display = "flex";

        const reroll = await new Promise(resolve => {
            document.getElementById("reroll-yes")
                .addEventListener("click", function() {
                    resolve(true);
                }, {once: true});

            document.getElementById("reroll-no")
                .addEventListener("click", function() {
                    resolve(false);
                }, {once: true});
        });

        // 数字を抽選し直す処理
        if (reroll) {

            // 抽選時の音
            const drawSound = new Audio("sounds/draw.mp3");
            drawSound.play();

            randomIndex = Math.floor(Math.random() * numbers.length);
            randomNumber = numbers[randomIndex];

            await drawAnimation(randomNumber);
        }

        hideEvent();
    }

    return {randomNumber, randomIndex};
}


// IDがlucky-selectの要素を取得しておく
const luckySelect = document.getElementById("lucky-select");


// ラッキーナンバーの関数
async function luckyNumber(shouldRun) {

    if (shouldRun) {

        // ラッキーナンバー当選時の音
        const clapsSound = new Audio("sounds/bull.mp3");
        clapsSound.play();

        showEvent();
        document.getElementById("lucky-area").style.display = "flex";

        // 抽選結果の表示を変更
        result.textContent = "🎯";

        // 数字選択肢を最新の状態に更新
        luckySelect.innerHTML = '<option value="" selected disabled>数字を選択してください</option>';

        numbers.forEach(function (number) {
            const option = document.createElement("option");

            option.textContent = number;
            option.value = number;

            luckySelect.appendChild(option);
        });

        // ユーザーの選択を待つ
        const selectedNumber = await new Promise(resolve => {

            const confirmButton = document.getElementById("lucky-confirm");

            const handleConfirm = function () {
                if (luckySelect.value === "") {
                    return;
                }

                confirmButton.removeEventListener("click", handleConfirm);

                resolve(Number(luckySelect.value));
            };

            confirmButton.addEventListener("click", handleConfirm);
        });

        hideEvent();

        // 選択した数字と、その数字の配列番号を返す
        return {
            randomNumber: selectedNumber,
            randomIndex: numbers.indexOf(selectedNumber)
        };
    }

    return null;
}


// アンラッキーの関数
async function unluckyNumber(shouldRun) {

    if (!shouldRun || drawnNumbers.length === 0) {
        return;
    }

    // アンラッキー発生時の音
    const unluckySound = new Audio("sounds/oh-no.mp3");
    unluckySound.play();

    showEvent("unlucky");

    // 抽選済みの数字からランダムに1つ選ぶ
    const randomIndex = Math.floor(Math.random() * drawnNumbers.length);

    // 抽選済みの数字を取り出す
    const unluckyNumber = drawnNumbers.splice(randomIndex, 1)[0];

    // 抽選前の数字グループに戻す
    numbers.push(unluckyNumber);


    // ビンゴ表の色を解除
    const drawnCell = bingoTable.querySelector(
        `[data-number="${unluckyNumber}"]`
    );

    drawnCell.classList.remove("drawn");


    // プレイヤーカードの色を解除
    const playerCell = document.querySelector(
        `.player-card [data-number="${unluckyNumber}"]`
    );

    if (playerCell) {
        playerCell.classList.remove("drawn");

        const row = Number(playerCell.dataset.row);
        const col = Number(playerCell.dataset.col);

        marked[row][col] = false;
    }


    // 抽選履歴から数字を削除
    const historyItem = history.querySelector(
        `[data-number="${unluckyNumber}"]`
    );

    if (historyItem) {
        historyItem.remove();
    }


    // ビンゴ状態を再判定
    hasBingo = checkBingo();


    // アンラッキーの表示
    document.getElementById("unlucky-number").textContent = unluckyNumber;
    document.getElementById("unlucky-area").style.display = "flex";    

    console.log("アンラッキーで戻された数字:", unluckyNumber);
}


// イベント表示
function showEvent(eventName) {
    document.querySelector(".event-alert").style.display = "block";
}


// イベント表示終了
function hideEvent() {
    document.getElementById("reroll-area").style.display = "none";
    document.getElementById("lucky-area").style.display = "none";
    document.getElementById("unlucky-area").style.display = "none";

    document.querySelector(".event-alert").style.display = "none";
}


// 抽選演出
async function drawAnimation(randomNumber) {

    // .result-pop を毎回リセットする
    result.classList.remove("result-pop");

    result.classList.add("drawing");

    const timerId = setInterval(function () {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const animationNumber = numbers[randomIndex];

        result.textContent = animationNumber;
    }, 25);

    await new Promise(resolve => setTimeout(resolve, 774));

    // 数字確定時の音
    const drawnSound = new Audio("sounds/drawn.mp3");
    drawnSound.play();

    result.classList.remove("drawing");

    clearInterval(timerId);
    result.textContent = randomNumber;
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


    // プレイヤーカードの中から、抽選された数字と一致するマスを探す
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

        // ビンゴ成立時の音
        const fanfareSound = new Audio("sounds/fanfare.mp3");
        fanfareSound.play();
    }


    // モーダル(ビンゴ演出)を閉じる
    modal.addEventListener("click", function() {
        modal.style.display = "none";
    });


    // 抽選結果表示時のアニメーション用
    result.textContent = randomNumber;
    result.classList.add("result-pop");


    // 抽選された数字を抽選前グループから削除して、抽選後グループに移す
    numbers.splice(randomIndex, 1);
    drawnNumbers.push(randomNumber);


    // 抽選履歴
    const historyItem = document.createElement("div");

    historyItem.textContent = randomNumber;
    historyItem.dataset.number = randomNumber;

    history.appendChild(historyItem);
}


// 抽選ボタンをクリックしたときの処理
document.getElementById("draw-button").addEventListener("click", async function () {

    hideEvent();

    // 抽選時の音
    const drawSound = new Audio("sounds/draw.mp3");
    drawSound.play();

    // 抽選ボタンを無効化
    this.disabled = true;

    // カード生成ボタンも無効化
    document.getElementById("generate-button").disabled = true;


    // イベントの発生判定
    const isLucky = Math.random() < 0.03;

    // ラッキーが発生していない場合のみリロールを判定
    const isReroll = !isLucky && Math.random() < 0.1;

    // アンラッキーは独立して判定
    const isUnlucky = Math.random() < 0.05;


    // 抽選結果を決める
    let randomIndex = Math.floor(Math.random() * numbers.length);
    let randomNumber = numbers[randomIndex];


    // 抽選演出の関数呼び出し
    await drawAnimation(randomNumber);


    // リロールチャンス
    const rerollResult = await rerollChance(
        randomNumber,
        randomIndex,
        isReroll
    );

    // 引き直した結果を反映
    randomNumber = rerollResult.randomNumber;
    randomIndex = rerollResult.randomIndex;


    // ラッキーナンバー判定
    const luckyResult = await luckyNumber(isLucky);

    if (luckyResult !== null) {
        randomNumber = luckyResult.randomNumber;
        randomIndex = luckyResult.randomIndex;
    }


    // 抽選処理の関数呼び出し
    executeDraw(randomNumber, randomIndex);


    // アンラッキー判定（必ず最後）
    await unluckyNumber(isUnlucky);


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

    hideEvent();

    // それぞれの列の数字をそれぞれの範囲内でランダムに取得する
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

    // ビンゴ状態も初期化
    hasBingo = false;

    // カード生成時に抽選ボタンが押せるようにする
    document.getElementById("draw-button").disabled = false;

});