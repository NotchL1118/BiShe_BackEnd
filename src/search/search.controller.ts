import { Controller, Get, ParseIntPipe, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { MyRequest } from 'src/types';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('getSearchTips')
  async handleGetSearchTips(@Query('keyword') keyword: string) {
    return await this.searchService.getSearchTips(keyword);
  }

  @Get('getSearchNotes')
  async handleGetSearchNotes(
    @Req() req: MyRequest,
    @Query('keyword') keyword: string,
    @Query('from', ParseIntPipe) from: number,
  ) {
    if (!from) from = 0;
    return await this.searchService.getSearchNotes(req.user.id, keyword, from);
  }
}
