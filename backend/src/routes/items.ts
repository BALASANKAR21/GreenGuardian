import { Router } from "express";
import { z } from "zod";
import { store } from "../store/fileStore.js";

export const itemsRouter = Router();

const ItemInput = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional()
});

itemsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await store.items.getAll();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

itemsRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await store.items.getById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

itemsRouter.post("/", async (req, res, next) => {
  try {
    const data = ItemInput.parse(req.body);
    const created = await store.items.create(data);
    res.status(201).json(created);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.issues });
    next(e);
  }
});

itemsRouter.put("/:id", async (req, res, next) => {
  try {
    const data = ItemInput.partial()
      .refine(obj => Object.keys(obj).length > 0, "No fields provided")
      .parse(req.body);
    const updated = await store.items.update(req.params.id, data);
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.issues });
    next(e);
  }
});

itemsRouter.delete("/:id", async (req, res, next) => {
  try {
    const ok = await store.items.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: "Item not found" });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
