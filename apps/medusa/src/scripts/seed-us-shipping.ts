import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedUSShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const regionModuleService = container.resolve(Modules.REGION);

  logger.info("Finding US region...");
  const regions = await regionModuleService.listRegions({ name: "US" });
  if (!regions.length) {
    throw new Error("US region not found. Please create it first.");
  }
  const usRegion = regions[0];
  logger.info(`Found US region: ${usRegion.id}`);

  logger.info("Finding default sales channel...");
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (!defaultSalesChannel.length) {
    throw new Error("Default Sales Channel not found.");
  }
  logger.info(`Found sales channel: ${defaultSalesChannel[0].id}`);

  logger.info("Finding shipping profile...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  });
  if (!shippingProfiles.length) {
    throw new Error("Default shipping profile not found.");
  }
  const shippingProfile = shippingProfiles[0];
  logger.info(`Found shipping profile: ${shippingProfile.id}`);

  logger.info("Creating US stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "US Warehouse",
          address: {
            city: "San Francisco",
            country_code: "US",
            address_1: "123 Main St",
          },
        },
      ],
    },
  });
  const usStockLocation = stockLocationResult[0];
  logger.info(`Created US stock location: ${usStockLocation.id}`);

  logger.info("Linking stock location to fulfillment provider...");
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: usStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Creating US fulfillment set...");
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "US Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "US Zone",
        geo_zones: [
          {
            country_code: "us",
            type: "country",
          },
          {
            country_code: "cn",
            type: "country",
          },
          {
            country_code: "tw",
            type: "country",
          },
        ],
      },
    ],
  });
  logger.info(`Created fulfillment set: ${fulfillmentSet.id}`);

  logger.info("Linking fulfillment set to stock location...");
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: usStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  logger.info("Creating shipping options...");
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 5-7 business days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 500, // $5.00
          },
          {
            region_id: usRegion.id,
            amount: 500, // $5.00
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 2-3 business days.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 1500, // $15.00
          },
          {
            region_id: usRegion.id,
            amount: 1500, // $15.00
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished creating shipping options.");

  logger.info("Linking stock location to sales channel...");
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: usStockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info("✅ US shipping configuration completed successfully!");
}
