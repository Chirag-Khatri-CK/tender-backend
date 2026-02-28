import mongoose from "mongoose";

const QualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    stream: { type: String },
    institute: { type: String },

    startYear: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear()
    },

    endYear: { // passing-year
      type: Number,
      required: true,
      validate: {
        validator: function (this: any, value: number) {
          if (!value) return true;
          if (!this.startYear) return true;
          return value >= this.startYear;
        },
        message: "End year must be greater than or equal to start year"
      }
    },

    grade: { type: String }
  },
  { _id: false }
);

const EngineerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    qualification: [QualificationSchema],
    experienceYears: { type: Number, min: 0, max: 80 },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    address: { type: String },
    aadhar: {
      type: String,
      match: /^[0-9]{12}$/,
      sparse: true
    },

    pan: {
      type: String,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      sparse: true
    },

    uan: {
      type: String,
      match: /^[0-9]{12}$/,
      sparse: true
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Engineer || mongoose.model("Engineer", EngineerSchema);
