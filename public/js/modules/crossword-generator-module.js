(function(angular, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
    'use strict';

    var app = angular.module("cwGeneratorModule", [
        "angularFileUpload"
    ]);


    app.factory("cwGeneratorAPI", function() {
        return {
            gameObject : {
                answers : [],
                questions : [],
                grid : []
            },
            hasChanges : false,
            isCrosswordChanged : function(){
                return this.hasChanges;
            },
            showAnswers : true,
            previewContainer : "cw-generator-preview",
            cwEditable : true,
            setCwEditable : function(value){
                this.cwEditable = value;
            },
            setQuestionsAndAnswers : function(questions, answers){
                this.gameObject.questions = questions;
                this.gameObject.answers = answers;
            },
            getGameObject : function(){
                return this.gameObject
            },
            clearCrossword : function(){
                this.previewContainer.empty()
            },
            drawCrossword : function(grid){
                this.previewContainer.empty().append(CrosswordUtils.toHtml(grid, this.showAnswers));
            },
            generateCrossword: function(questions, answers){
                // Remove row with empty questions
                _.each(questions, function(v, k){
                    if(_.isEmpty(v)){
                        questions.splice(k, 1);
                        answers.splice(k, 1)
                    }
                });

                // Remove row with empty answers
                _.each(answers, function(v, k){
                    if(_.isEmpty(v)){
                        questions.splice(k, 1);
                        answers.splice(k, 1)
                    }
                });

                if(_.size(questions) > 0 && _.size(answers) > 0){

                    // Create crossword object with the questions and clues
                    var cw = new Crossword(answers, questions),
                        tries = 10; // create the crossword grid (try to make it have a 1:1 width to height ratio in 10 tries)

                    // Turn the crossword grid into HTML
                    while(tries >= 0){
                        this.gameObject = cw.getSquareGrid(tries);
                        var grid = this.gameObject.grid;

                        // Report a problem with the questions in the crossword
                        if(grid == null){
                            var badWords = cw.getBadWords();
                            if(badWords){
                                var str = [];
                                for(var i = 0; i < badWords.length; i++){
                                    str.push(badWords[i].word);
                                }
                                return "Oop !! Cannot make crossword with these words : " + str.join(" | ");
                            }

                        }else{
                            // Success --> draw crossword game
                            this.drawCrossword(grid);
                            return "";
                        }
                        tries--;
                    }
                }
            }
        }
    });


    var cwGeneratorController = function($scope, cwGeneratorAPI, FileUploader, SERVER_CONFIG){
            $scope.api = cwGeneratorAPI;
            $scope.rows = [];
            $scope.rowObj = {
                questions : "",
                answers : "",
                onKeyUp : function(e){
                    var code = e.keyCode || e.which;

                    // Enter key pressed
                    if(code == 13) {
                        $scope.addRow(this);
                    }

                    $scope.api.hasChanges = true;

                    //_.pluck($scope.rows, "questions"); _.pluck($scope.rows, "answers")
                }
            };

            // Rows data
            $scope.rows[0] = $scope.rowObj;

            $scope.addRow = function(row){
                var questionsInput = row.questions,
                    answersInput = row.answers,
                    lastRow = $scope.rows[$scope.rows.length - 1];


                // CHECK questions & answers entered & last row data entered !!
                if(!_.isEmpty(questionsInput) && !_.isEmpty(answersInput)
                    && !_.isEmpty(lastRow.questions) && !_.isEmpty(lastRow.answers)){
                    var newRow = angular.copy(row);

                    newRow.questions = "";
                    newRow.answers = "";

                    $scope.rows.push(newRow);
                }

                $scope.api.hasChanges = true;
            };

            $scope.removeRow = function(row, index){
                // Prevent delete if the table have only 1 row
                if($scope.rows.length > 1){
                    $scope.rows.splice(index, 1);
                }

                $scope.api.hasChanges = true;
            };

            $scope.generateCrossword = function(){
                $scope.isUploaded = false;
                if($scope.rows.length > 1){
                    $scope.cwMessage = cwGeneratorAPI.generateCrossword(_.pluck($scope.rows, "questions"), _.pluck($scope.rows, "answers"));
                }else{
                    cwGeneratorAPI.setQuestionsAndAnswers(_.pluck($scope.rows, "questions"), _.pluck($scope.rows, "answers"));
                    cwGeneratorAPI.clearCrossword();
                    $scope.cwMessage = "Crossword must have at least 2 words";
                }

                $scope.api.hasChanges = false;
            };

            $scope.uploader = new FileUploader({
                url:  SERVER_CONFIG.hostUrl() + "/csv/game-data",
                autoUpload : true,
                removeAfterUpload : true,
                filters : [
                    {
                        name: 'isCSV',
                        fn: function(item) {
                            return item.name.split(".").pop() === "csv";
                            //return item.type === "text/csv";
                        }
                    }
                ],
                onWhenAddingFileFailed : function(item, filter, options){
                    if(filter.name == "isCSV"){
                        $scope.cwMessage = "This is not CSV file.";
                    }
                },
                onCompleteItem : function(fileItem, response, status, headers) {
                    $scope.isUploaded = fileItem.isUploaded;
                    cwGeneratorAPI.setQuestionsAndAnswers(
                        response.gameData.questions,
                        response.gameData.answers
                    );
                    $scope.cwMessage = cwGeneratorAPI.generateCrossword(response.gameData.questions, response.gameData.answers);
                    $scope.uploader.isUploading = false;
                },
                onErrorItem : function(fileItem, response, status, headers){
                }
            });
        };

    app.directive("cwGenerator",function(){
        return {
            restrict : "E", // Restrict the directive to only Element
            replace : false, // The directive content will be appended inside
            scope : {},
            controller: cwGeneratorController,
            templateUrl : "js/modules/templates/cw-generator-template.html",
            compile: function(tElem, attrs){
                // Do optional DOM transformation here

                return function(scope, element, attrs) {
                    // Linking function here
                    scope.api.previewContainer = element.find(".cw-generator-preview");
                    scope.api.setQuestionsAndAnswers([],[]);

                    scope.$watch("api.gameObject", function(gameObj){
                        if(gameObj.answers.length > 0){
                            var result = [];
                            _.each(gameObj.answers, function(v, k){
                                var resultObj = {
                                    answers: [],
                                    questions: [],
                                    onKeyUp : scope.rowObj.onKeyUp
                                };

                                resultObj.answers = v;
                                resultObj.questions = gameObj.questions[k];
                                result.push(resultObj)
                            });
                            scope.rows = result;
                            //scope.api.hasChanges = false;
                        }
                    }, true);
                }
            }
        }
    });


    return app
}));


