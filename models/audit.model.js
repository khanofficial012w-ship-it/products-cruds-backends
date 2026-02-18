const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: string,
      required: true,
    },
    ipAddress: string,
    userAgent: String,

    metadata: {
      type: Object, // additional info
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
