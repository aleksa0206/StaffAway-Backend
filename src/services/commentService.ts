import * as commentRepository from '../repositories/commentRepository';

export async function getAllComments(companyId: number) {
    return await commentRepository.findAllComments(companyId);
}

export async function getCommentById(commentId: number, companyId: number) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment || comment.companyId !== companyId) {
        return null;
    }

    return comment;
}

export async function createComment(data: {
    leaveRequestId: number;
    authorId: number;
    companyId: number;
    text: string;
}) {
    return await commentRepository.createComment(data);
}

export async function updateComment(
    commentId: number,
    companyId: number,
    data: {
        leaveRequestId?: number;
        authorId?: number;
        text?: string;
    },
) {
    const comment = await commentRepository.findCommentById(commentId);

    if (!comment) {
        throw new Error('Komentar ne postoji');
    }

    if (comment.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom komentaru');
    }

    return await commentRepository.updateComment(commentId, data);
}

export async function deleteComment(commentId: number, companyId: number) {
    const comment = await commentRepository.findCommentById(commentId);

    if (!comment) {
        throw new Error('Komentar ne postoji');
    }

    if (comment.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom komentaru');
    }

    return await commentRepository.removeComment(commentId);
}
