import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { generateUUID } from "../utils/uuid.js";

// Define Category Schema
const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      default: () => generateUUID(),
    },
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Create Category Model
const Category = mongoose.model("Category", categorySchema);

class categoriesModel {
  // create category
  static createCategory = async (categoryName, categoryDescription) => {
    try {
      // generate a unique uuid for the category
      const categoryId = generateUUID();

      // create category document
      const category = new Category({
        categoryId,
        categoryName,
        description: categoryDescription,
      });

      await category.save();
      return true;
    } catch (error) {
      console.log("error creating category", error);
      return false;
    }
  };

  // get all categories
  static getAllCategories = async () => {
    try {
      const categories = await Category.find({}).lean();
      return categories;
    } catch (error) {
      console.log("error getting categories", error);
      throw error;
    }
  };

  static getCategoryById = async (categoryId) => {
    try {
      const category = await Category.findOne({ categoryId }).lean();
      return category ? [category] : [];
    } catch (error) {
      console.log("error getting category by id ", error);
      throw error;
    }
  };

  static getCategoryByName = async (categoryName) => {
    try {
      const categories = await Category.find({
        categoryName: { $regex: categoryName, $options: "i" },
      }).lean();
      return categories;
    } catch (error) {
      console.log("error getting category by name", error);
      throw error;
    }
  };
}

export { categoriesModel, Category };
