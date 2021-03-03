function main() {
    let columnCount = 10;
    let rowCount = 26;
    let interval = 500;
    let playerName = '';
    let score = 0;
    let level = 1;
    let bricks = [];
    let scores = [];
    let storage = typeof(Storage) !== "undefined";
    let currentBlock;
    let nextBlock;
    let blockMover;
    let running;

    document.getElementById("newGame").addEventListener("click", event => {
        newGame();
    });

    drawBoard();
    setHighscores();
    newGame();

    function drawBoard() {
        for(let y = 1; y <= rowCount; y++) {
            let row = document.getElementById('playingfield').insertRow();
    
            for(let x = 1; x <= columnCount; x++) {
                let td = row.insertCell();
                td.id = x + ',' + y;
                td.className = 'empty';
            }
        }
        
        for(let y = 1; y <= 4; y++) {
            let row = document.getElementById('comingUp').insertRow();
    
            for(let x = 1; x <= 4; x++) {
                let td = row.insertCell();
                td.id = 'cu:' + x + ',' + y;
                td.className = 'comingUp';
            }
        }
    }

    function showNext(block) {
        let allComingBlock = document.getElementsByClassName('comingUp')
        
        for (let i = 0; i < allComingBlock.length; ++i) {
            allComingBlock[i].className = 'comingUp';
        }
        
        let nextBricks = drawBricks(block);
        
        for (let i = 0; i < nextBricks.length; ++i) {
            let x = parseInt(nextBricks[i].id.split(',')[0]) - 3;
            let y = parseInt(nextBricks[i].id.split(',')[1]) + 1;
            let newBlock = document.getElementById('cu:' + x + ',' + y);
            newBlock.className = 'comingUp ' + block;
        }
    }

    function spawnBlock(block) {
        let newBricks = drawBricks(block);

        for (let i = 0; i < newBricks.length; i++) {
            if (newBricks[i].getAttribute('class').split(' ')[1] === 'fixed') {
                endGame();
                break;
            }
        }

        if (running) {
            newBricks[0].className = newBricks[1].className = newBricks[2].className = newBricks[3].className = block;

            return newBricks;
        }

        return null;
    }

    function drawBricks(block) {
        let newBricks = [];

        switch (block) {
            case 'red': { newBricks[0] = document.getElementById('5,1'); newBricks[1] = document.getElementById('4,1'); newBricks[2] = document.getElementById('6,1'); newBricks[3] = document.getElementById('7,1'); }; break;
            case 'blue': { newBricks[0] = document.getElementById('5,1'); newBricks[1] = document.getElementById('6,1'); newBricks[2] = document.getElementById('5,2'); newBricks[3] = document.getElementById('6,2'); }; break;
            case 'green': { newBricks[0] = document.getElementById('5,2'); newBricks[1] = document.getElementById('5,1'); newBricks[2] = document.getElementById('4,2'); newBricks[3] = document.getElementById('6,2'); }; break;
            case 'turquoise': { newBricks[0] = document.getElementById('5,2'); newBricks[1] = document.getElementById('6,1'); newBricks[2] = document.getElementById('4,2'); newBricks[3] = document.getElementById('6,2'); }; break;
            case 'yellow': { newBricks[0] = document.getElementById('5,2'); newBricks[1] = document.getElementById('4,1'); newBricks[2] = document.getElementById('4,2'); newBricks[3] = document.getElementById('6,2'); }; break;
            case 'purple': { newBricks[0] = document.getElementById('5,2'); newBricks[1] = document.getElementById('4,1'); newBricks[2] = document.getElementById('5,1'); newBricks[3] = document.getElementById('6,2'); }; break;
            case 'white': { newBricks[0] = document.getElementById('5,2'); newBricks[1] = document.getElementById('5,1'); newBricks[2] = document.getElementById('6,1'); newBricks[3] = document.getElementById('4,2'); }; break;
        }

        return newBricks;
    }

    function checkBricks(block) {
        for (let i = 0; i < block.length; i++) {
            if (block[i] === null || block[i].getAttribute('class').split(' ')[1] === 'fixed') {
                return false;
            }
        }

        return true;
    }

    function moveBlock(direction) {
        let newBricks = [];
        let className = bricks[0].getAttribute('class');

        for (let i = 0; i < bricks.length; i++) {
            let oldBrickX = parseInt(bricks[i].id.split(',')[0]);
            let oldBrickY = parseInt(bricks[i].id.split(',')[1]);
            let newBrick = null;
    
            switch (direction) {
                case 'down': {
                    newBrick = document.getElementById(oldBrickX + ',' + (oldBrickY + 1));
                }; break;
                case 'left': {
                    if ((oldBrickX - 1) >= 1) {
                        newBrick = document.getElementById((oldBrickX - 1) + ',' + oldBrickY);
                    }
                }; break;
                case 'right': {
                    if ((oldBrickX + 1) <= columnCount) {
                        newBrick = document.getElementById((oldBrickX + 1) + ',' + oldBrickY);
                    }
                }; break;
            }

            newBricks[i] = newBrick;
        }

        if (checkBricks(newBricks)) {
            for (let i = 0; i < bricks.length; i++) {
                bricks[i].className = 'empty';
            }
            for (let i = 0; i < bricks.length; i++) {
                bricks[i] = newBricks[i];
                bricks[i].className = className;
            }
        } else {
            if (direction === 'down') {
                stopBlock();
            }
        }
    }

    function rotateBlock(direction) {
        let oldBrickX = parseInt(bricks[0].id.split(',')[0]);
        let oldBrickY = parseInt(bricks[0].id.split(',')[1]);
        let className = bricks[0].getAttribute('class');
        let newBlock = [];

        if (currentBlock !== 'blue') {
            newBlock[0] = bricks[0];

            for (let i = 1; i < bricks.length; i++) {
                let diffX = parseInt(bricks[i].id.split(',')[0]) - oldBrickX;
                let diffY = parseInt(bricks[i].id.split(',')[1]) - oldBrickY;

                if (direction === 'clockwise') {
                    if (diffX === 0 && diffY < 0 && oldBrickX + Math.abs(diffY) <= columnCount) { newBlock[i] = document.getElementById((oldBrickX + Math.abs(diffY)) + ',' + oldBrickY);
                    } else if (diffX > 0 && diffY < 0 && oldBrickY + Math.abs(diffY) <= rowCount) {
                        newBlock[i] = document.getElementById((oldBrickX + Math.abs(diffX)) + ',' + (oldBrickY + Math.abs(diffY)));
                    } else if (diffX > 0 && diffY === 0 && oldBrickY + Math.abs(diffX) <= rowCount) {
                        newBlock[i] = document.getElementById(oldBrickX + ',' + (oldBrickY + Math.abs(diffX)));
                    } else if (diffX > 0 && diffY > 0 && oldBrickX - Math.abs(diffX) > 0) {
                        newBlock[i] = document.getElementById((oldBrickX - Math.abs(diffX)) + ',' + (oldBrickY + Math.abs(diffY)));
                    } else if (diffX === 0 && diffY > 0 && oldBrickX - Math.abs(diffY) > 0) {
                        newBlock[i] = document.getElementById((oldBrickX - Math.abs(diffY) + ',' + oldBrickY));
                    } else if (diffX < 0 && diffY > 0 && oldBrickY - Math.abs(diffX) > 0) {
                        newBlock[i] = document.getElementById((oldBrickX - Math.abs(diffX)) + ',' + (oldBrickY - Math.abs(diffY)));
                    } else if (diffX < 0 && diffY === 0 && oldBrickY - Math.abs(diffX) > 0) {
                        newBlock[i] = document.getElementById(oldBrickX + ',' + (oldBrickY - Math.abs(diffX)));
                    } else if (diffX < 0 && diffY < 0 && oldBrickX + Math.abs(diffY) <= columnCount) {
                        newBlock[i] = document.getElementById((oldBrickX + Math.abs(diffX)) + ',' + (oldBrickY - Math.abs(diffY)));
                    }
                } else {
                    if (diffX === 0 && diffY < 0 && oldBrickX - Math.abs(diffY) > 0) {
                        newBlock[i] = document.getElementById((oldBrickX - Math.abs(diffY)) + ',' + oldBrickY);
                    } else if (diffX > 0 && diffY < 0 && oldBrickX - Math.abs(diffX) > 0) {
                        newBlock[i] = document.getElementById((oldBrickX - Math.abs(diffX)) + ',' + (oldBrickY - Math.abs(diffY)));
                    } else if (diffX > 0 && diffY === 0 && oldBrickY - Math.abs(diffX) > 0) {
                        newBlock[i] = document.getElementById(oldBrickX + ',' + (oldBrickY - Math.abs(diffX)));
                    } else if (diffX > 0 && diffY > 0 && oldBrickY - Math.abs(diffY) > 0) {
                        newBlock[i] = document.getElementById((oldBrickX + Math.abs(diffX)) + ',' + (oldBrickY - Math.abs(diffY)));
                    } else if (diffX === 0 && diffY > 0 && oldBrickX + Math.abs(diffY) <= columnCount) {
                        newBlock[i] = document.getElementById((oldBrickX + Math.abs(diffY) + ',' + oldBrickY));
                    } else if (diffX < 0 && diffY > 0 && oldBrickX + Math.abs(diffX) <= columnCount) {
                        newBlock[i] = document.getElementById((oldBrickX + Math.abs(diffX)) + ',' + (oldBrickY + Math.abs(diffY)));
                    } else if (diffX < 0 && diffY === 0 && oldBrickY + Math.abs(diffX) <= rowCount) {
                        newBlock[i] = document.getElementById(oldBrickX + ',' + (oldBrickY + Math.abs(diffX)));
                    } else if (diffX < 0 && diffY < 0 && oldBrickY + Math.abs(diffY) <= rowCount) {
                        newBlock[i] = document.getElementById((oldBrickX - Math.abs(diffX)) + ',' + (oldBrickY + Math.abs(diffY)));
                    }
                }
            }

            if (newBlock.length === 4 && checkBricks(newBlock)) {
                for (let i = 0; i < bricks.length; i++) {
                    bricks[i].className = 'empty';
                }
        
                for (let i = 0; i < bricks.length; i++) {
                    bricks[i] = newBlock[i];
                    bricks[i].className = className;
                }
            }
        }
    }

    function stopBlock() {
        for (let i = 0; i < bricks.length; i++) {
            bricks[i].className += ' fixed';
        }

        checkForLines();
        setNextBlock();
    }

    function setNextBlock() {
        currentBlock = nextBlock;
        nextBlock = randomizeBlock();
        showNext(nextBlock);
        bricks = spawnBlock(currentBlock);
    }

    function randomizeBlock() {
        let random = 1 + Math.floor(Math.random() * 7);

        switch (random) {
            case 1: return 'red';
            case 2: return 'blue';
            case 3: return 'green';
            case 4: return 'turquoise';
            case 5: return 'yellow';
            case 6: return 'purple';
            case 7: return 'white';
        }
    }

    function checkForLines() {
        var fullRows = [];

        for (let row = 1; row <= rowCount; row++) {
            let brickCount = 0;

            for (let col = 1; col <= columnCount; col++) {
                var checkBrick = document.getElementById(col + ',' + row);
                if (checkBrick.getAttribute('class').split(' ')[1] === 'fixed') {
                    ++brickCount;
                }
            }

            if (brickCount === columnCount) {
                fullRows.push(row);
            }
        }

        if (fullRows.length > 0) {
            for (let i = 0; i < fullRows.length; i++) {
                destroyRow(fullRows[i]);
            }

            moveRows(fullRows);
        }
    }

    function destroyRow(rowNumber) {
        for (let col = 1; col <= columnCount; col++) {
            var destroyBrick = document.getElementById(col + ',' + rowNumber);
            destroyBrick.className = 'empty';
        }
    }

    function moveRows(fullRows) {
        for(let i = 0; i < fullRows.length; i++) {
            let allBricks = document.getElementsByClassName('fixed');
            let moveBricks = [];

            for (let j = 0; j < allBricks.length; j++) {
                if (allBricks[j].id.split(',')[1] < fullRows[i]) {
                    moveBricks.push(allBricks[j]);
                }
            }

            for (let k = (moveBricks.length - 1); k >= 0; k--) {
                let oldBrickX = parseInt(moveBricks[k].id.split(',')[0]);
                let oldBrickY = parseInt(moveBricks[k].id.split(',')[1]);
                let newBrick = document.getElementById(oldBrickX + ',' + (oldBrickY + 1));

                newBrick.className = moveBricks[k].className;
                moveBricks[k].className = 'empty';
                moveBricks[k] = newBrick;
            }
        }

        switch (fullRows.length) {
            case 1: updateScore(1); break;
            case 2: updateScore(3); break;
            case 3: updateScore(10); break;
            case 4: updateScore(30); break;
        }
    }

    function updateScore(addScore) {
        score += addScore;
        document.getElementById('score').innerText = score;

        updateLevel();
    }

    function updateLevel() {
        if (score / level > 500 && interval > 10) {
            interval -= 10;

            clearInterval(blockMover);

            blockMover = setInterval(function() {
                if (running) {
                    moveBlock('down');
                }
            }, interval);

            ++level;
            document.getElementById('level').innerText = level;
        }
    }

    function endGame() {
        document.getElementById('pausetext').innerText = 'game over';
        document.getElementById('pause-big').style.display = 'block';
        document.getElementById('pause-small').style.display = 'block';

        checkForHighScore();
        clearInterval(blockMover);

        running = false;
    }

    function checkForHighScore() {
        let scorelist = document.getElementById('scorelist').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        for (let i = 0; i < scorelist.length; ++i) {
            if (localStorage.getItem("score-" + i+1) < score) {
                document.getElementById('newGame').disabled = true;
                document.getElementById('nameBox').style.display = 'block';
                break;
            }
        }
    }

    function setHighscores() {
        if (storage) {
            let scorelist = document.getElementById('scorelist').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            let savedList;

            for (let i = 0; i < scorelist.length; ++i) {
                let place = i+1;
                let name = localStorage.getItem("name-" + place);
                let scr = localStorage.getItem("score-" + place);

                if (name == null || scr == null) {
                    savedList = false;
                    break;
                } else {
                    scorelist[i].getElementsByTagName('td')[1].innerText = name;
                    scorelist[i].getElementsByTagName('td')[2].innerText = scr;
                }
            }

            if (!savedList) {
                for (let i = 0; i < scorelist.length; ++i) {
                    let place = i+1;
                    let name = scorelist[i].getElementsByTagName('td')[1].innerText;
                    let scr = scorelist[i].getElementsByTagName('td')[2].innerText;
                    localStorage.setItem("name-" + place, name);
                    localStorage.setItem("score-" + place, scr);
                }
            }

            document.getElementById('highscore').style.display = 'inline-block';
        }
    }

    function updateHighscores() {
        scores = [];
        let added = false;
        let scorelist = document.getElementById('scorelist').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

        for (let i = 0; i < scorelist.length; ++i) {
            let name = scorelist[i].getElementsByTagName('td')[1].innerText;
            let points = parseInt(scorelist[i].getElementsByTagName('td')[2].innerText);

            if (!added && score > points) {
                scores.push(playerName + ':' + score);
                added = true;
            }

            scores.push(name + ':' + points);
        }

        for (let i = 0; i < scorelist.length; ++i) {
            let place = i + 1;
            let name = scores[i].split(':')[0];
            let scr = scores[i].split(':')[1];

            if (name === playerName) {
                console.log('playerName');
                scorelist[i].getElementsByTagName('td')[0].className = 'place bold';
                scorelist[i].getElementsByTagName('td')[1].className = 'name bold';
                scorelist[i].getElementsByTagName('td')[2].className = 'score bold';
            } else {
                scorelist[i].getElementsByTagName('td')[0].className = 'place';
                scorelist[i].getElementsByTagName('td')[1].className = 'name';
                scorelist[i].getElementsByTagName('td')[2].className = 'score';
            }

            scorelist[i].getElementsByTagName('td')[1].innerText = name;
            scorelist[i].getElementsByTagName('td')[2].innerText = scr;

            localStorage.setItem("name-" + place, name);
            localStorage.setItem("score-" + place, scr);
        }
    }

    function setPlayerName() {
        playerName = document.getElementById('playerName').value;

        updateHighscores();

        document.getElementById('newGame').disabled = false;
    }

    function newGame() {
        running = true;
        score = 0;
        level = 1;
        interval = 750;

        document.getElementById('score').innerText = score;
        document.getElementById('level').innerText = level;
        document.getElementById('pause-big').style.display = 'none';
        document.getElementById('pause-small').style.display = 'none';
        
        let cells = document.getElementsByTagName('td');

        for (let i = 0; i < cells.length; ++i) {
            if (cells[i].id.length > 0) {
                cells[i].className = 'empty';
            }
        }

        clearInterval(blockMover);
        
        blockMover = setInterval(function() {
            if (running) {
                moveBlock('down');
            }
        }, interval);
        
        nextBlock = randomizeBlock();
        showNext(nextBlock);
        currentBlock = randomizeBlock();
        bricks = spawnBlock(currentBlock);
    }

    function pause() {
        if (running) {
            document.getElementById('pausetext').innerText = 'paused';
            document.getElementById('pause-big').style.display = 'block';
            document.getElementById('pause-small').style.display = 'block';
        } else {
            document.getElementById('pause-big').style.display = 'none';
            document.getElementById('pause-small').style.display = 'none';
        }
        
        running = !running;
    }

    function sleep(ms) {
        var e = new Date().getTime() + (ms);
        while (new Date().getTime() <= e) {}
    }

    document.addEventListener("keydown", event => {
        if (event.isComposing || event.keyCode === 229) {
          return;
        }

        if (running) {
            switch (event.keyCode) {
                case 16: rotateBlock('clockwise'); break;
                case 17: rotateBlock('counterclockwise'); break;
                case 19: pause(); break;
                case 37: moveBlock('left'); break;
                case 39: moveBlock('right'); break;
                case 40: moveBlock('down'); break;
            }
        } else if (event.keyCode === 19) {
            pause();
        }
    });

    document.getElementById('submitName').addEventListener('click', function () {
        setPlayerName();
    });
}

if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main);
}