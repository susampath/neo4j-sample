import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    const greeting = await this.appService.getHello();
    return greeting;
  }
  @Post()
  async writeSample(): Promise<any> {
    const busInsert = await this.appService.writeSample();
    return busInsert;
  }
}
