import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  @Get()
  @ApiOperation({ summary: 'Get assigned leads for authenticated broker' })
  findAll() {
    return {
      success: true,
      data: [],
    };
  }

  @Post()
  @ApiOperation({ summary: 'Submit public customer inquiry' })
  @ApiResponse({ status: 201, description: 'Lead recorded and routed to broker.' })
  create(@Body() body: any) {
    return {
      success: true,
      message: 'Inquiry received and lead created.',
      data: body,
    };
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update CRM pipeline stage (Contacted, Viewing Scheduled, Won, Lost)' })
  updateStage(@Param('id') id: string, @Body('stage') stage: string) {
    return {
      success: true,
      leadId: id,
      newStage: stage,
    };
  }
}
