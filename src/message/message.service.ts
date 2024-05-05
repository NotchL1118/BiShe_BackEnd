import { Injectable } from '@nestjs/common';
import { ChatMessage } from './entities/chatMessage.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatList } from './entities/chatList.entity';
import { User } from 'src/user/entities/user.entity';
import { NoteComment } from 'src/comment/entities/comment.entity';
import { UserNoteCollect } from 'src/note/entities/collect.entity';
import { UserNoteLike } from 'src/note/entities/like.entity';
import { UserFollow } from 'src/user/entities/follow.entity';

@Injectable()
export class MessageService {
  @InjectRepository(ChatMessage)
  private readonly chatMessageRepository: Repository<ChatMessage>;

  @InjectRepository(ChatList)
  private readonly chatListRepository: Repository<ChatList>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(NoteComment)
  private readonly noteCommentRepository: Repository<NoteComment>;

  @InjectRepository(UserNoteCollect)
  private readonly userNoteCollectRepository: Repository<UserNoteCollect>;

  @InjectRepository(UserNoteLike)
  private readonly userNoteLikeRepository: Repository<UserNoteLike>;

  @InjectRepository(UserFollow)
  private readonly userFollowRepository: Repository<UserFollow>;

  // 获取聊天列表，无论是用户自己发的，还是别人发的
  async getChatList(userId: number) {
    // 用户接收到的消息记录
    const receiveChatList = await this.chatListRepository.find({
      where: {
        to_user: {
          id: userId,
        },
        status: true,
      },
      relations: ['from_user', 'to_user', 'lastMessage'],
    });
    // 按照最后一条消息的时间(也就是updateTime)排序
    const result = receiveChatList
      .map((item) => {
        return {
          id: item.id,
          unread: item.unread,
          updateTime: item.updateTime,
          lastMessage: item.lastMessage.content,
          to_user: {
            id: item.to_user.id,
            avatar: item.to_user.avatar,
            nickname: item.to_user.nickname,
          },
          from_user: {
            id: item.from_user.id,
            avatar: item.from_user.avatar,
            nickname: item.from_user.nickname,
          },
        };
      })
      .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
    return result;
  }
  // 清除所有未读消息,辅助函数
  async _clearUnreadMessage(from_id: number, to_id: number) {
    const chatList = await this.chatListRepository.findOne({
      where: {
        from_user: {
          id: from_id,
        },
        to_user: {
          id: to_id,
        },
      },
    });
    if (!chatList) return;
    chatList.unread = 0;
    await this.chatListRepository.save(chatList);
    return chatList;
  }

  // 获取聊天记录
  async getChatMessageList(from_id: number, to_id: number) {
    const toUserInfo = await this.userRepository.findOne({
      where: {
        id: to_id,
      },
    });
    const senderMessageList = await this.chatMessageRepository.find({
      where: {
        from_user: {
          id: from_id,
        },
        to_user: {
          id: to_id,
        },
      },
      relations: ['from_user', 'to_user'],
    });
    const receiverMessageList = await this.chatMessageRepository.find({
      where: {
        from_user: {
          id: to_id,
        },
        to_user: {
          id: from_id,
        },
      },
      relations: ['from_user', 'to_user'],
    });
    // 清除未读消息
    await this._clearUnreadMessage(to_id, from_id);
    return {
      toUserInfo: {
        id: toUserInfo.id,
        avatar: toUserInfo.avatar,
        nickname: toUserInfo.nickname,
      },
      messageList: senderMessageList
        .concat(receiverMessageList)
        .sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()),
    };
  }

  // 获得所有未读消息数量
  async getAllKindsOfMessageCount(userId: number) {
    // 未读消息数
    const receiverChatList = await this.chatListRepository.find({
      where: {
        to_user: {
          id: userId,
        },
      },
    });
    const unreadPrivateMessageCount = receiverChatList.reduce((prev, curr) => prev + curr.unread, 0);
    // 评论数
    const unreadCommentCount = await this.noteCommentRepository.count({
      where: {
        receiver: {
          id: userId,
        },
        isRead: false,
      },
    });
    // 收藏数
    const unreadCollectCount = await this.userNoteCollectRepository.count({
      where: {
        receiver: {
          id: userId,
        },
        isRead: false,
      },
    });
    //点赞数
    const unreadLikeCount = await this.userNoteLikeRepository.count({
      where: {
        receiver: {
          id: userId,
        },
        isRead: false,
      },
    });
    // 关注数
    const unreadFolloCount = await this.userFollowRepository.count({
      where: {
        follow: {
          id: userId,
        },
        isRead: false,
      },
    });
    return {
      unreadPrivateMessageCount,
      unreadCommentCount,
      unreadCollectCount,
      unreadLikeCount,
      unreadFolloCount,
    };
  }
}
