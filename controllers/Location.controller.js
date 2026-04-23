const bcService = require("../services/businessCentral.service");
const PartnerLocationLink = require("../models/PartnerLocationLink.model");

const getLocations = async (req, res) => {
  try {
    const locations = await bcService.getLocations();

    const results = { inserted: 0, updated: 0, failed: 0 };

    for (const loc of locations) {
      try {
        const { action } = await PartnerLocationLink.upsertFromBC({
          systemId:          loc.systemId,
          code:              loc.code,
          name:              loc.name,
          address:           loc.address,
          address2:          loc.address2,
          city:              loc.city,
          postCode:          loc.postCode,
          countryRegionCode: loc.countryRegionCode,
          phoneNo:           loc.phoneNo,
          faxNo:             loc.faxNo,
          contact:           loc.contact,
          eMail:             loc.eMail,
          homePage:          loc.homePage,
          county:            loc.county,
          useAsInTransit:    loc.useAsInTransit,
        });
        if (action === 'inserted') results.inserted++;
        else results.updated++;
      } catch (_) {
        results.failed++;
      }
    }

    res.status(200).json({
      success: true,
      count: locations.length,
      sync: results,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLocations };
