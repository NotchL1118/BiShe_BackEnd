export interface getAllNoteVo {
  noteId: number;
  title: string;
  coverUrl: string;
  likeCount: number;
  isLike: boolean;
  author: {
    id: number;
    avatar: string | null;
    nickname: string;
  };
}

export interface getNoteDetailVo {
  id: number;
  urls: string[];
  type: number;
  title: string;
  content: string;
  tagList: string[]; // 标签
  coverUrl: string;
  author: {
    id: number;
    avatar: string | null;
    nickName: string;
    isFollow: boolean; // 是否关注了作者
  };
  createTime: Date;
  // 评论数、点赞数、收藏数另外接口获取
  likeCount: number; // 点赞数
  isLike: boolean; // 是否点赞了作品
  collectCount: number; // 收藏数
  isCollect: boolean; // 是否收藏了作品
  commentCount: number; // 评论数
}
