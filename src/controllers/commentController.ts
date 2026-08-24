import type { Request, Response } from 'express';
import * as commentService from '../services/commentService';

export async function getAllCommentsHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const comments = await commentService.getAllComments(companyId);
        res.json(comments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getCommentByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const commentId = Number(req.params.commentId);
        const comment = await commentService.getCommentById(
            commentId,
            companyId,
        );
        res.json(comment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createCommentHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const authorId = req.user.userId;
        const { leaveRequestId, text } = req.body;
        const comment = await commentService.createComment({
            leaveRequestId,
            authorId,
            companyId,
            text,
        });
        res.status(201).json(comment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateCommentHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const commentId = Number(req.params.commentId);
        const { text } = req.body;
        const comment = await commentService.updateComment(
            commentId,
            companyId,
            { text },
        );
        res.json(comment);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteCommentHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const commentId = Number(req.params.commentId);
        const comment = await commentService.deleteComment(
            commentId,
            companyId,
        );
        res.json(comment);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
