/*:
 * @target MZ
 * @plugindesc Requires a correct algebra multiple-choice answer before Attack can be used in battle.
 * @author Codex
 *
 * @help AlgebraBattleQuestions.js
 *
 * Put algebra_questions.json in the project root. Each question should look like:
 * {
 *   "question": "Solve ...",
 *   "Choices": ["A", "B", "C", "D"],
 *   "answer": "B"
 * }
 *
 * When an actor chooses Attack, a random question is shown. A correct answer
 * continues to normal enemy selection. A wrong answer consumes that attack
 * chance with no effect.
 */

(() => {
    "use strict";

    const QUESTION_FILE = "algebra_questions.json";
    const QUESTION_TIME_LIMIT_SECONDS = 30;
    const SUPERSCRIPTS = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
        "+": "⁺",
        "-": "⁻",
        "(": "⁽",
        ")": "⁾",
        "n": "ⁿ",
        "i": "ⁱ"
    };

    const AlgebraBattleQuestions = {
        _loadStarted: false,
        _loaded: false,
        _questions: [],
        _skipSkillId: 0,

        load() {
            if (this._loadStarted) {
                return;
            }
            this._loadStarted = true;
            const xhr = new XMLHttpRequest();
            xhr.open("GET", QUESTION_FILE);
            xhr.overrideMimeType("application/json");
            xhr.onload = () => {
                if (xhr.status < 400) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        this._questions = this.normalizeQuestions(data);
                    } catch (error) {
                        console.error("Failed to parse algebra questions:", error);
                        this._questions = [];
                    }
                } else {
                    console.error(`Failed to load ${QUESTION_FILE}: ${xhr.status}`);
                }
                this._loaded = true;
            };
            xhr.onerror = () => {
                console.error(`Failed to load ${QUESTION_FILE}.`);
                this._loaded = true;
            };
            xhr.send();
        },

        isReady() {
            return this._loaded;
        },

        hasQuestions() {
            return this._questions.length > 0;
        },

        normalizeQuestions(data) {
            if (!Array.isArray(data)) {
                return [];
            }
            return data
                .map(entry => {
                    const question = String(entry.question || "").trim();
                    const choices = entry.Choices || entry.choices || entry.options || [];
                    const answer = String(entry.answer || "").trim();
                    const normalizedChoices = choices.map(choice => String(choice).trim());
                    const answerIndex = normalizedChoices.indexOf(answer);
                    return { question, choices: normalizedChoices, answer, answerIndex };
                })
                .filter(entry => {
                    return (
                        entry.question.length > 0 &&
                        entry.choices.length >= 2 &&
                        entry.answerIndex >= 0
                    );
                });
        },

        randomQuestion() {
            return this._questions[Math.randomInt(this._questions.length)];
        },

        formatMathText(value) {
            return String(value)
                .replace(/\^(-?\d+)/g, (_, exponent) => {
                    return exponent
                        .split("")
                        .map(character => SUPERSCRIPTS[character] || character)
                        .join("");
                })
                .replace(/\*/g, " × ")
                .replace(/\s*=\s*/g, " = ")
                .replace(/\s*\+\s*/g, " + ")
                .replace(/\s*-\s*/g, " - ")
                .replace(/^\s-\s/, "-")
                .replace(/\(\s-\s/g, "(-")
                .replace(/\s+/g, " ")
                .trim();
        },

        ensureSkipSkill() {
            if (this._skipSkillId > 0) {
                return this._skipSkillId;
            }
            const id = $dataSkills.length;
            $dataSkills[id] = {
                id,
                animationId: 0,
                damage: {
                    critical: false,
                    elementId: 0,
                    formula: "0",
                    type: 0,
                    variance: 0
                },
                description: "",
                effects: [],
                hitType: Game_Action.HITTYPE_CERTAIN,
                iconIndex: 0,
                message1: "",
                message2: "",
                mpCost: 0,
                name: "Missed Attack",
                note: "<AlgebraMissedAttack>",
                occasion: 1,
                repeats: 1,
                requiredWtypeId1: 0,
                requiredWtypeId2: 0,
                scope: 0,
                speed: 0,
                stypeId: 0,
                successRate: 100,
                tpCost: 0,
                tpGain: 0,
                messageType: 0
            };
            this._skipSkillId = id;
            return id;
        }
    };

    window.AlgebraBattleQuestions = AlgebraBattleQuestions;

    const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) {
            return false;
        }
        AlgebraBattleQuestions.load();
        if (!AlgebraBattleQuestions.isReady()) {
            return false;
        }
        AlgebraBattleQuestions.ensureSkipSkill();
        return true;
    };

    function Window_AlgebraQuestionPrompt() {
        this.initialize(...arguments);
    }

    Window_AlgebraQuestionPrompt.prototype = Object.create(Window_Base.prototype);
    Window_AlgebraQuestionPrompt.prototype.constructor = Window_AlgebraQuestionPrompt;

    Window_AlgebraQuestionPrompt.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._question = null;
        this.hide();
        this.close();
    };

    Window_AlgebraQuestionPrompt.prototype.setQuestion = function(question) {
        this._question = question;
        this.refresh();
    };

    Window_AlgebraQuestionPrompt.prototype.refresh = function() {
        this.contents.clear();
        if (!this._question) {
            return;
        }
        this.changeTextColor(ColorManager.systemColor());
        this.drawText("Answer correctly to attack:", 0, 0, this.innerWidth);
        this.resetTextColor();
        const question = AlgebraBattleQuestions.formatMathText(this._question.question);
        this.drawWrappedText(question, 0, this.lineHeight() + 8, this.innerWidth);
    };

    Window_AlgebraQuestionPrompt.prototype.drawWrappedText = function(text, x, y, maxWidth) {
        const words = String(text).split(/\s+/);
        let line = "";
        let lineY = y;
        for (const word of words) {
            const nextLine = line ? `${line} ${word}` : word;
            if (this.textWidth(nextLine) > maxWidth && line) {
                this.drawText(line, x, lineY, maxWidth);
                line = word;
                lineY += this.lineHeight();
            } else {
                line = nextLine;
            }
        }
        if (line) {
            this.drawText(line, x, lineY, maxWidth);
        }
    };

    function Window_AlgebraChoices() {
        this.initialize(...arguments);
    }

    Window_AlgebraChoices.prototype = Object.create(Window_Command.prototype);
    Window_AlgebraChoices.prototype.constructor = Window_AlgebraChoices;

    Window_AlgebraChoices.prototype.initialize = function(rect) {
        this._question = null;
        Window_Command.prototype.initialize.call(this, rect);
        this.deactivate();
        this.hide();
        this.close();
    };

    Window_AlgebraChoices.prototype.setQuestion = function(question) {
        this._question = question;
        this.refresh();
        this.select(0);
    };

    Window_AlgebraChoices.prototype.makeCommandList = function() {
        if (!this._question) {
            return;
        }
        this._question.choices.forEach((choice, index) => {
            const formattedChoice = AlgebraBattleQuestions.formatMathText(choice);
            this.addCommand(formattedChoice, `answer${index}`, true, index);
        });
    };

    Window_AlgebraChoices.prototype.itemHeight = function() {
        return Math.max(44, Window_Command.prototype.itemHeight.call(this));
    };

    function Window_AlgebraTimer() {
        this.initialize(...arguments);
    }

    Window_AlgebraTimer.prototype = Object.create(Window_Base.prototype);
    Window_AlgebraTimer.prototype.constructor = Window_AlgebraTimer;

    Window_AlgebraTimer.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._remainingSeconds = null;
        this.hide();
        this.close();
    };

    Window_AlgebraTimer.prototype.setRemainingSeconds = function(seconds) {
        const roundedSeconds = Math.max(0, Math.ceil(seconds));
        if (this._remainingSeconds !== roundedSeconds) {
            this._remainingSeconds = roundedSeconds;
            this.refresh();
        }
    };

    Window_AlgebraTimer.prototype.refresh = function() {
        this.contents.clear();
        const rate = this._remainingSeconds / QUESTION_TIME_LIMIT_SECONDS;
        const labelWidth = 120;
        const barX = labelWidth + 16;
        const barY = Math.floor(this.innerHeight / 2) - 7;
        const barWidth = this.innerWidth - barX;
        const barColor = rate <= 0.25 ? ColorManager.crisisColor() : ColorManager.normalColor();
        this.changeTextColor(rate <= 0.25 ? ColorManager.crisisColor() : ColorManager.systemColor());
        this.drawText(`Time: ${this._remainingSeconds}s`, 0, 0, labelWidth, "left");
        this.contents.fillRect(barX, barY, barWidth, 14, ColorManager.gaugeBackColor());
        this.contents.fillRect(barX, barY, Math.floor(barWidth * rate), 14, barColor);
        this.resetTextColor();
    };

    const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createAlgebraQuestionWindows();
    };

    Scene_Battle.prototype.createAlgebraQuestionWindows = function() {
        const margin = 48;
        const width = Math.min(Graphics.boxWidth - margin * 2, 1040);
        const x = Math.floor((Graphics.boxWidth - width) / 2);
        const timerHeight = this.calcWindowHeight(1, false);
        const promptHeight = this.calcWindowHeight(4, false);
        const choiceHeight = this.calcWindowHeight(5, true);
        const y = Math.max(16, Math.floor((Graphics.boxHeight - timerHeight - promptHeight - choiceHeight - 32) / 2));

        this._algebraTimerWindow = new Window_AlgebraTimer(
            new Rectangle(x, y, width, timerHeight)
        );
        this._algebraPromptWindow = new Window_AlgebraQuestionPrompt(
            new Rectangle(x, y + timerHeight + 8, width, promptHeight)
        );
        this._algebraChoiceWindow = new Window_AlgebraChoices(
            new Rectangle(x, y + timerHeight + promptHeight + 24, width, choiceHeight)
        );
        this._algebraChoiceWindow.setHandler("ok", this.onAlgebraAnswerOk.bind(this));
        this.addWindow(this._algebraTimerWindow);
        this.addWindow(this._algebraPromptWindow);
        this.addWindow(this._algebraChoiceWindow);
    };

    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateAlgebraQuestionTimer();
    };

    const _Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return this.isAlgebraQuestionActive() || _Scene_Battle_isAnyInputWindowActive.call(this);
    };

    const _Scene_Battle_updateCancelButton = Scene_Battle.prototype.updateCancelButton;
    Scene_Battle.prototype.updateCancelButton = function() {
        _Scene_Battle_updateCancelButton.call(this);
        if (this._cancelButton && this.isAlgebraQuestionActive()) {
            this._cancelButton.visible = false;
        }
    };

    Scene_Battle.prototype.isAlgebraQuestionActive = function() {
        return (
            !!this._algebraChoiceWindow &&
            this._algebraChoiceWindow.active &&
            this._algebraChoiceWindow.visible &&
            this._algebraChoiceWindow.isOpen()
        );
    };

    const _Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
    Scene_Battle.prototype.commandAttack = function() {
        if (!AlgebraBattleQuestions.hasQuestions()) {
            _Scene_Battle_commandAttack.call(this);
            return;
        }
        this.startAlgebraQuestion();
    };

    Scene_Battle.prototype.startAlgebraQuestion = function() {
        this._algebraQuestion = AlgebraBattleQuestions.randomQuestion();
        this._algebraQuestionTimerFrames = QUESTION_TIME_LIMIT_SECONDS * 60;
        this._algebraQuestionTimedOut = false;
        this._partyCommandWindow.deactivate();
        this._partyCommandWindow.close();
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.hide();
        this._statusWindow.hide();
        this._algebraPromptWindow.setQuestion(this._algebraQuestion);
        this._algebraChoiceWindow.setQuestion(this._algebraQuestion);
        this._algebraTimerWindow.setRemainingSeconds(QUESTION_TIME_LIMIT_SECONDS);
        this._algebraTimerWindow.show();
        this._algebraTimerWindow.open();
        this._algebraPromptWindow.show();
        this._algebraPromptWindow.open();
        this._algebraChoiceWindow.show();
        this._algebraChoiceWindow.open();
        this._algebraChoiceWindow.activate();
    };

    Scene_Battle.prototype.updateAlgebraQuestionTimer = function() {
        if (!this._algebraChoiceWindow || !this._algebraChoiceWindow.active) {
            return;
        }
        if (this._algebraQuestionTimedOut) {
            return;
        }
        this._algebraQuestionTimerFrames--;
        const remainingSeconds = this._algebraQuestionTimerFrames / 60;
        this._algebraTimerWindow.setRemainingSeconds(remainingSeconds);
        if (this._algebraQuestionTimerFrames <= 0) {
            this.onAlgebraQuestionTimeout();
        }
    };

    Scene_Battle.prototype.closeAlgebraQuestion = function() {
        this._algebraChoiceWindow.deactivate();
        this._algebraTimerWindow.close();
        this._algebraPromptWindow.close();
        this._algebraChoiceWindow.close();
        this._algebraTimerWindow.hide();
        this._algebraPromptWindow.hide();
        this._algebraChoiceWindow.hide();
    };

    Scene_Battle.prototype.onAlgebraQuestionTimeout = function() {
        this._algebraQuestionTimedOut = true;
        SoundManager.playBuzzer();
        this.closeAlgebraQuestion();
        this.consumeMissedAttack("ran out of time!");
    };

    Scene_Battle.prototype.onAlgebraAnswerOk = function() {
        const selectedIndex = this._algebraChoiceWindow.currentExt();
        const correct = selectedIndex === this._algebraQuestion.answerIndex;
        this.closeAlgebraQuestion();
        if (correct) {
            SoundManager.playOk();
            const action = BattleManager.inputtingAction();
            action.setAttack();
            this.onSelectAction();
        } else {
            SoundManager.playBuzzer();
            this.consumeMissedAttack();
        }
    };

    Scene_Battle.prototype.consumeMissedAttack = function(message) {
        const actor = BattleManager.actor();
        const action = BattleManager.inputtingAction();
        if (actor && action) {
            action.setSkill(AlgebraBattleQuestions.ensureSkipSkill());
            action._algebraMissedAttack = true;
            this._logWindow.push("addText", `${actor.name()} ${message || "loses the chance to attack!"}`);
        }
        this.selectNextCommand();
    };

    const _Game_Action_isAlgebraMissedAttack = Game_Action.prototype.isAlgebraMissedAttack;
    Game_Action.prototype.isAlgebraMissedAttack = function() {
        if (_Game_Action_isAlgebraMissedAttack) {
            return _Game_Action_isAlgebraMissedAttack.call(this);
        }
        return !!this._algebraMissedAttack;
    };

    const _Game_Actor_performAction = Game_Actor.prototype.performAction;
    Game_Actor.prototype.performAction = function(action) {
        if (action.isAlgebraMissedAttack && action.isAlgebraMissedAttack()) {
            return;
        }
        _Game_Actor_performAction.call(this, action);
    };
})();
