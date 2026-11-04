-- Feature checklists for listings (title deed, water tank, duty paid, bolo…).
ALTER TABLE "PropertyDetails" ADD COLUMN "features" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "VehicleDetails" ADD COLUMN "features" TEXT[] DEFAULT ARRAY[]::TEXT[];
