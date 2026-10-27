import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  @Get()
  @ApiOperation({ summary: 'Get scheduled viewing appointments for authenticated broker' })
  findAll() {
    return {
      success: true,
      data: [],
    };
  }

  @Post()
  @ApiOperation({ summary: 'Schedule an on-site property or vehicle viewing in Wolaita Sodo' })
  @ApiResponse({ status: 201, description: 'Viewing appointment scheduled and confirmed.' })
  create(@Body() body: any) {
    return {
      success: true,
      message: 'Viewing appointment scheduled.',
      data: body,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status (Rescheduled, Completed, Cancelled)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return {
      success: true,
      appointmentId: id,
      newStatus: status,
    };
  }
}
