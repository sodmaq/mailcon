const axios = require("axios");

class GetResponseService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = "https://api.getresponse.com/v3";
  }

  // Validate API key by fetching account info
  async validateConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/accounts`, {
        headers: {
          "X-Auth-Token": `api-key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return {
        isValid: true,
        accountInfo: {
          accountId: response.data.accountId,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          companyName: response.data.companyName || "N/A",
          phone: response.data.phone || "N/A",
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: this.handleError(error),
      };
    }
  }

  // Fetch all campaigns (lists in GetResponse are called campaigns)
  async getLists() {
    try {
      const response = await axios.get(`${this.baseURL}/campaigns`, {
        headers: {
          "X-Auth-Token": `api-key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        params: {
          perPage: 1000, // Maximum campaigns to fetch
          sort: { createdOn: "desc" },
        },
      });

      // Also get campaign statistics for each campaign
      const campaignsWithStats = await Promise.all(
        response.data.map(async (campaign) => {
          try {
            const statsResponse = await axios.get(
              `${this.baseURL}/campaigns/${campaign.campaignId}/statistics`,
              {
                headers: {
                  "X-Auth-Token": `api-key ${this.apiKey}`,
                  "Content-Type": "application/json",
                },
              }
            );

            return {
              id: campaign.campaignId,
              name: campaign.name,
              description: campaign.description || "",
              languageCode: campaign.languageCode,
              isDefault: campaign.isDefault || false,
              createdAt: campaign.createdOn,
              // Statistics
              subscribersCount: statsResponse.data.subscriptions || 0,
              activeSubscribers: statsResponse.data.active || 0,
              unsubscribedCount: statsResponse.data.unsubscriptions || 0,
              removedCount: statsResponse.data.removed || 0,
              complaintsCount: statsResponse.data.complaints || 0,
            };
          } catch (statsError) {
            // If stats fail, return campaign without stats
            return {
              id: campaign.campaignId,
              name: campaign.name,
              description: campaign.description || "",
              languageCode: campaign.languageCode,
              isDefault: campaign.isDefault || false,
              createdAt: campaign.createdOn,
              subscribersCount: 0,
              activeSubscribers: 0,
              unsubscribedCount: 0,
              removedCount: 0,
              complaintsCount: 0,
            };
          }
        })
      );

      return {
        success: true,
        lists: campaignsWithStats,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // GetResponse API returned an error
      const status = error.response.status;
      const message = error.response.data.message || error.response.data.error;

      if (status === 401 || status === 403) {
        return {
          message: "Invalid API key or unauthorized access",
          statusCode: 401,
        };
      } else if (status === 429) {
        return {
          message: "Rate limit exceeded. Please try again later.",
          statusCode: 429,
        };
      } else if (status === 404) {
        return { message: "Resource not found", statusCode: 404 };
      } else {
        return {
          message: message || "GetResponse API error",
          statusCode: status,
        };
      }
    } else if (error.request) {
      // Network error
      return {
        message: "Network error. Please check your connection.",
        statusCode: 503,
      };
    } else {
      return { message: "An unexpected error occurred", statusCode: 500 };
    }
  }
}

module.exports = GetResponseService;
