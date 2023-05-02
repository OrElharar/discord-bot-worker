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
exports.QuizzesService = void 0;
const uuid = __importStar(require("uuid"));
const CustomError_1 = require("../models/CustomError");
const Validations_1 = require("../helpers/Validations");
const ApiResponse_1 = require("../models/ApiResponse");
class QuizzesService {
    constructor(authorizationService, quizzesRepository) {
        this.quizzesRepository = quizzesRepository;
        this.authorizationService = authorizationService;
    }
    static validateQuizFields(data) {
        if (data.passingPercentageGradeInDec != null) {
            if (!(data.passingPercentageGradeInDec >= 0 && data.passingPercentageGradeInDec <= 1))
                throw new CustomError_1.CustomError("passingPercentageGradeInDec must be number equal ot greater then 0 and equal or less then 1");
        }
        if (data.categories != null) {
            if (!Array.isArray(data.categories))
                throw new CustomError_1.CustomError("Invalid value for categories");
        }
    }
    static clearSecretsFromQuiz(quiz) {
        delete quiz.questionsResponsesHistoryEnabled;
        delete quiz.questionsFeedbackEnabled;
        delete quiz.shuffleQuestionsEnabled;
        if (quiz.categories == null)
            return;
        for (let i = 0; i < quiz.categories.length; i++) {
            const category = quiz.categories[i];
            for (let j = 0; j < category.questions.length; j++) {
                const question = category.questions[j];
                for (let k = 0; k < question.answers.length; k++) {
                    const answer = question.answers[k];
                    delete answer.description;
                    delete answer.isCorrect;
                }
            }
        }
    }
    async addQuiz(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["name", "passingPercentageGradeInDec", "timeToCompleteInSec",
                "allowedAttemptNumber", "shuffleQuestionsEnabled", "questionsResponsesHistoryEnabled", "questionsFeedbackEnabled", "createdBy"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            QuizzesService.validateQuizFields(data);
            for (let i = 0; i < data.categories.length; i++) {
                const category = data.categories[i];
                const { result, message } = Validations_1.Validations.areFieldsProvided(["name", "description", "questions"], category);
                if (!result)
                    return { err: new CustomError_1.CustomError(`${message} in category: ${category.name}`) };
                category.id = QuizzesService.idGenerator();
                if (!Array.isArray(category.questions))
                    return { err: new CustomError_1.CustomError("Invalid value for category.questions") };
                for (let j = 0; j < category.questions.length; j++) {
                    const question = category.questions[j];
                    const { result, message } = Validations_1.Validations.areFieldsProvided(["name", "typeId"], question);
                    if (!result)
                        return { err: new CustomError_1.CustomError(`${message} in question: ${question.name}, which is in category: ${category.name}`) };
                    question.id = QuizzesService.idGenerator();
                    for (let k = 0; k < question.answers.length; k++) {
                        const answer = question.answers[k];
                        const { result, message } = Validations_1.Validations.areFieldsProvided(["content", "isCorrect"], answer);
                        if (!result)
                            return { err: new CustomError_1.CustomError(`${message} in answer: ${answer.content}, which is  in category: ${category.name}.`) };
                        answer.id = QuizzesService.idGenerator();
                        if (answer.description == null)
                            continue;
                        if (answer.description.correctMessage == null || answer.description.inCorrectMessage == null)
                            return { err: new CustomError_1.CustomError(`${message} in the description of answer: ${answer.content}, which is  in category: ${category.name}.`) };
                    }
                }
            }
            data.id = QuizzesService.idGenerator();
            const quiz = await this.quizzesRepository.insertOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, { quiz }) };
        }
        catch (err) {
            if (err.constraint === "quizzes_name_key")
                return { err: new CustomError_1.CustomError("There is already a quiz with this name registered in the system.") };
            return { err };
        }
    }
    async editQuiz(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["id"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            QuizzesService.validateQuizFields(data);
            await this.authorizationService.verifyAccessToQuizzes([data.id], data.userId);
            const quiz = await this.quizzesRepository.editOne(data);
            return { response: new ApiResponse_1.ApiResponse(true, { quiz }) };
        }
        catch (err) {
            if (err.constraint === "quizzes_name_key")
                return { err: new CustomError_1.CustomError("There is already a quiz with this name registered in the system.") };
            return { err };
        }
    }
    async getQuizzes(data) {
        try {
            const quizzes = await this.quizzesRepository.findMany(data);
            return { response: new ApiResponse_1.ApiResponse(true, { quizzes }) };
        }
        catch (err) {
            if (err.constraint === "quizzes_name_key")
                return { err: new CustomError_1.CustomError("There is already a quiz with this name registered in the system.") };
            return { err };
        }
    }
    async getQuiz(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["id"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            const quiz = await this.quizzesRepository.findOne(data.id);
            if (quiz == null)
                return { err: new CustomError_1.CustomError("Quiz not found.") };
            return { response: new ApiResponse_1.ApiResponse(true, { quiz }) };
        }
        catch (err) {
            return { err };
        }
    }
    async deleteQuizzes(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["ids"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            await this.authorizationService.verifyAccessToQuizzes(data.ids, data.userId);
            const quizzes = await this.quizzesRepository.deleteMany(data);
            if (quizzes.length === 0)
                return { err: new CustomError_1.CustomError("Quizzes not found.") };
            return { response: new ApiResponse_1.ApiResponse(true, { quizzes }) };
        }
        catch (err) {
            if (err.constraint === "quizzes_name_key")
                return { err: new CustomError_1.CustomError("There is already a quiz with this name registered in the system.") };
            return { err };
        }
    }
    async startUserQuiz(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["id", "userId"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            await this.authorizationService.verifyAccessToStartQuiz(data.userId);
            const userQuiz = await this.quizzesRepository.insertUserQuiz(data.id, data.userId);
            QuizzesService.clearSecretsFromQuiz(userQuiz.quiz);
            return { response: new ApiResponse_1.ApiResponse(true, { userQuiz }) };
        }
        catch (err) {
            if (err.constraint === "users_quizzes_user_id_quiz_id_key")
                return { err: new CustomError_1.CustomError("User cannot do the same quiz more then once.") };
            return { err };
        }
    }
    async endUserQuiz(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["id", "trialId", "userId", "questionsAnswers"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            const questionsAnswers = data.questionsAnswers;
            if (!Array.isArray(questionsAnswers))
                return { err: new CustomError_1.CustomError("Invalid value for questionsAnswers") };
            const answerIdsIndex = {};
            for (let i = 0; i < questionsAnswers.length; i++) {
                const questionAnswer = questionsAnswers[i];
                const { result, message } = Validations_1.Validations.areFieldsProvided(["questionId", "answerId"], questionAnswer);
                if (!result)
                    return { err: new CustomError_1.CustomError(message) };
                if (answerIdsIndex[questionAnswer.answerId] != null)
                    return { err: new CustomError_1.CustomError(`Answers must be unique, answer - ${questionAnswer.answerId} sent more then once`) };
                answerIdsIndex[questionAnswer.answerId] = questionAnswer.answerId;
            }
            await this.authorizationService.verifyAccessToEndQuiz(data.userId);
            const userQuiz = await this.quizzesRepository.updateUserQuiz(data.id, data.trialId, questionsAnswers);
            return { response: new ApiResponse_1.ApiResponse(true, { userQuiz }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getOptionalQuizzes(data) {
        try {
            const quizzes = await this.quizzesRepository.findMany(data);
            for (let i = 0; i < quizzes.length; i++)
                QuizzesService.clearSecretsFromQuiz(quizzes[i]);
            return { response: new ApiResponse_1.ApiResponse(true, { quizzes }) };
        }
        catch (err) {
            if (err.constraint === "quizzes_name_key")
                return { err: new CustomError_1.CustomError("There is already a quiz with this name registered in the system.") };
            return { err };
        }
    }
}
exports.QuizzesService = QuizzesService;
QuizzesService.idGenerator = uuid.v1;
//# sourceMappingURL=QuizzesService.js.map