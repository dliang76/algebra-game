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
        this.drawWrappedText(this._question.question, 0, this.lineHeight() + 8, this.innerWidth);
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
            this.addCommand(choice, `answer${index}`, true, index);
        });
    };

    Window_AlgebraChoices.prototype.itemHeight = function() {
        return Math.max(44, Window_Command.prototype.itemHeight.call(this));
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
        const promptHeight = this.calcWindowHeight(4, false);
        const choiceHeight = this.calcWindowHeight(5, true);
        const y = Math.max(16, Math.floor((Graphics.boxHeight - promptHeight - choiceHeight - 16) / 2));

        this._algebraPromptWindow = new Window_AlgebraQuestionPrompt(
            new Rectangle(x, y, width, promptHeight)
        );
        this._algebraChoiceWindow = new Window_AlgebraChoices(
            new Rectangle(x, y + promptHeight + 16, width, choiceHeight)
        );
        this._algebraChoiceWindow.setHandler("ok", this.onAlgebraAnswerOk.bind(this));
        this._algebraChoiceWindow.setHandler("cancel", this.onAlgebraAnswerCancel.bind(this));
        this.addWindow(this._algebraPromptWindow);
        this.addWindow(this._algebraChoiceWindow);
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
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.hide();
        this._statusWindow.hide();
        this._algebraPromptWindow.setQuestion(this._algebraQuestion);
        this._algebraChoiceWindow.setQuestion(this._algebraQuestion);
        this._algebraPromptWindow.show();
        this._algebraPromptWindow.open();
        this._algebraChoiceWindow.show();
        this._algebraChoiceWindow.open();
        this._algebraChoiceWindow.activate();
    };

    Scene_Battle.prototype.closeAlgebraQuestion = function() {
        this._algebraChoiceWindow.deactivate();
        this._algebraPromptWindow.close();
        this._algebraChoiceWindow.close();
        this._algebraPromptWindow.hide();
        this._algebraChoiceWindow.hide();
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

    Scene_Battle.prototype.onAlgebraAnswerCancel = function() {
        this.closeAlgebraQuestion();
        this._statusWindow.show();
        this._actorCommandWindow.show();
        this._actorCommandWindow.activate();
    };

    Scene_Battle.prototype.consumeMissedAttack = function() {
        const actor = BattleManager.actor();
        const action = BattleManager.inputtingAction();
        if (actor && action) {
            action.setSkill(AlgebraBattleQuestions.ensureSkipSkill());
            action._algebraMissedAttack = true;
            this._logWindow.push("addText", `${actor.name()} loses the chance to attack!`);
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
