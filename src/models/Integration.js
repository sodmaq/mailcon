const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["mailchimp", "getresponse"],
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
    },
    serverPrefix: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    accountInfo: {
      type: Object,
      default: {},
    },
    lastValidated: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Integration", integrationSchema);
