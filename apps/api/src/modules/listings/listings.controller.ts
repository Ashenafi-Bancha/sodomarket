import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  @Get()
  @ApiOperation({ summary: 'Retrieve published marketplace listings with filters' })
  @ApiQuery({ name: 'assetType', required: false, enum: ['REAL_ESTATE', 'VEHICLE'] })
  @ApiQuery({ name: 'zone', required: false, description: 'Wolaita Sodo zone (e.g. Mehal Ketema, Merkato, Arada)' })
  @ApiQuery({ name: 'q', required: false, description: 'Text search query' })
  findAll(@Query('assetType') assetType?: string, @Query('zone') zone?: string, @Query('q') q?: string) {
    return {
      success: true,
      data: [],
      message: 'Filtered listings retrieved successfully.',
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single listing detail by slug' })
  findBySlug(@Param('slug') slug: string) {
    return {
      success: true,
      slug,
      message: 'Listing details retrieved.',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Submit listing for moderation (enters PENDING_REVIEW)' })
  @ApiResponse({ status: 201, description: 'Listing created and queued for review.' })
  create(@Body() createDto: any) {
    return {
      success: true,
      status: 'PENDING_REVIEW',
      message: 'Listing submitted for moderation review.',
      data: createDto,
    };
  }
}
