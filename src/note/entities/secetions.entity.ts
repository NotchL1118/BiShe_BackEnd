import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'note_sections',
})
export class NoteSections {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
    comment: '标签',
    unique: true,
  })
  label: string;

  @Column({
    length: 30,
    comment: '值',
    unique: true,
  })
  value: string;
}
