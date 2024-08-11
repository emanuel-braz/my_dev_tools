import * as vscode from "vscode";
const { exec, spawn } = require("child_process");
const fs = require('fs');
const path = require('path');

let commentId = 1;

export default class CommentDelegate {

    activate(context: vscode.ExtensionContext) {
		// A `CommentController` is able to provide comments for documents.
		const commentController = vscode.comments.createCommentController('comment-mdt', 'Mobile Dev Tools Comment API');
		context.subscriptions.push(commentController);
	
		// A `CommentingRangeProvider` controls where gutter decorations that allow adding comments are shown
		commentController.commentingRangeProvider = {
			provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
				const lineCount = document.lineCount;
				return [new vscode.Range(0, 0, lineCount - 1, 0)];
			}
		};
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.createNote', (reply: vscode.CommentReply) => {
			replyNote(reply);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.replyNote', (reply: vscode.CommentReply) => {
			replyNote(reply);
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.startDraft', (reply: vscode.CommentReply) => {
			const thread = reply.thread;
			thread.contextValue = 'draft';
			const newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: 'Mobile Dev Tools' }, thread);
			newComment.label = 'pending';
			thread.comments = [...thread.comments, newComment];
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.finishDraft', (reply: vscode.CommentReply) => {
			const thread = reply.thread;
	
			if (!thread) {
				return;
			}
	
			thread.contextValue = undefined;
			thread.collapsibleState = vscode.CommentThreadCollapsibleState.Collapsed;
			if (reply.text) {
				const newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: 'Mobile Dev Tools' }, thread);
				thread.comments = [...thread.comments, newComment].map(comment => {
					comment.label = undefined;
					return comment;
				});
			}
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.deleteNoteComment', (comment: NoteComment) => {
			const thread = comment.parent;
			if (!thread) {
				return;
			}
	
			thread.comments = thread.comments.filter(cmt => (cmt as NoteComment).id !== comment.id);
	
			if (thread.comments.length === 0) {
				thread.dispose();
			}
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.deleteNote', (thread: vscode.CommentThread) => {
			thread.dispose();
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.cancelsaveNote', (comment: NoteComment) => {
			if (!comment.parent) {
				return;
			}
	
			comment.parent.comments = comment.parent.comments.map(cmt => {
				if ((cmt as NoteComment).id === comment.id) {
					cmt.body = (cmt as NoteComment).savedBody;
					cmt.mode = vscode.CommentMode.Preview;
				}
	
				return cmt;
			});
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.saveNote', (comment: NoteComment) => {
			if (!comment.parent) {
				return;
			}
	
			comment.parent.comments = comment.parent.comments.map(cmt => {
				if ((cmt as NoteComment).id === comment.id) {
					(cmt as NoteComment).savedBody = cmt.body;
					cmt.mode = vscode.CommentMode.Preview;
				}
	
				return cmt;
			});
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.editNote', (comment: NoteComment) => {
			if (!comment.parent) {
				return;
			}
	
			comment.parent.comments = comment.parent.comments.map(cmt => {
				if ((cmt as NoteComment).id === comment.id) {
					cmt.mode = vscode.CommentMode.Editing;
				}
	
				return cmt;
			});
		}));
	
		context.subscriptions.push(vscode.commands.registerCommand('mdt.dispose', () => {
			commentController.dispose();
		}));
	
		function replyNote(reply: vscode.CommentReply) {
			const thread = reply.thread;
			const newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: 'Mobile Dev Tools' }, thread, thread.comments.length ? 'canDelete' : undefined);
			if (thread.contextValue === 'draft') {
				newComment.label = 'pending';
			}
	
			thread.comments = [...thread.comments, newComment];
		}
	}
	
}

class NoteComment implements vscode.Comment {
	id: number;
	label: string | undefined;
	savedBody: string | vscode.MarkdownString; // for the Cancel button
	constructor(
		public body: string | vscode.MarkdownString,
		public mode: vscode.CommentMode,
		public author: vscode.CommentAuthorInformation,
		public parent?: vscode.CommentThread,
		public contextValue?: string
	) {
		this.id = ++commentId;
		this.savedBody = this.body;
	}
}