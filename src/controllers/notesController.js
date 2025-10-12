import { Note } from '../models/note.js';
import createHttpError from 'http-errors';
import { TAGS } from '../constants/tags.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { tag, search, page = 1, perPage = 10 } = req.query;
    const filter = {};

    if (tag && TAGS.includes(tag)) {
      filter.tag = tag;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limit = Math.max(parseInt(perPage, 10), 1);
    const skip = (pageNumber - 1) * limit;

    const totalNotes = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalNotes / limit);

    const notes = await Note.find(filter).skip(skip).limit(limit);
    res.status(200).json({
      notes,
      totalNotes,
      totalPages,
      page: pageNumber,
      perPage: limit,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
    new: true,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
