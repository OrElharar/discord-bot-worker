"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectAreQuizzesAccessible = exports.getSelectAreQuestionCommentsAccessible = exports.getSelectAreQuestionsAccessible = void 0;
function getSelectAreQuestionsAccessible() {
    return `select count(*) = array_length($1::uuid[], 1) as "IsAccessAllowed" 
            from questions 
            where id = any($1::uuid[]) and created_by = $2 ;`;
}
exports.getSelectAreQuestionsAccessible = getSelectAreQuestionsAccessible;
function getSelectAreQuestionCommentsAccessible() {
    return `with combined_comments as (
                select id, created_by from answers 
                    union all 
                select id, created_by from question_comments 
                    union all 
                select id, created_by from answer_comments )
            select count(*) = array_length($1::uuid[], 1) as "IsAccessAllowed" 
            from combined_comments 
            where id = any($1::uuid[]) and created_by = $2 ;`;
}
exports.getSelectAreQuestionCommentsAccessible = getSelectAreQuestionCommentsAccessible;
function getSelectAreQuizzesAccessible() {
    return `select count(*) = array_length($1::uuid[], 1) as "IsAccessAllowed" 
            from quizzes 
            where id = any($1::uuid[]) and created_by = $2 ;`;
}
exports.getSelectAreQuizzesAccessible = getSelectAreQuizzesAccessible;
//# sourceMappingURL=questionsManagement.js.map