import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  @Get()
  @ApiOperation({ summary: 'Get tracked deals and commissions for authenticated broker' })
  findAll() {
    return {
      success: true,
      data: [],
    };
  }

  @Post()
  @ApiOperation({ summary: 'Record a new deal with agreed price and commission tracking' })
  @ApiResponse({ status: 201, description: 'Deal recorded with commission details.' })
  create(@Body() body: any) {
    return {
      success: true,
      message: 'Deal recorded successfully.',
      data: body,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update deal status (Completed, Cancelled)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return {
      success: true,
      dealId: id,
      newStatus: status,
    };
  }

  @Patch(':id/commission')
  @ApiOperation({ summary: 'Update commission paid amount for a deal' })
  updateCommission(@Param('id') id: string, @Body('commissionPaid') commissionPaid: number) {
    return {
      success: true,
      dealId: id,
      commissionPaid,
    };
  }
}
