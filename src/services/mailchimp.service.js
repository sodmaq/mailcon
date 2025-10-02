const axios = require("axios");

class MailchimpService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Extract server prefix from API key (everything after the last dash)
    this.serverPrefix = apiKey.split("-").pop();
    this.baseURL = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  // Validate API key by fetching account info
  async validateConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/`, {
        auth: {
          username: "anystring", // Mailchimp uses 'anystring' as username
          password: this.apiKey,
        },
      });

      return {
        isValid: true,
        accountInfo: {
          accountId: response.data.account_id,
          accountName: response.data.account_name,
          email: response.data.email,
          role: response.data.role,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: this.handleError(error),
      };
    }
  }

  // Fetch all lists/audiences
  async getLists() {
    try {
      const response = await axios.get(`${this.baseURL}/lists`, {
        auth: {
          username: "anystring",
          password: this.apiKey,
        },
        params: {
          count: 1000, // Maximum lists to fetch
        },
      });

      return {
        success: true,
        lists: response.data.lists.map((list) => ({
          id: list.id,
          name: list.name,
          memberCount: list.stats.member_count,
          subscribedCount: list.stats.member_count,
          unsubscribedCount: list.stats.unsubscribe_count,
          cleanedCount: list.stats.cleaned_count,
          createdAt: list.date_created,
          webId: list.web_id,
        })),
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
      // Mailchimp API returned an error
      const status = error.response.status;
      const message = error.response.data.detail || error.response.data.title;

      if (status === 401) {
        return { message: "Invalid API key", statusCode: 401 };
      } else if (status === 429) {
        return {
          message: "Rate limit exceeded. Please try again later.",
          statusCode: 429,
        };
      } else {
        return {
          message: message || "Mailchimp API error",
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

module.exports = MailchimpService;
