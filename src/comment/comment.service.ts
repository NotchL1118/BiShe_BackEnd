import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteComment } from './entities/comment.entity';
import { IsNull, Not, TreeRepository } from 'typeorm';
import { createCommentDto } from './dto/comment.dto';
import { User } from 'src/user/entities/user.entity';
import { Note } from 'src/note/entities/note.entity';
import { WsService } from 'src/ws/ws.service';
import { SocketEvents } from 'src/constant';

@Injectable()
export class CommentService {
  @InjectRepository(NoteComment)
  private readonly commentRepository: TreeRepository<NoteComment>;

  @InjectRepository(User)
  private readonly userRepository: TreeRepository<User>;

  @InjectRepository(Note)
  private readonly noteRepository: TreeRepository<Note>;

  @Inject(WsService)
  private readonly wsService: WsService;

  formateComment(comments: NoteComment[]) {
    return comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        createTime: comment.createTime,
        author: {
          id: comment.author.id,
          nickname: comment.author.nickname,
          avatar: comment.author.avatar,
        },
        receiver: {
          id: comment.receiver.id,
          nickname: comment.receiver.nickname,
          avatar: comment.receiver.avatar,
        },
        repleyTo: comment?.repleyTo?.id ?? null,
        children: comment.children?.length ? this.formateComment(comment.children) : [],
      };
    });
  }

  async getNoteComments(noteId: number) {
    const parentComments = await this.commentRepository.find({
      where: {
        note: {
          id: noteId,
        },
        parent: IsNull(),
      },
      relations: ['author', 'receiver', 'repleyTo'],
    });
    const promises = parentComments.map(async (comment) => {
      return await this.commentRepository.findDescendantsTree(comment, {
        relations: ['author', 'receiver', 'repleyTo'],
      });
    });
    const noteComments = await Promise.all(promises);
    return {
      commentCount: noteComments.length,
      comments: this.formateComment(noteComments),
    };
  }

  async createNoteComments(currentUserId: number, dtoInfo: createCommentDto) {
    const { noteId, receiverId, content, parentCommentId, repleyTo } = dtoInfo;
    const parent = parentCommentId ? await this.commentRepository.findOneBy({ id: parentCommentId }) : null;
    const author = {
      id: currentUserId,
    };
    const receiver = {
      id: receiverId,
    };
    const note = { id: noteId };
    const repleyToComment = repleyTo
      ? await this.commentRepository.findOneBy({
          id: repleyTo,
        })
      : null;
    const newComment = this.commentRepository.create({
      content,
      author,
      receiver,
      note,
      parent,
      repleyTo: repleyToComment,
    });
    if (currentUserId === receiverId) {
      newComment.isRead = true;
    }
    const result = await this.commentRepository.save(newComment);
    const sendResult = await this.commentRepository.findOne({
      where: { id: result.id },
      relations: ['author', 'receiver', 'children'],
    });
    if (currentUserId !== receiverId) this.wsService.sendMessageToUser(receiverId, SocketEvents.COMMENT_MESSAGE);
    return sendResult;
  }

  async deleteNoteComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });
    await this.commentRepository.remove(comment);
    return 'success';
  }

  async getUnreadComments(userId: number) {
    const unreadComments = await this.commentRepository.find({
      where: {
        author: {
          id: Not(userId),
        },
        receiver: {
          id: userId,
        },
        isRead: false,
      },
      relations: ['author', 'note', 'repleyTo'],
    });
    const result = unreadComments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        isRead: comment.isRead,
        author: {
          id: comment.author.id,
          nickname: comment.author.nickname,
          avatar: comment.author.avatar,
        },
        note: {
          id: comment.note.id,
          title: comment.note.title,
          cover: comment.note.coverUrl,
        },
        repleyTo: {
          id: comment.repleyTo?.id,
          content: comment.repleyTo?.content ?? '',
        },
        createTime: comment.createTime,
      };
    });
    // 获取未读评论的时候，将未读评论标记为已读
    unreadComments.forEach((comment) => {
      comment.isRead = true;
    });
    await this.commentRepository.save(unreadComments);
    return result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }

  async getReadComments(userId: number) {
    // 获取已读评论并去除发送者是自己的评论
    const readComments = await this.commentRepository.find({
      where: {
        author: {
          id: Not(userId),
        },
        receiver: {
          id: userId,
        },
        isRead: true,
      },
      relations: ['author', 'note', 'repleyTo'],
    });
    const result = readComments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        isRead: comment.isRead,
        author: {
          id: comment.author.id,
          nickname: comment.author.nickname,
          avatar: comment.author.avatar,
        },
        note: {
          id: comment.note.id,
          title: comment.note.title,
          cover: comment.note.coverUrl,
        },
        repleyTo: {
          id: comment.repleyTo?.id,
          content: comment.repleyTo?.content ?? '',
        },
        createTime: comment.createTime,
      };
    });
    return result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }
}
