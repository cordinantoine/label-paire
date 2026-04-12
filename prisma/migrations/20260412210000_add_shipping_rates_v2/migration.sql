CREATE TABLE "ShippingRate" (
    "id"          TEXT NOT NULL,
    "country"     TEXT NOT NULL,
    "maxWeightKg" DOUBLE PRECISION NOT NULL,
    "priceEur"    DOUBLE PRECISION NOT NULL,
    "minDays"     INTEGER NOT NULL,
    "maxDays"     INTEGER NOT NULL,
    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);
