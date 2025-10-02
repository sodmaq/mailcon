const Integration = require("../models/Integration");
const MailchimpService = require("../services/mailchimp.service");
const GetResponseService = require("../services/getresponse.service");

// Helper function to get the appropriate service
const getService = (provider, apiKey) => {
  if (provider === "mailchimp") {
    return new MailchimpService(apiKey);
  } else if (provider === "getresponse") {
    return new GetResponseService(apiKey);
  }
  return null;
};

// 1. Store and validate ESP API key
exports.saveIntegration = async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    // Validation
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Provider and API key are required",
      });
    }

    if (provider !== "mailchimp" && provider !== "getresponse") {
      return res.status(400).json({
        success: false,
        message: 'Provider must be either "mailchimp" or "getresponse"',
      });
    }

    // Get appropriate service
    const service = getService(provider, apiKey);

    // Validate connection
    const validation = await service.validateConnection();

    if (!validation.isValid) {
      return res.status(validation.error.statusCode || 400).json({
        success: false,
        message: validation.error.message,
      });
    }

    // Check if integration already exists
    let integration = await Integration.findOne({ provider });

    if (integration) {
      // Update existing integration
      integration.apiKey = apiKey;
      if (provider === "mailchimp") {
        integration.serverPrefix = apiKey.split("-").pop();
      }
      integration.isActive = true;
      integration.accountInfo = validation.accountInfo;
      integration.lastValidated = new Date();
      await integration.save();
    } else {
      // Create new integration
      const integrationData = {
        provider,
        apiKey,
        isActive: true,
        accountInfo: validation.accountInfo,
        lastValidated: new Date(),
      };

      // Add serverPrefix only for Mailchimp
      if (provider === "mailchimp") {
        integrationData.serverPrefix = apiKey.split("-").pop();
      }

      integration = await Integration.create(integrationData);
    }

    res.status(200).json({
      success: true,
      message: `${
        provider.charAt(0).toUpperCase() + provider.slice(1)
      } integration saved and validated successfully`,
      data: {
        id: integration._id,
        provider: integration.provider,
        isActive: integration.isActive,
        accountInfo: integration.accountInfo,
        connectedAt: integration.lastValidated,
      },
    });
  } catch (error) {
    console.error("Save integration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 2. Verify connection to ESP platform
exports.verifyConnection = async (req, res) => {
  try {
    const { provider } = req.query;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message:
          "Provider query parameter is required (e.g., ?provider=mailchimp or ?provider=getresponse)",
      });
    }

    if (provider !== "mailchimp" && provider !== "getresponse") {
      return res.status(400).json({
        success: false,
        message: 'Provider must be either "mailchimp" or "getresponse"',
      });
    }

    // Find integration
    const integration = await Integration.findOne({ provider });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: `No ${provider} integration found. Please connect your account first.`,
        connected: false,
      });
    }

    // Get appropriate service and verify connection
    const service = getService(provider, integration.apiKey);
    const validation = await service.validateConnection();

    if (!validation.isValid) {
      // Update integration status
      integration.isActive = false;
      await integration.save();

      return res.status(validation.error.statusCode || 400).json({
        success: false,
        connected: false,
        message: validation.error.message,
      });
    }

    // Update last validated time
    integration.lastValidated = new Date();
    integration.isActive = true;
    integration.accountInfo = validation.accountInfo;
    await integration.save();

    return res.status(200).json({
      success: true,
      connected: true,
      message: "Connection verified successfully",
      data: {
        provider: provider,
        accountInfo: validation.accountInfo,
        lastValidated: integration.lastValidated,
      },
    });
  } catch (error) {
    console.error("Verify connection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 3. Get all lists/audiences
exports.getLists = async (req, res) => {
  try {
    const { provider } = req.query;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message:
          "Provider query parameter is required (e.g., ?provider=mailchimp or ?provider=getresponse)",
      });
    }

    if (provider !== "mailchimp" && provider !== "getresponse") {
      return res.status(400).json({
        success: false,
        message: 'Provider must be either "mailchimp" or "getresponse"',
      });
    }

    // Find integration
    const integration = await Integration.findOne({ provider, isActive: true });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: `No active ${provider} integration found. Please connect your account first.`,
      });
    }

    // Get appropriate service and fetch lists
    const service = getService(provider, integration.apiKey);
    const result = await service.getLists();

    if (!result.success) {
      return res.status(result.error.statusCode || 500).json({
        success: false,
        message: result.error.message,
      });
    }

    return res.status(200).json({
      success: true,
      provider: provider,
      count: result.lists.length,
      lists: result.lists,
    });
  } catch (error) {
    console.error("Get lists error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
