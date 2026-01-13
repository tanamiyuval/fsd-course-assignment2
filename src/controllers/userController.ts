import userModel from "../models/userModel";
import { Request, Response } from "express";

class UserController {
  model: typeof userModel;

  constructor() {
    this.model = userModel;
  }

  async getAll(res: Response) {
    try {
      const data = await this.model.find().select("-password");
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving users");
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = await this.model.findById(id).select("-password");
      if (!data) {
        return res.status(404).send("User not found");
      }
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving user by ID");
    }
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const updatedData = req.body;

    delete updatedData.password;

    try {
      const data = await this.model
        .findByIdAndUpdate(id, updatedData, { new: true })
        .select("-password");
      if (!data) {
        return res.status(404).send("User not found");
      }
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating user");
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const deleted = await this.model.findByIdAndDelete(id);
      if (deleted) {
        res.status(200).send("User deleted");
      } else {
        res.status(404).send("User not found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting user");
    }
  }
}

export default new UserController();
