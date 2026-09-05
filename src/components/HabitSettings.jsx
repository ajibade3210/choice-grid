import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Settings2, RotateCcw, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import api from '../api/axios';
import { DEFAULT_HABITS } from '../utils/storage';

// Sortable Habit Row Item
const SortableHabitItem = ({ habit, index, onRemove, isSaving, canRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
        isDragging
          ? 'border-zinc-500 bg-zinc-100 dark:bg-zinc-800 shadow-md'
          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Drag only via GripVertical handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="touch-none p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          title="Drag to reorder habit"
          aria-label={`Drag to reorder ${habit.name}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono text-zinc-400 w-5">
          #{index + 1}
        </span>
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {habit.name}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(habit.id)}
        disabled={isSaving || !canRemove}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:hover:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        title={
          !canRemove
            ? 'Minimum 1 habit required'
            : `Remove ${habit.name}`
        }
        aria-label={`Remove habit ${habit.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const HabitSettings = ({ isOpen, onClose, habits, onSettingsUpdated }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Configure pointer sensor with 5px activation constraint to prevent accidental touch drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (!isOpen) return null;

  const handleSaveHabits = async (newHabitsArray) => {
    if (newHabitsArray.length < 1 || newHabitsArray.length > 10) {
      toast.error('Habits count must be between 1 and 10.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post('/api/settings', {
        habits: newHabitsArray,
      });

      toast.success('Habit settings saved!');
      if (onSettingsUpdated) {
        onSettingsUpdated(res.data.habits);
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to save habit settings';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    const trimmed = newHabitName.trim();
    if (!trimmed) {
      toast.error('Habit name cannot be empty.');
      return;
    }
    if (habits.length >= 10) {
      toast.error('Maximum 10 habits allowed.');
      return;
    }
    if (habits.some((h) => h.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('A habit with this name already exists.');
      return;
    }

    const newHabit = {
      id: `h-${Date.now()}`,
      name: trimmed,
    };

    handleSaveHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const handleRemoveHabit = (habitId) => {
    if (habits.length <= 1) {
      toast.error('Minimum 1 habit required.');
      return;
    }
    const updated = habits.filter((h) => h.id !== habitId);
    handleSaveHabits(updated);
  };

  const handleResetDefaults = () => {
    handleSaveHabits(DEFAULT_HABITS);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      const reordered = arrayMove(habits, oldIndex, newIndex);
      handleSaveHabits(reordered);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Habit Settings
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Drag to reorder daily habits (1 to 10 habits)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Habit Input */}
        <form onSubmit={handleAddHabit} className="flex gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            maxLength={30}
            placeholder={
              habits.length >= 10
                ? 'Limit reached (max 10 habits)'
                : 'New habit name (e.g. Read 20 mins)'
            }
            disabled={isSaving || habits.length >= 10}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSaving || habits.length >= 10 || !newHabitName.trim()}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add</span>
          </button>
        </form>

        {/* Current Habits List with Drag-and-Drop */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
            <span>Active Habits ({habits.length}/10)</span>
            <span>Action</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={habits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {habits.map((habit, index) => (
                  <SortableHabitItem
                    key={habit.id}
                    habit={habit}
                    index={index}
                    onRemove={handleRemoveHabit}
                    isSaving={isSaving}
                    canRemove={habits.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 5 defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitSettings;
