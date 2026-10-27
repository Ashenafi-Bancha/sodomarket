import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  @Get('review-queue')
  @ApiOperation({ summary: 'Get listings awaiting administrator moderation' })
  getReviewQueue() {
    return {
      success: true,
      pendingCount: 0,
      queue: [],
    };
  }

  @Post('moderate')
  @ApiOperation({ summary: 'Approve or reject a listing with moderation feedback' })
  moderateListing(@Body() body: { listingId: string; action: 'APPROVE' | 'REJECT'; notes?: string }) {
    return {
      success: true,
      action: body.action,
      listingId: body.listingId,
      notes: body.notes,
    };
  }
}
