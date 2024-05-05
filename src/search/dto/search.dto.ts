export interface SearchInsertDto {
  id: number | string;
  title: string;
  content: string;
  section: string;
  tags: string[];
  authorNickname: string;
}
