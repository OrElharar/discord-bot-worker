"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesRepository = void 0;
const queries = __importStar(require("../helpers/postgresQueriesHelper/quizzesManagement"));
const EntityRepository_1 = require("./EntityRepository");
const DdCommand_1 = require("../storage/DdCommand");
class QuizzesRepository extends EntityRepository_1.EntityRepository {
    constructor(pgClient) {
        super();
        this.dbClient = pgClient;
    }
    async findMany(_data) {
        const selectQuizzesQuery = queries.getSelectQuizQuery();
        const selectQuizzesValues = [];
        const response = await this.dbClient.callDbCmd(selectQuizzesQuery, selectQuizzesValues);
        return response.rows;
    }
    async findOne(id) {
        const selectQuizFullDataQuery = queries.getSelectQuizFullData();
        const selectQuizFullDataCommand = new DdCommand_1.DdCommand(selectQuizFullDataQuery, [[id]]);
        const response = await this.dbClient.callDb(selectQuizFullDataCommand);
        return response.rows[0];
    }
    async insertOne(data) {
        const sqlCommands = [];
        const insertQuizQuery = queries.getInsertQuizQuery();
        const insertQuizValues = [data.id, data.name, data.passingPercentageGradeInDec, data.allowedAttemptNumber,
            data.timeToCompleteInSec, data.shuffleQuestionsEnabled, data.questionsResponsesHistoryEnabled,
            data.questionsFeedbackEnabled, data.createdBy];
        const insertQuizCommand = new DdCommand_1.DdCommand(insertQuizQuery, insertQuizValues);
        const insertQuizCategoryQuery = queries.getInsertQuizCategoryQuery();
        const insertQuizQuestionCommandsBucket = [];
        const insertQuizQuestionQuery = queries.getInsertQuizQuestionQuery();
        const insertQuizCategoryCommandsBucket = [];
        const insertQuizAnswerQuery = queries.getInsertQuizQuestionAnswerQuery();
        const insertQuizAnswerCommandsBucket = [];
        const insertQuizAnswerDescriptionQuery = queries.getInsertQuizQuestionAnswerDescriptionQuery();
        const insertQuizAnswerDescriptionCommandsBucket = [];
        const selectQuizFullDataQuery = queries.getSelectQuizFullData();
        const selectQuizFullDataCommand = new DdCommand_1.DdCommand(selectQuizFullDataQuery, [[data.id]]);
        const categoriesDataList = data.categories;
        for (let i = 0; i < categoriesDataList.length; i++) {
            const categoryData = categoriesDataList[i];
            insertQuizCategoryCommandsBucket.push(new DdCommand_1.DdCommand(insertQuizCategoryQuery, [categoryData.id, data.id, categoryData.name, categoryData.description]));
            const questionsDataList = categoryData.questions;
            for (let j = 0; j < questionsDataList.length; j++) {
                const questionData = questionsDataList[j];
                insertQuizQuestionCommandsBucket.push(new DdCommand_1.DdCommand(insertQuizQuestionQuery, [questionData.id, questionData.typeId, categoryData.id, questionData.name]));
                const answersList = questionData.answers;
                for (let k = 0; k < answersList.length; k++) {
                    const answerData = answersList[k];
                    insertQuizAnswerCommandsBucket.push(new DdCommand_1.DdCommand(insertQuizAnswerQuery, [answerData.id, questionData.id, answerData.content, answerData.isCorrect]));
                    if (answerData.description == null)
                        continue;
                    insertQuizAnswerDescriptionCommandsBucket.push(new DdCommand_1.DdCommand(insertQuizAnswerDescriptionQuery, [answerData.id, answerData.description.correctMessage, answerData.description.inCorrectMessage]));
                }
            }
        }
        sqlCommands.push(insertQuizCommand, ...insertQuizCategoryCommandsBucket, ...insertQuizQuestionCommandsBucket, ...insertQuizAnswerCommandsBucket, ...insertQuizAnswerDescriptionCommandsBucket, selectQuizFullDataCommand);
        const response = await this.dbClient.callDbTransactionCmd(sqlCommands);
        const transactionLastIndex = sqlCommands.length - 1;
        return response[transactionLastIndex].rows[0];
    }
    async editOne(data) {
        const updateQuizQuery = queries.getUpdateQuizQuery();
        const updateQuizValues = [data.id, data.name, data.passingPercentageGradeInDec, data.allowedAttemptNumber,
            data.timeToCompleteInSec, data.shuffleQuestionsEnabled, data.questionsResponsesHistoryEnabled,
            data.questionsFeedbackEnabled];
        const response = await this.dbClient.callDbCmd(updateQuizQuery, updateQuizValues);
        return response.rows[0];
    }
    async deleteMany(data) {
        const deleteQuizQuery = queries.getDeleteQuizzesQuery();
        const deleteQuizValues = [data.ids];
        const response = await this.dbClient.callDbCmd(deleteQuizQuery, deleteQuizValues);
        return response.rows;
    }
    async insertUserQuiz(id, userId) {
        const sqlCommands = [];
        const insertUserQuizQuery = queries.getInsertUserQuizQuery();
        const insertUserQuizCommand = new DdCommand_1.DdCommand(insertUserQuizQuery, [userId, id]);
        const selectQuizFullDataQuery = queries.getSelectQuizFullData();
        const selectQuizFullDataCommand = new DdCommand_1.DdCommand(selectQuizFullDataQuery, [[id]]);
        sqlCommands.push(insertUserQuizCommand, selectQuizFullDataCommand);
        const response = await this.dbClient.callDbTransactionCmd(sqlCommands);
        const userQuiz = Object.assign(Object.assign({}, response[0].rows[0]), { quiz: response[1].rows[0] });
        return userQuiz;
    }
    async updateUserQuiz(id, trialId, questionsAnswers) {
        const sqlCommands = [];
        const insertUserQuizQuestionsAnswers = queries.getInsertUserQuizQuestionsAnswersQuery();
        const insertUserQuizQuestionsAnswersCommandsBucket = [];
        questionsAnswers.forEach(({ questionId, answerId }) => {
            insertUserQuizQuestionsAnswersCommandsBucket.push(new DdCommand_1.DdCommand(insertUserQuizQuestionsAnswers, [trialId, questionId, answerId]));
        });
        const updateUserQuizQuery = queries.getUpdateUserQuizQuery();
        const updateUserQuizCommand = new DdCommand_1.DdCommand(updateUserQuizQuery, [trialId, true]);
        const selectQuizFullDataQuery = queries.getSelectQuizFullData();
        const selectQuizFullDataCommand = new DdCommand_1.DdCommand(selectQuizFullDataQuery, [[id]]);
        sqlCommands.push(...insertUserQuizQuestionsAnswersCommandsBucket, updateUserQuizCommand, selectQuizFullDataCommand);
        const postAnswerQuestionsIndex = insertUserQuizQuestionsAnswersCommandsBucket.length;
        const response = await this.dbClient.callDbTransactionCmd(sqlCommands);
        const userQuiz = Object.assign(Object.assign({}, response[postAnswerQuestionsIndex].rows[0]), { quiz: response[postAnswerQuestionsIndex + 1].rows[0] });
        return userQuiz;
    }
}
exports.QuizzesRepository = QuizzesRepository;
//# sourceMappingURL=QuizzesRepository.js.map