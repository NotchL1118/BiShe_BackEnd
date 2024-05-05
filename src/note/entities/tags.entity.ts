import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'note_tags',
})
export class NoteTags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
    comment: '标签',
  })
  label: string;

  // @Column({
  //   length: 30,
  //   comment: '值',
  // })
  // value: string;

  @Column({
    comment: '使用次数',
    default: 0,
  })
  useCount: number;
}
