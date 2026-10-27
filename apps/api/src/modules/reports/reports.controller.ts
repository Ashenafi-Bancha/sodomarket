import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  @Get()
  @ApiOperation({ summary: 'Get submitted listing reports for admin review' })
  findAll() {
    return {
      success: true,
      data: [],
    };
  }

  @Post()
  @ApiOperation({ summary: 'Submit a report against a listing (fraud, duplicate, incorrect info)' })
  @ApiResponse({ status: 201, description: 'Report filed and queued for admin review.' })
  create(@Body() body: any) {
    return {
      success: true,
      message: 'Report submitted for review.',
      data: body,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report status (Under Review, Resolved, Dismissed)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return {
      success: true,
      reportId: id,
      newStatus: status,
    };
  }
}
