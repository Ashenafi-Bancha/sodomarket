import { Module } from '@nestjs/common';
import { ListingsModule } from './modules/listings/listings.module';
import { LeadsModule } from './modules/leads/leads.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { DealsModule } from './modules/deals/deals.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [ListingsModule, LeadsModule, AdminModule, AppointmentsModule, DealsModule, ReportsModule],
})
export class AppModule {}
