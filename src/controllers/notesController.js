import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  const { tag, search, page = 1, perPage = 10 } = req.query;

  const pageNumber = Math.max(parseInt(page, 10), 1);
  const limit = Math.max(parseInt(perPage, 10), 1);
  const skip = (pageNumber - 1) * limit;
  const notesQuery = Note.find({ userId: req.user._id });

  if (search) {
    notesQuery.where({ $text: { $search: search } });
  }

  if (tag) {
    notesQuery.where({ tag });
  }

  const [totalItems, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(limit),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    notes,
    totalItems,
    totalPages,
    page: pageNumber,
    perPage: limit,
  });
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(note);
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).send(note);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    {
      new: true,
    },
  );

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};
