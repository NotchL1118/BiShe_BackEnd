import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchInsertDto } from './dto/search.dto';
import { pageSize } from 'src/constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from 'src/note/entities/note.entity';
import { Repository } from 'typeorm';
import { NoteService } from 'src/note/note.service';
@Injectable()
export class SearchService {
  @InjectRepository(Note)
  private readonly noteRepository: Repository<Note>;
  @Inject(forwardRef(() => NoteService))
  private readonly noteService: NoteService;
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async insert(data: SearchInsertDto[]): Promise<any> {
    if (data.length === 0) return;
    const operations = [];
    data.forEach((item) => {
      operations.push({ index: { _index: 'bs_note', _id: item.id } });
      operations.push(item);
    });
    return await this.elasticsearchService.bulk({
      operations,
    });
  }

  async delete(id: number | string): Promise<any> {
    return await this.elasticsearchService.deleteByQuery({
      index: 'bs_note',
      body: {
        query: {
          match: {
            id,
          },
        },
      },
    });
  }
  async update(data: { id: number | string; [key: string]: any }): Promise<any> {
    return await this.elasticsearchService.bulk({
      operations: [{ index: { _index: 'bs_note', _id: data.id } }, { data }],
    });
  }
  async _search(keyword: string, from: number = 0, size: number = pageSize): Promise<any> {
    return await this.elasticsearchService.search<SearchInsertDto>({
      index: 'bs_note',
      query: {
        multi_match: {
          query: keyword,
          fields: ['title', 'content', 'authorNickname', 'tags', 'section'],
        },
      },
      from,
      size,
    });
  }

  /**
   *  hits: {
   *    total: {
   *        value:number,
   *        relation: "eq"
   *    },
   *    max_score: number,
   *    hits:[
   *     {
   *      _index: string,
   *      _id: string,
   *     _score: number,
   *    _source: {
   *      id: number | string;
   *      title: string;
   *      content: string;
   *      section: string;
   *      tags: string[];
   *      authorNickname: string;
   *      }}
   *    ]
   *  }
   */
  // 获取搜索框的搜索结果
  async getSearchTips(keyword: string): Promise<string[]> {
    // 只需要前10个
    const result = await this._search(keyword, 0, 10);
    const tmp = result.hits.hits.map((item) => item._source.title) as string[];
    const res = [...new Set(tmp)];
    // 去重
    return res;
  }

  // 获取搜索的一些结果,内部调用
  async _getSearchResult(keyword: string, from: number = 0, size: number = pageSize): Promise<SearchInsertDto[]> {
    const result = await this._search(keyword, from * size, size);
    return result.hits.hits.map((item) => item._source);
  }

  async getSearchNotes(userId: number, keyword: string, from: number = 0, size: number = pageSize): Promise<any> {
    const notes = await this._getSearchResult(keyword, from * size, size);
    const ids = notes.map((item) => parseInt(item.id as string));
    const noteInfos = await this.noteService._getNoteListByIds(ids, userId);
    return noteInfos;
  }
}
