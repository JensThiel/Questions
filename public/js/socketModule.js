"use strict";

const socketModule = (function () {

    const socket = io('http://172.21.22.52.xip.io:3000/questions-live');


    //TODO remove socket.on('connection_confirmation')
    socket
        .on('connection_confirmation', function (msg) {
            console.log(msg);
        })
        .on("error_occurred", function (error) {
            gInterface.showError(error);
        })
        .on("new_thread_available", function (data) {
            if (!tag){
                gInterface.addThread(data.threadHTML);
            } else if (data.tags.includes(tag)){
                new Notification("New " + tag + " question");
                gInterface.addThread(data.threadHTML);
            }
        })
        .on("new_answer_available", function (data) {
            gInterface.addAnswerForThread(data.forThread, data.answerHTML, data.amountAnswersOnThread);
        })
        .on("new_comment_available", function (data) {
            gInterface.addCommentToAnswer(data.forAnswer, data.commentHTML, data.amountComments,data.user);
        })
        .on("threads", function (threadsHTML) {
            gInterface.clearThreads();
            threadsHTML.forEach(threadHTML => {
                gInterface.addThread(threadHTML);
            })
        })
        .on("thread_voted", function (data) {
            gInterface.updateThreadVotes(data.threadId, data.votes);
        })
        .on("answer_voted", function (data) {
            gInterface.updateAnswerVotes(data.answerId, data.votes);
        })
        .on("deleted_thread", function (threadId) {
            gInterface.removeThread(threadId);
        })
        .on("deleted_answer", function (data) {
            gInterface.removeAnswer(data.answerId, data.threadId);
        })
        .on("answer_approved_changed", function (data) {
            gInterface.setAnswerApproved(data.answerId, data.threadId, data.isSolved);
        })
        .on("tag_added_to_thread", function (data) {
            if($(data.newTagHTML).text() === tag){
                gInterface.addThread(data.threadHTML);
            } else {
                gInterface.addTagToThread(data.threadId, data.newTagHTML);
            }
        });

    return {
        sendQuestion: function (title, question, images, choices) {
            socket.emit("new_question", {title, question, images, choices});
        },
        sendAnswer: function (threadId, answer,images) {
            socket.emit("new_answer", {threadId, answer, images});
        },
        sendComment: function (threadId, answerId, comment) {
            socket.emit("new_comment", {threadId, answerId, comment});
        },
        findThreadsWithTag: function (tag) {
            socket.emit("find_threads", tag);
        },
        isConnected: function () {
            return socket.connected;
        },
        upVoteThread: function (threadId) {
            socket.emit("up_vote_thread", threadId);
        },
        downVoteThread: function (threadId) {
            socket.emit("down_vote_thread", threadId);
        },
        deleteThread: function (threadId) {
            socket.emit("delete_thread", threadId);
        },
        deleteAnswer: function (answerId, threadId) {
            socket.emit("delete_answer_on_thread", {answerId, threadId});
        },
        toggleAnswerApproved: function (answerId) {
            socket.emit("toggle_answer_approved", answerId);
        },
        addTag: function (threadId, tag) {
            socket.emit("add_tag_to_thread", {threadId, tag});
        },
        upVoteAnswer: function (answerId) {
            socket.emit("up_vote_answer", answerId);
        },
        downVoteAnswer: function (answerId) {
            socket.emit("down_vote_answer", answerId);
        }
    }
})();
