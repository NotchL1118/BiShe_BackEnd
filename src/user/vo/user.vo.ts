import { getAllNoteVo } from '../../note/vo/note.vo';
import { User } from '../entities/user.entity';
export type getUserUploadNotesVo = getAllNoteVo;

export interface getUserInfoVo extends User {
  followCount: number;
  fansCount: number;
  noteCount: number;
  isFollow: boolean;
}
