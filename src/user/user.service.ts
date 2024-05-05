import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { getUserInfoVo, getUserUploadNotesVo } from './vo/user.vo';
import { UserNoteLike } from 'src/note/entities/like.entity';
import { Note } from 'src/note/entities/note.entity';
import { UserNoteCollect } from 'src/note/entities/collect.entity';
import { UserFollow } from './entities/follow.entity';
import { UpdateUserInfoDto } from './dto/user.dto';
import { BlackList } from './entities/black.entity';
import { WsService } from 'src/ws/ws.service';
import { SocketEvents } from 'src/constant';
@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(UserNoteLike)
  private readonly userNoteLikeRepository: Repository<UserNoteLike>;
  @InjectRepository(UserFollow)
  private readonly userFollowRepository: Repository<UserFollow>;
  @InjectRepository(BlackList)
  private readonly blackListRepository: Repository<BlackList>;
  @InjectEntityManager()
  private manager: EntityManager;
  @Inject(WsService)
  private readonly wsService: WsService;
  // 获取用户信息
  async getUserInfo(currentUserId: number, selectId: number): Promise<getUserInfoVo> {
    const basicInfo = await this.userRepository.findOneBy({
      id: selectId,
    });
    const followCount = await this.userFollowRepository.count({
      where: {
        fan: {
          id: selectId,
        },
      },
    });
    const isFollow =
      currentUserId === selectId
        ? false
        : await this.userFollowRepository.exists({
            where: {
              fan: {
                id: currentUserId,
              },
              follow: {
                id: selectId,
              },
            },
          });
    const fansCount = await this.userFollowRepository.count({
      where: {
        follow: {
          id: selectId,
        },
      },
    });
    const noteCount = await this.manager.count(Note, {
      where: {
        author: {
          id: selectId,
        },
      },
    });
    return {
      ...basicInfo,
      followCount,
      fansCount,
      noteCount,
      isFollow,
    };
  }
  // 获取用户上传的作品
  async getUserUploadNotes(currentUserid: number, selectUserId: number): Promise<getUserUploadNotesVo[]> {
    // 查找用户上传的作品
    const selectUser = await this.userRepository.findOne({
      where: {
        id: selectUserId,
      },
      relations: ['notes'],
    });
    // 如果用户不存在或者用户没有上传作品
    if (!selectUser || selectUser.notes.length === 0) {
      return [];
    }
    // 查找当前用户点赞的作品
    const currentUserLikesNoteDetails = await this.userNoteLikeRepository.find({
      where: {
        user: {
          id: currentUserid,
        },
      },
      relations: ['note'],
    });
    const currentUserLikesNotes = currentUserLikesNoteDetails.map((like) => like.note.id);
    const result = selectUser.notes.map((note) => ({
      noteId: note.id,
      title: note.title,
      coverUrl: note.coverUrl,
      likeCount: note.likeCount,
      isLike: currentUserLikesNotes.includes(note.id),
      author: {
        id: selectUser.id,
        avatar: selectUser.avatar,
        nickname: selectUser.nickname,
      },
    }));
    return result;
  }
  // 获取用户点赞的作品
  async getUserLikeNotes(currentUserid: number, selectUserId: number): Promise<getUserUploadNotesVo[]> {
    // 查找用户点赞的作品
    const queryBulid = this.manager.createQueryBuilder();
    const selectUserLikeRawRecords: {
      noteId: number;
      title: string;
      coverUrl: string;
      likeCount: number;
      userAvatar: string;
      userNickname: string;
      userId: number;
    }[] = await queryBulid
      .from(UserNoteLike, 'user_note_like')
      .where('user_note_like.user = :id', { id: selectUserId })
      .leftJoin(Note, 'note', 'note.id = user_note_like.note')
      .leftJoin(User, 'user', 'user.id = Note.authorId')
      .select('note.id', 'noteId')
      .addSelect('note.title', 'title')
      .addSelect('note.coverUrl', 'coverUrl')
      .addSelect('note.likeCount', 'likeCount')
      .addSelect('user.avatar', 'userAvatar')
      .addSelect('user.nickname', 'userNickname')
      .addSelect('user.id', 'userId')
      .getRawMany();
    if (!selectUserLikeRawRecords || selectUserLikeRawRecords.length === 0) {
      return [];
    }
    // 查找当前用户点赞的作品
    const currentUserLikesNoteDetails = await this.userNoteLikeRepository.find({
      where: {
        user: {
          id: currentUserid,
        },
      },
      relations: ['note'],
    });
    const currentUserLikeNots = currentUserLikesNoteDetails.map((like) => like.note.id);
    return selectUserLikeRawRecords.map((likeNotes) => {
      return {
        noteId: likeNotes.noteId,
        title: likeNotes.title,
        coverUrl: likeNotes.coverUrl,
        likeCount: likeNotes.likeCount,
        isLike: currentUserLikeNots.includes(likeNotes.noteId),
        author: {
          id: likeNotes.userId,
          avatar: likeNotes.userAvatar,
          nickname: likeNotes.userNickname,
        },
      };
    });
  }
  // 获取用户收藏的作品
  async getUserCollectNotes(currentUserid: number, selectUserId: number): Promise<getUserUploadNotesVo[]> {
    // 查找用户收藏的作品
    const queryBulid = this.manager.createQueryBuilder();
    const selectUserCollectRawRecords: {
      noteId: number;
      title: string;
      coverUrl: string;
      likeCount: number;
      userAvatar: string;
      userNickname: string;
      userId: number;
    }[] = await queryBulid
      .from(UserNoteCollect, 'user_note_collect')
      .where('user_note_collect.user = :id', { id: selectUserId })
      .leftJoin(Note, 'note', 'note.id = user_note_collect.note')
      .leftJoin(User, 'user', 'user.id = Note.authorId')
      .select('note.id', 'noteId')
      .addSelect('note.title', 'title')
      .addSelect('note.coverUrl', 'coverUrl')
      .addSelect('note.likeCount', 'likeCount')
      .addSelect('user.avatar', 'userAvatar')
      .addSelect('user.nickname', 'userNickname')
      .addSelect('user.id', 'userId')
      .getRawMany();
    if (!selectUserCollectRawRecords || selectUserCollectRawRecords.length === 0) {
      return [];
    }
    // 查找当前用户点赞的作品
    const currentUserLikesNoteDetails = await this.userNoteLikeRepository.find({
      where: {
        user: {
          id: currentUserid,
        },
      },
      relations: ['note'],
    });
    const currentUserLikeNots = currentUserLikesNoteDetails.map((like) => like.note.id);
    return selectUserCollectRawRecords.map((likeNotes) => {
      return {
        noteId: likeNotes.noteId,
        title: likeNotes.title,
        coverUrl: likeNotes.coverUrl,
        likeCount: likeNotes.likeCount,
        isLike: currentUserLikeNots.includes(likeNotes.noteId),
        author: {
          id: likeNotes.userId,
          avatar: likeNotes.userAvatar,
          nickname: likeNotes.userNickname,
        },
      };
    });
  }
  // 更新用户信息
  async updateUserInfo(id: number, newInfo: UpdateUserInfoDto) {
    const userOldInfo = await this.userRepository.findOneBy({
      id,
    });
    userOldInfo.avatar = newInfo.avatar;
    userOldInfo.nickname = newInfo.nickname;
    userOldInfo.description = newInfo.description;
    userOldInfo.sex = newInfo.sex;
    await this.userRepository.save(userOldInfo);
    return userOldInfo;
  }
  // 关注用户
  async followUser(fanId: number, followId: number) {
    if (fanId === followId) {
      throw new HttpException('不能关注自己', HttpStatus.BAD_REQUEST);
    }
    const isFollow = await this.userFollowRepository.exists({
      where: {
        follow: {
          id: followId,
        },
        fan: {
          id: fanId,
        },
      },
    });
    if (isFollow) {
      throw new HttpException('请勿重复关注', HttpStatus.BAD_REQUEST);
    }
    await this.userFollowRepository.save({
      fan: {
        id: fanId,
      },
      follow: {
        id: followId,
      },
    });
    this.wsService.sendMessageToUser(followId, SocketEvents.FOLLOW_MESSAGE);
    return true;
  }
  // 取消关注
  async cancelfollowUser(fanId: number, followId: number) {
    const isFollow = await this.userFollowRepository.exists({
      where: {
        follow: {
          id: followId,
        },
        fan: {
          id: fanId,
        },
      },
    });
    if (!isFollow) {
      throw new HttpException('未关注该用户', HttpStatus.BAD_REQUEST);
    }
    await this.userFollowRepository.delete({
      fan: {
        id: fanId,
      },
      follow: {
        id: followId,
      },
    });
    return true;
  }
  // 获取用户关注列表
  async getUserFollowList(userId: number) {
    const followList = await this.userFollowRepository.find({
      where: {
        fan: {
          id: userId,
        },
      },
      relations: ['follow'],
    });
    return followList.map((follow) => {
      return {
        id: follow.follow.id,
        nickname: follow.follow.nickname,
        avatar: follow.follow.avatar,
      };
    });
  }

  // 检测是否被拉黑
  async checkBlack(currentUserId: number, selectUserId: number) {
    const isBlack = await this.blackListRepository.exists({
      where: {
        from_user: {
          id: currentUserId,
        },
        to_user: {
          id: selectUserId,
        },
      },
    });
    const isBlacked = await this.blackListRepository.exists({
      where: {
        from_user: {
          id: selectUserId,
        },
        to_user: {
          id: currentUserId,
        },
      },
    });
    return {
      isBlack,
      isBlacked,
    };
  }

  async blackUser(currentUserId: number, selectUserId: number) {
    if (currentUserId === selectUserId) {
      throw new HttpException('不能拉黑自己', HttpStatus.BAD_REQUEST);
    }
    const isBlack = await this.blackListRepository.exists({
      where: {
        from_user: {
          id: currentUserId,
        },
        to_user: {
          id: selectUserId,
        },
      },
    });
    if (isBlack) {
      throw new HttpException('请勿重复拉黑', HttpStatus.BAD_REQUEST);
    }
    await this.blackListRepository.save({
      from_user: {
        id: currentUserId,
      },
      to_user: {
        id: selectUserId,
      },
    });
    return true;
  }

  async cancelBlackUser(currentUserId: number, selectUserId: number) {
    const isBlack = await this.blackListRepository.exists({
      where: {
        from_user: {
          id: currentUserId,
        },
        to_user: {
          id: selectUserId,
        },
      },
    });
    if (!isBlack) {
      throw new HttpException('未拉黑该用户', HttpStatus.BAD_REQUEST);
    }
    await this.blackListRepository.delete({
      from_user: {
        id: currentUserId,
      },
      to_user: {
        id: selectUserId,
      },
    });
    return true;
  }

  async getReceivedFollowRecords(userId: number) {
    const unreadRecords = await this.userFollowRepository.find({
      where: {
        follow: {
          id: userId,
        },
        isRead: false,
      },
      relations: ['fan'],
    });
    const readRecords = await this.userFollowRepository.find({
      where: {
        follow: {
          id: userId,
        },
        isRead: true,
      },
      relations: ['fan'],
      take: 40,
    });
    if ((!unreadRecords || unreadRecords.length === 0) && (!readRecords || readRecords.length === 0)) {
      return [];
    }
    const userFollower = await this.userFollowRepository.find({
      where: {
        fan: {
          id: userId,
        },
      },
      relations: ['follow'],
    });
    unreadRecords.forEach((record) => {
      record.isRead = true;
    });
    await this.userFollowRepository.save(unreadRecords);
    return unreadRecords
      .concat(readRecords)
      .map((record) => {
        const isFollow = userFollower.some((follower) => follower.follow.id === record.fan.id);
        return {
          fan: {
            id: record.fan.id,
            nickname: record.fan.nickname,
            avatar: record.fan.avatar,
          },
          isFollow,
          createTime: record.createTime,
        };
      })
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }
}
