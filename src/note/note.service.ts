import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { SecretKey, AccessKey, BucketName, uploadTokenExpires, pageSize, SocketEvents } from 'src/constant';
import * as qiniu from 'qiniu';
import { Note } from './entities/note.entity';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { addNoteDto, updateNoteDto } from './dto/note.dto';
import { User } from 'src/user/entities/user.entity';
import { NoteSections } from './entities/secetions.entity';
import { NoteTags } from './entities/tags.entity';
import { getAllNoteVo, getNoteDetailVo } from './vo/note.vo';
import { MyRequest } from 'src/types';
import { UserNoteLike } from './entities/like.entity';
import { UserNoteCollect } from './entities/collect.entity';
import { UserFollow } from 'src/user/entities/follow.entity';
import { NoteComment } from 'src/comment/entities/comment.entity';
import { WsService } from 'src/ws/ws.service';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class NoteService {
  @InjectRepository(Note)
  private readonly noteRepository: Repository<Note>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(NoteSections)
  private readonly noteSectionsRepository: Repository<NoteSections>;
  @InjectRepository(NoteTags)
  private readonly noteTagsRepository: Repository<NoteTags>;
  @InjectRepository(UserNoteLike)
  private readonly userNoteLikeRepository: Repository<UserNoteLike>;
  @InjectRepository(UserNoteCollect)
  private readonly userNoteCollectRepository: Repository<UserNoteCollect>;
  @InjectRepository(UserFollow)
  private readonly userFollowRepository: Repository<UserFollow>;
  @InjectRepository(NoteComment)
  private readonly noteCommentRepository: Repository<NoteComment>;
  @Inject(WsService)
  private readonly wsService: WsService;
  @Inject(forwardRef(() => SearchService))
  private readonly searchService: SearchService;

  getUploadToken() {
    const mac = new qiniu.auth.digest.Mac(AccessKey, SecretKey);
    const options: qiniu.rs.PutPolicyOptions = {
      scope: BucketName,
      expires: uploadTokenExpires,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const token = putPolicy.uploadToken(mac);
    const generateTime = new Date().getTime();
    return {
      token,
      expiresTime: generateTime + uploadTokenExpires,
    };
  }
  async addNoteByAuthorId(authorId: number, note: addNoteDto) {
    const newNote = new Note();
    const author = await this.userRepository.findOneBy({
      id: authorId,
    });
    const section = await this.noteSectionsRepository.findOneBy({
      id: note.section,
    });
    newNote.author = author;
    newNote.title = note.title;
    newNote.content = note.content;
    newNote.coverUrl = note.coverUrl;
    newNote.urls = note.urls;
    newNote.tags = note.tags;
    newNote.section = section;
    newNote.type = note.type;
    console.log(section);
    const result = await this.noteRepository.save(newNote);
    await this.searchService.insert([
      {
        id: result.id,
        title: result.title,
        content: result.content,
        section: section.label,
        tags: result.tags,
        authorNickname: author.nickname,
      },
    ]);
    return result;
  }

  async deleteNoteById(userId: number, noteId: number) {
    const note = await this.noteRepository.findOne({
      where: {
        id: noteId,
      },
      relations: ['author'],
    });
    if (note.author.id !== userId) {
      throw new HttpException('无法删除别人的文章', 403);
    }
    await this.noteRepository.delete(noteId);
    await this.searchService.delete(noteId);
    return {
      message: '删除成功',
    };
  }

  async updateNoteByAuthorId(authorId: number, note: updateNoteDto) {
    const oldNote = await this.noteRepository.findOne({
      where: {
        id: note.id,
      },
      relations: ['author'],
    });
    if (oldNote.author.id !== authorId) {
      throw new HttpException('无法修改别人的文章', 403);
    }
    const section = await this.noteSectionsRepository.findOneBy({
      id: note.section,
    });
    oldNote.title = note.title;
    oldNote.content = note.content;
    oldNote.coverUrl = note.coverUrl;
    oldNote.urls = note.urls;
    oldNote.tags = note.tags;
    oldNote.section = section;
    oldNote.type = note.type;
    const result = this.noteRepository.save(oldNote);
    await this.searchService.update({
      id: note.id,
      title: note.title,
      content: note.content,
      section: section.label,
      tags: note.tags,
      authorNickname: oldNote.author.nickname,
    });
    return result;
  }

  async getAllNoteTags() {
    return this.noteTagsRepository.find();
  }
  async getAllNoteSections() {
    return this.noteSectionsRepository.find();
  }

  async getAllNoteList(
    startNum: number = 0,
    section: number = -1,
    userId: MyRequest['user']['id'] | undefined,
  ): Promise<getAllNoteVo[]> {
    // TODO 如果以后使用redis缓存点赞信息，这里需要进行修改
    // 默认拿到前20条数据
    const skip = startNum * pageSize;
    // const where = section <= 0 ? {} : { sectionId: section };
    const where = section <= 0 ? {} : { section: { id: section } };
    const noteRes = await this.noteRepository.find({
      skip,
      take: pageSize,
      relations: ['author'],
      where,
    });
    // 如果用户登录了，查询用户点赞的笔记
    let userLikeNotesId = [];
    // 其实这里可以优化！以后再说吧，能用就行
    if (userId) {
      const notesDetails = await this.userNoteLikeRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
        relations: ['note'],
      });
      userLikeNotesId = notesDetails.map((item) => item.note.id);
    }
    return noteRes.map((note) => {
      return {
        noteId: note.id,
        title: note.title,
        coverUrl: note.coverUrl,
        likeCount: note.likeCount,
        isLike: userLikeNotesId?.includes(note.id) || false,
        author: {
          id: note.author.id,
          avatar: note.author.avatar,
          nickname: note.author.nickname,
        },
      };
    });
  }

  // 点赞
  async likeNoteByUserId(userId: number, noteId: number) {
    // TODO 未来可能会使用redis缓存点赞信息，这里需要进行修改
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const note = await this.noteRepository.findOne({
      where: {
        id: noteId,
      },
      relations: ['author'],
    });
    const newLike = new UserNoteLike();
    newLike.user = user;
    newLike.note = note;
    newLike.receiver = note.author;
    if (userId === note.author.id) {
      newLike.isRead = true;
    }
    await this.userNoteLikeRepository.save(newLike);
    note.likeCount++;
    await this.noteRepository.save(note);
    if (userId !== note.author.id) this.wsService.sendMessageToUser(note.author.id, SocketEvents.LIKE_MESSAGE);
    return {
      likeCount: note.likeCount,
    };
  }
  // 取消点赞
  async unlikeNoteByUserId(userId: number, noteId: number) {
    // TODO 未来可能会使用redis缓存点赞信息，这里需要进行修改
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const note = await this.noteRepository.findOneBy({
      id: noteId,
    });
    const newLike = new UserNoteLike();
    newLike.user = user;
    newLike.note = note;
    await this.userNoteLikeRepository.delete(newLike);
    note.likeCount--;
    await this.noteRepository.save(note);
    return {
      likeCount: note.likeCount,
    };
  }

  // 收藏
  async collectNote(userId: number, noteId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const note = await this.noteRepository.findOne({
      where: {
        id: noteId,
      },
      relations: ['author'],
    });
    const newCollect = new UserNoteCollect();
    newCollect.user = user;
    newCollect.note = note;
    newCollect.receiver = note.author;
    if (userId === note.author.id) {
      newCollect.isRead = true;
    }
    await this.userNoteCollectRepository.save(newCollect);
    note.collectionCount++;
    await this.noteRepository.save(note);
    if (userId !== note.author.id) this.wsService.sendMessageToUser(note.author.id, SocketEvents.COLLECT_MESSAGE);
    return {
      collectionCount: note.collectionCount,
    };
  }
  // 取消收藏
  async uncollectNote(userId: number, noteId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    const note = await this.noteRepository.findOneBy({
      id: noteId,
    });
    const newCollect = new UserNoteCollect();
    newCollect.user = user;
    newCollect.note = note;
    await this.userNoteCollectRepository.delete(newCollect);
    note.collectionCount--;
    await this.noteRepository.save(note);
    return {
      collectionCount: note.collectionCount,
    };
  }

  // 获取文章详情
  async getNoteDetail(currentUserId: number, noteId: number): Promise<getNoteDetailVo> {
    const noteDetails = await this.noteRepository.findOne({
      where: {
        id: noteId,
      },
      relations: ['author'],
    });
    const noteAuthor = noteDetails.author;
    const isFollow = await this.userFollowRepository.exists({
      where: {
        follow: {
          id: noteAuthor.id,
        },
        fan: {
          id: currentUserId,
        },
      },
    });
    const isLike = await this.userNoteLikeRepository.exists({
      where: {
        user: {
          id: currentUserId,
        },
        note: {
          id: noteId,
        },
      },
    });
    const isCollect = await this.userNoteCollectRepository.exists({
      where: {
        user: {
          id: currentUserId,
        },
        note: {
          id: noteId,
        },
      },
    });
    const commentCount = await this.noteCommentRepository.count({
      where: {
        note: {
          id: noteId,
        },
      },
    });
    return {
      id: noteDetails.id,
      urls: noteDetails.urls,
      title: noteDetails.title,
      content: noteDetails.content,
      tagList: noteDetails.tags,
      type: noteDetails.type,
      coverUrl: noteDetails.coverUrl,
      author: {
        id: noteAuthor.id,
        avatar: noteAuthor.avatar,
        nickName: noteAuthor.nickname,
        isFollow,
      },
      createTime: noteDetails.createTime,
      // TODO 使用redis后这里要修改
      likeCount: noteDetails.likeCount,
      isLike,
      collectCount: noteDetails.collectionCount,
      isCollect,
      commentCount,
    };
  }

  async getNoteSection(noteId: number) {
    const note = await this.noteRepository.findOne({
      where: {
        id: noteId,
      },
      relations: ['section'],
    });
    return note.section;
  }

  // 获取用户被点赞的消息
  async getReceivedLikeRecords(userId: number) {
    const unreadLikesRecord = await this.userNoteLikeRepository.find({
      where: {
        user: {
          id: Not(userId),
        },
        receiver: {
          id: userId,
        },
        isRead: false,
      },
      relations: ['note', 'user'],
    });
    const readLikesRecord = await this.userNoteLikeRepository.find({
      where: {
        user: {
          id: Not(userId),
        },
        receiver: {
          id: userId,
        },
        isRead: true,
      },
      relations: ['note', 'user'],
      take: 20,
    });
    const result = unreadLikesRecord
      .concat(readLikesRecord)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    unreadLikesRecord.forEach((item) => {
      item.isRead = true;
    });
    await this.userNoteLikeRepository.save(unreadLikesRecord);
    return result.map((item) => {
      return {
        type: 'like',
        id: item.id,
        note: {
          id: item.note.id,
          cover: item.note.coverUrl,
        },
        user: {
          id: item.user.id,
          nickname: item.user.nickname,
          avatar: item.user.avatar,
        },
        createTime: item.createTime,
      };
    });
  }

  // 获取用户被收藏的消息
  async getReceivedCollectRecords(userId: number) {
    const unreadCollectRecord = await this.userNoteCollectRepository.find({
      where: {
        receiver: {
          id: userId,
        },
        isRead: false,
      },
      relations: ['note', 'user'],
    });
    const readCollectRecord = await this.userNoteCollectRepository.find({
      where: {
        receiver: {
          id: userId,
        },
        isRead: true,
      },
      relations: ['note', 'user'],
      take: 20,
    });
    const result = unreadCollectRecord
      .concat(readCollectRecord)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    unreadCollectRecord.forEach((item) => {
      item.isRead = true;
    });
    await this.userNoteCollectRepository.save(unreadCollectRecord);
    return result.map((item) => {
      return {
        type: 'collect',
        id: item.id,
        note: {
          id: item.note.id,
          cover: item.note.coverUrl,
        },
        user: {
          id: item.user.id,
          nickname: item.user.nickname,
          avatar: item.user.avatar,
        },
        createTime: item.createTime,
      };
    });
  }

  async _getNoteListByIds(ids: number[], userId: number) {
    const noteRes = await this.noteRepository.find({
      take: pageSize,
      relations: ['author'],
      where: {
        id: In(ids),
      },
    });
    // 如果用户登录了，查询用户点赞的笔记
    let userLikeNotesId = [];
    // 其实这里可以优化！以后再说吧，能用就行
    if (userId) {
      const notesDetails = await this.userNoteLikeRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
        relations: ['note'],
      });
      userLikeNotesId = notesDetails.map((item) => item.note.id);
    }
    return noteRes.map((note) => {
      return {
        noteId: note.id,
        title: note.title,
        coverUrl: note.coverUrl,
        likeCount: note.likeCount,
        isLike: userLikeNotesId?.includes(note.id) || false,
        author: {
          id: note.author.id,
          avatar: note.author.avatar,
          nickname: note.author.nickname,
        },
      };
    });
  }
}
