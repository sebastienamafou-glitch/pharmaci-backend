import { Controller, Get, Post, Body } from '@nestjs/common';
import { HubsService } from './hubs.service';

@Controller('hubs')
export class HubsController {
  constructor(private readonly hubsService: HubsService) {}

  @Get()
  getAll() {
    return this.hubsService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.hubsService.create(body.nom, body.lat, body.lon, body.rayon);
  }
}
