import { ResizeHandler } from './js/resizeHandler.js';
import { GameHandler } from './js/gameHandler.js';

$(document).ready(function() {
    let resizeHandler = new ResizeHandler();
    let gameHandler = new GameHandler(
        $('.circles-wrapper'), 
        {
            initialAliveProbability: 0.08,
            stepMillis: 200,
            transitionMillis: 500,
            stayAliveProbabilities: [ .02, 1, 1, .02, .02, .02, .02, .02, .02 ],
            becomeAliveProbabilities: [ .01, .01, .01, 1, .01, .01, .01, .01, .01 ],
            showGrid: true
        }
    );

    resizeHandler.onResizeStart = () => {
        gameHandler.removeBoard();
    }
    resizeHandler.onResizeEnd = () => {
        gameHandler.initBoard();
        gameHandler.runGame();
    }

    createMenu(gameHandler);
}); 

function createMenu(gameHandler) {
    $('#initialAliveProb').val(gameHandler.initialAliveProbability);
    $('#initialAliveProb').change(() => {
        gameHandler.initialAliveProbability = parseFloat($('#initialAliveProb').val());
    });

    $('#stepms').val(gameHandler.stepMillis);
    $('#stepms').change(() => {
        gameHandler.changeStepMillis(parseFloat($('#stepms').val()));
    });

    $('#visualtransitionms').val(gameHandler.transitionMillis);
    $('#visualtransitionms').change(() => {
        gameHandler.changeTransitionMillis(parseFloat($('#visualtransitionms').val()));
    });

    for (let i = 0; i <= 8; i++) {
        let aliveId = `#alive-${i}`;
        let deadId = `#dead-${i}`;
        $(aliveId).val(gameHandler.stayAliveProbabilities[i]);
        $(deadId).val(gameHandler.becomeAliveProbabilities[i]);
        $(aliveId).change(() => {
            gameHandler.stayAliveProbabilities[i] = parseFloat($(aliveId).val());
        });
        $(deadId).change(() => {
            gameHandler.becomeAliveProbabilities[i] = parseFloat($(deadId).val());
        });
    }

    $('#step').click(() => {
        if (gameHandler.isRunning())
            stop();
        gameHandler.runIteration();
    });

    function stop() {
        $('#play').css('display', 'block');
        $('#pause').css('display', 'none');
        gameHandler.stopGame();
    }

    function start() {
        $('#play').css('display', 'none');
        $('#pause').css('display', 'block');
        gameHandler.runGame();
    }

    $('#playpause').click(() => {
        if (gameHandler.isRunning()) {
            stop();
        }
        else {
            start();
        }
    });

    $('#emptyHelpText').css('display', 'none');
    $('.init').change(function () {
        switch ($(this).val()) {
            case 'random':
                $('.initprob').css('display', 'inline');
                $('#emptyHelpText').css('display', 'none');
                gameHandler.initialAliveProbability = parseFloat($('#initialAliveProb').val());
                break;
            case 'empty':
                $('.initprob').css('display', 'none');
                $('#emptyHelpText').css('display', 'inline');
                gameHandler.initialAliveProbability = 0;
                break;
        }
    });

    $('#restart').click(() => {
        if (gameHandler.isRunning())
            stop();
        gameHandler.removeBoard();
        gameHandler.initBoard();
    });

    $('#showgrid').prop('checked', gameHandler.showGrid);
    $('#showgrid').click(() => {
        console.log($('#showgrid').prop('checked'))
        gameHandler.changeShowGrid($('#showgrid').prop('checked'));
    });
}
